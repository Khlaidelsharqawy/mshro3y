import { supabase } from './supabase-config.js';
import { sendOTP, verifyOTP } from './otp.js';
import { NotificationManager, FormManager } from './utils.js';

// إدارة تسجيل الدخول
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorMsg = document.getElementById('errorMsg');
  const phone = document.getElementById('phone').value;

  // التحقق من صحة رقم الهاتف
  if (!FormManager.validatePhone(phone)) {
    FormManager.showFormError(document.getElementById('phone'), 'رقم الهاتف يجب أن يبدأ بـ +20 ويحتوي على 10 أرقام');
    return;
  }

  // إظهار حالة التحميل
  FormManager.setFormLoading(form, true);
  errorMsg.classList.add('hidden');

  try {
    // إرسال OTP
    const otpSent = await sendOTP(phone);
    if (!otpSent) throw new Error('فشل إرسال رمز التحقق');

    // طلب إدخال OTP
    const otp = prompt('للتطوير، استخدم الرمز: 123456\nأدخل رمز التحقق:');
    if (!otp) throw new Error('يجب إدخال رمز التحقق');

    // التحقق من OTP
    const isValidOTP = await verifyOTP(phone, otp);
    if (!isValidOTP) throw new Error('رمز التحقق غير صحيح');

    // تسجيل الدخول
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password: 'default_password' // كلمة مرور افتراضية للتطوير
    });

    if (error) {
      // إذا لم يكن المستخدم موجود، قم بإنشائه
      if (error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          phone,
          password: 'default_password',
          options: {
            data: {
              phone_number: phone
            }
          }
        });

        if (signUpError) throw signUpError;
        
        // حفظ بيانات المستخدم في جدول users
        await supabase.from('users').insert([
          {
            id: signUpData.user?.id,
            phone_number: phone,
            full_name: 'مستخدم جديد',
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        throw error;
      }
    }

    // توجيه المستخدم بعد النجاح
    NotificationManager.show('تم تسجيل الدخول بنجاح!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (error) {
    console.error('حدث خطأ:', error);
    errorMsg.textContent = error.message;
    errorMsg.classList.remove('hidden');
  } finally {
    // إعادة تفعيل الزر
    FormManager.setFormLoading(form, false);
  }
});

// إدارة إنشاء الحساب
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const errorMsg = document.getElementById('errorMsg');
  const fullName = document.getElementById('fullName').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  // التحقق من صحة البيانات
  let hasError = false;
  
  if (!fullName.trim()) {
    FormManager.showFormError(document.getElementById('fullName'), 'الاسم الكامل مطلوب');
    hasError = true;
  }
  
  if (!FormManager.validatePhone(phone)) {
    FormManager.showFormError(document.getElementById('phone'), 'رقم الهاتف يجب أن يبدأ بـ +20 ويحتوي على 10 أرقام');
    hasError = true;
  }
  
  if (password.length < 6) {
    FormManager.showFormError(document.getElementById('password'), 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    hasError = true;
  }

  if (hasError) return;

  // إظهار حالة التحميل
  FormManager.setFormLoading(form, true);
  errorMsg.classList.add('hidden');

  try {
    // 1. إرسال OTP
    const otpSent = await sendOTP(phone);
    if (!otpSent) throw new Error('فشل إرسال رمز التحقق');

    // 2. طلب إدخال OTP
    const otp = prompt('للتطوير، استخدم الرمز: 123456\nأدخل رمز التحقق:');
    if (!otp) throw new Error('يجب إدخال رمز التحقق');

    // 3. التحقق من OTP
    const isValidOTP = await verifyOTP(phone, otp);
    if (!isValidOTP) throw new Error('رمز التحقق غير صحيح');

    // 4. إنشاء الحساب في Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone
        }
      }
    });

    if (authError) throw authError;

    // 5. حفظ بيانات إضافية في جدول users
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.id,
          phone_number: phone,
          full_name: fullName,
          created_at: new Date().toISOString()
        }
      ]);

    if (dbError) throw dbError;

    // 6. توجيه المستخدم بعد النجاح
    NotificationManager.show('تم إنشاء الحساب بنجاح!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (error) {
    console.error('حدث خطأ:', error);
    errorMsg.textContent = error.message;
    errorMsg.classList.remove('hidden');
    
    // إبقاء البيانات المدخلة
    document.getElementById('fullName').value = fullName;
    document.getElementById('phone').value = phone;
    document.getElementById('password').value = password;
    
  } finally {
    // إعادة تفعيل الزر
    FormManager.setFormLoading(form, false);
  }
});