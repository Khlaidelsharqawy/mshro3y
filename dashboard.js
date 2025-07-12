import { supabase } from './supabase-config.js';
import { TransitionManager, NotificationManager } from './utils.js';

// تحميل بيانات المستخدم
async function loadUserData() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) throw error;

    // عرض اسم المستخدم
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = user.full_name || 'المستخدم';
    }

    return user;
  } catch (error) {
    console.error('Error loading user data:', error);
    NotificationManager.show('حدث خطأ في تحميل بيانات المستخدم', 'error');
  }
}

// تحميل الإحصائيات
async function loadStats() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!user) return;

    // جلب عدد المواد المتاحة
    const { data: materials } = await supabase
      .from('materials')
      .select('id')
      .eq('is_available', true);

    // جلب عدد الصلاحيات الممنوحة
    const { data: access } = await supabase
      .from('access_by_phone')
      .select('id')
      .eq('phone_number', user.phone_number)
      .eq('granted', true);

    // تحديث الإحصائيات
    const materialsCountElement = document.getElementById('materialsCount');
    const accessCountElement = document.getElementById('accessCount');
    const totalSpentElement = document.getElementById('totalSpent');

    if (materialsCountElement) {
      materialsCountElement.textContent = materials?.length || 0;
    }

    if (accessCountElement) {
      accessCountElement.textContent = access?.length || 0;
    }

    if (totalSpentElement) {
      // حساب إجمالي المشتريات (يمكن تحسين هذا لاحقاً)
      const totalSpent = (access?.length || 0) * 50; // افتراض أن كل مادة بـ 50 جنيه
      totalSpentElement.textContent = `${totalSpent} جنيه`;
    }

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// تحميل آخر المشتريات
async function loadRecentPurchases() {
  try {
    const container = document.getElementById('recentPurchases');
    if (!container) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!user) return;

    // جلب آخر الصلاحيات الممنوحة
    const { data: recentAccess } = await supabase
      .from('access_by_phone')
      .select(`
        *,
        materials (
          title,
          type,
          price
        )
      `)
      .eq('phone_number', user.phone_number)
      .eq('granted', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!recentAccess || recentAccess.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <div class="text-gray-400 text-4xl mb-4">🛒</div>
          <p class="text-gray-600">لا توجد مشتريات حديثة</p>
        </div>
      `;
      return;
    }

    // عرض المشتريات
    container.innerHTML = recentAccess.map(access => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center">
          <div class="p-2 rounded-full bg-green-100 text-green-600 mr-3">
            ${getMaterialIcon(access.materials?.type || 'ماتريال')}
          </div>
          <div>
            <h4 class="font-medium text-gray-800">${access.materials?.title || 'مادة غير معروفة'}</h4>
            <p class="text-sm text-gray-600">${access.materials?.type || 'ماتريال'}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold text-green-600">${access.materials?.price || 0} جنيه</p>
          <p class="text-xs text-gray-500">${formatDate(access.created_at)}</p>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading recent purchases:', error);
    const container = document.getElementById('recentPurchases');
    if (container) {
      TransitionManager.showError(container, 'حدث خطأ في تحميل المشتريات الحديثة');
    }
  }
}

// الحصول على أيقونة المادة
function getMaterialIcon(type) {
  const icons = {
    'ماتريال': '📘',
    'مشروع': '💻',
    'بريزنتيشن': '🖼️'
  };
  return icons[type] || '📘';
}

// تنسيق التاريخ
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// إدارة تسجيل الخروج
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await supabase.auth.signOut();
        NotificationManager.show('تم تسجيل الخروج بنجاح', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } catch (error) {
        console.error('Error signing out:', error);
        NotificationManager.show('حدث خطأ في تسجيل الخروج', 'error');
      }
    });
  }
}

// تهيئة الصفحة
async function initDashboard() {
  try {
    // إظهار حالة التحميل
    const main = document.querySelector('main');
    if (main) {
      TransitionManager.showLoading(main, 'جاري تحميل لوحة التحكم...');
    }

    // تحميل البيانات
    await loadUserData();
    await loadStats();
    await loadRecentPurchases();

    // إخفاء حالة التحميل
    if (main) {
      TransitionManager.hideLoading(main);
    }

    // إعداد تسجيل الخروج
    setupLogout();

    // إضافة تأثيرات انتقالية
    const cards = document.querySelectorAll('.bg-white');
    TransitionManager.staggerElements(cards, 100);

  } catch (error) {
    console.error('Error initializing dashboard:', error);
    NotificationManager.show('حدث خطأ في تحميل لوحة التحكم', 'error');
  }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initDashboard); 