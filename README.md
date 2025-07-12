# منصة ماتريالك التعليمية 🎓

منصة تعليمية متكاملة لبيع وشراء المواد الدراسية والمشاريع الجاهزة والعروض التقديمية.

## ✨ المميزات

### 🎨 واجهة مستخدم احترافية
- تصميم عصري ومتجاوب مع جميع الأجهزة
- انتقالات ديناميكية سلسة
- تجربة مستخدم محسنة
- دعم كامل للغة العربية

### 🔐 نظام مصادقة آمن
- تسجيل دخول برقم الهاتف
- نظام OTP للتحقق
- إدارة جلسات آمنة
- صلاحيات مختلفة للمستخدمين

### 📚 إدارة المحتوى
- **المواد الدراسية**: ملخصات وشروحات
- **المشاريع الجاهزة**: مشاريع تخرج ومشاريع مواد
- **العروض التقديمية**: باوربوينت جاهز

### 💼 لوحة إدارة متكاملة
- إضافة وتعديل وحذف المواد
- إدارة المستخدمين والصلاحيات
- إحصائيات مفصلة
- نظام منح الصلاحيات

### 💰 نظام مبيعات
- أسعار واضحة
- ربط مع واتساب للتواصل
- تتبع المشتريات
- إدارة الصلاحيات

## 🚀 التقنيات المستخدمة

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Icons**: Emoji + SVG
- **Fonts**: Tajawal (عربية)

## 📁 هيكل المشروع

```
mataryalk_project/
├── index.html              # الصفحة الرئيسية
├── login.html              # صفحة تسجيل الدخول
├── register.html           # صفحة إنشاء حساب
├── dashboard.html          # لوحة التحكم
├── materials.html          # صفحة المواد الدراسية
├── projects.html           # صفحة المشاريع
├── presentations.html      # صفحة العروض التقديمية
├── admin.html              # لوحة الإدارة
├── style.css               # ملف الأنماط
├── supabase-config.js      # إعدادات Supabase
├── auth.js                 # إدارة المصادقة
├── otp.js                  # إدارة رموز التحقق
├── dashboard.js            # لوحة التحكم
├── materials.js            # إدارة المواد
├── projects.js             # إدارة المشاريع
├── presentations.js        # إدارة العروض
├── admin.js                # لوحة الإدارة
└── README.md               # توثيق المشروع
```

## 🛠️ التثبيت والإعداد

### 1. متطلبات النظام
- متصفح ويب حديث
- اتصال بالإنترنت
- حساب Supabase

### 2. إعداد قاعدة البيانات
قم بإنشاء الجداول التالية في Supabase:

#### جدول المستخدمين (users)
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### جدول المواد (materials)
```sql
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  subject_name TEXT,
  price DECIMAL(10,2) NOT NULL,
  link TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### جدول الصلاحيات (access_by_phone)
```sql
CREATE TABLE access_by_phone (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  material_id UUID REFERENCES materials(id),
  granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. إعداد Supabase
1. أنشئ مشروع جديد في [Supabase](https://supabase.com)
2. انسخ URL و API Key
3. عدّل `supabase-config.js` بالمعلومات الصحيحة

### 4. تشغيل المشروع
```bash
# افتح المشروع في متصفح ويب
# أو استخدم خادم محلي
python -m http.server 8000
# أو
npx serve .
```

## 📱 كيفية الاستخدام

### للمستخدمين العاديين
1. **التسجيل**: إنشاء حساب برقم الهاتف
2. **استعراض المحتوى**: تصفح المواد والمشاريع والعروض
3. **الشراء**: التواصل عبر واتساب لشراء المحتوى
4. **الوصول**: بعد الدفع، سيتم منحك صلاحية الوصول

### للمديرين
1. **تسجيل الدخول**: استخدام حساب المدير
2. **إدارة المحتوى**: إضافة وتعديل وحذف المواد
3. **إدارة المستخدمين**: مراقبة المستخدمين المسجلين
4. **منح الصلاحيات**: منح صلاحيات الوصول للمستخدمين
5. **الإحصائيات**: مراقبة المبيعات والأداء

## 🔧 التخصيص

### تغيير الألوان
عدّل متغيرات CSS في `style.css`:
```css
:root {
  --primary-color: #4f46e5;
  --secondary-color: #7c3aed;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}
```

### إضافة أنواع محتوى جديدة
1. أضف الخيار في `admin.html`
2. عدّل `admin.js` لمعالجة النوع الجديد
3. أضف أيقونة مناسبة في `getMaterialIcon()`

### تخصيص رسائل واتساب
عدّل النصوص في ملفات JavaScript:
```javascript
const whatsappMessage = `مرحبًا، أريد شراء ${item.title}`;
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ في الاتصال بـ Supabase**
   - تحقق من URL و API Key
   - تأكد من إعدادات CORS

2. **مشاكل في المصادقة**
   - تحقق من إعدادات Auth في Supabase
   - تأكد من صحة رقم الهاتف

3. **مشاكل في عرض المحتوى**
   - تحقق من صلاحيات الجداول
   - تأكد من وجود بيانات في قاعدة البيانات

### سجلات الأخطاء
افتح Developer Tools (F12) لمراقبة الأخطاء في Console.

## 📈 التحسينات المستقبلية

- [ ] نظام دفع إلكتروني
- [ ] تطبيق موبايل
- [ ] نظام تقييمات ومراجعات
- [ ] نظام إشعارات
- [ ] دعم الملفات الكبيرة
- [ ] نظام العضويات
- [ ] تحليلات متقدمة
- [ ] نظام الدردشة المباشرة

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد
3. إجراء التغييرات
4. إرسال Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 📞 الدعم

للحصول على الدعم:
- 📧 البريد الإلكتروني: support@mataryalk.com
- 💬 واتساب: +201007289679
- 🌐 الموقع: https://mataryalk.com

---

**تم تطوير هذا المشروع بـ ❤️ لخدمة المجتمع التعليمي**