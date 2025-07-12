// الملف الرئيسي لتطبيق ماتريالك
// يقوم بتهيئة جميع الميزات والتحسينات

import { initPerformance } from './performance.js';
import { initUX } from './ux.js';
import { SecurityManager } from './security.js';
import { NotificationManager } from './utils.js';

// تهيئة التطبيق
class MataryalkApp {
  constructor() {
    this.isInitialized = false;
    this.currentPage = this.getCurrentPage();
  }

  // الحصول على الصفحة الحالية
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '');
  }

  // تهيئة الأداء
  async initPerformance() {
    try {
      await initPerformance();
      console.log('✅ تم تهيئة نظام الأداء بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة نظام الأداء:', error);
    }
  }

  // تهيئة تجربة المستخدم
  async initUX() {
    try {
      await initUX();
      console.log('✅ تم تهيئة نظام تجربة المستخدم بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة نظام تجربة المستخدم:', error);
    }
  }

  // تهيئة الأمان
  async initSecurity() {
    try {
      // تنظيف rate limit cache كل 5 دقائق
      setInterval(() => {
        SecurityManager.cleanRateLimit();
      }, 5 * 60 * 1000);

      console.log('✅ تم تهيئة نظام الأمان بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة نظام الأمان:', error);
    }
  }

  // تهيئة التنقل
  initNavigation() {
    try {
      // إضافة تأثيرات للروابط
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        if (link.href.startsWith(window.location.origin)) {
          link.addEventListener('click', (e) => {
            // إضافة تأثير النقر
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            link.appendChild(ripple);
            
            setTimeout(() => {
              ripple.remove();
            }, 600);
          });
        }
      });

      // إضافة تأثيرات للأزرار
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          // إضافة تأثير النقر
          const ripple = document.createElement('span');
          ripple.className = 'ripple-effect';
          button.appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
          }, 600);
        });
      });

      console.log('✅ تم تهيئة نظام التنقل بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة نظام التنقل:', error);
    }
  }

  // تهيئة التمرير
  initScrollEffects() {
    try {
      // إضافة تأثيرات التمرير للعناصر
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-revealed');
          }
        });
      }, observerOptions);

      // مراقبة العناصر التي تحتاج تأثيرات التمرير
      const scrollElements = document.querySelectorAll('.scroll-reveal, .card, .btn');
      scrollElements.forEach(el => {
        observer.observe(el);
      });

      console.log('✅ تم تهيئة تأثيرات التمرير بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة تأثيرات التمرير:', error);
    }
  }

  // تهيئة النماذج
  initForms() {
    try {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        // إضافة تأثيرات للنماذج
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          // إضافة تأثير التركيز
          input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
          });

          input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
          });

          // إضافة تأثير الكتابة
          input.addEventListener('input', () => {
            input.parentElement.classList.add('typing');
            clearTimeout(input.timeout);
            input.timeout = setTimeout(() => {
              input.parentElement.classList.remove('typing');
            }, 1000);
          });
        });
      });

      console.log('✅ تم تهيئة النماذج بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة النماذج:', error);
    }
  }

  // تهيئة الإشعارات
  initNotifications() {
    try {
      // إضافة زر إغلاق للإشعارات
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('notification-close')) {
          e.target.closest('.notification').remove();
        }
      });

      console.log('✅ تم تهيئة نظام الإشعارات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة نظام الإشعارات:', error);
    }
  }

  // تهيئة التحميل
  initLoadingStates() {
    try {
      // إضافة تأثيرات التحميل للروابط
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        if (link.href.startsWith(window.location.origin)) {
          link.addEventListener('click', () => {
            // إظهار حالة التحميل
            document.body.classList.add('loading');
          });
        }
      });

      // إخفاء حالة التحميل عند اكتمال تحميل الصفحة
      window.addEventListener('load', () => {
        document.body.classList.remove('loading');
      });

      console.log('✅ تم تهيئة حالات التحميل بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تهيئة حالات التحميل:', error);
    }
  }

  // تهيئة التطبيق بالكامل
  async init() {
    if (this.isInitialized) return;

    try {
      console.log('🚀 بدء تهيئة تطبيق ماتريالك...');

      // تهيئة الأنظمة الأساسية
      await this.initPerformance();
      await this.initUX();
      await this.initSecurity();

      // تهيئة الميزات التفاعلية
      this.initNavigation();
      this.initScrollEffects();
      this.initForms();
      this.initNotifications();
      this.initLoadingStates();

      this.isInitialized = true;
      console.log('✅ تم تهيئة تطبيق ماتريالك بنجاح!');

      // إظهار رسالة ترحيب
      if (this.currentPage === 'index') {
        NotificationManager.show('مرحباً بك في منصة ماتريالك التعليمية! 🎓', 'info', 5000);
      }

    } catch (error) {
      console.error('❌ خطأ في تهيئة التطبيق:', error);
      NotificationManager.show('حدث خطأ في تهيئة التطبيق', 'error');
    }
  }

  // تنظيف الموارد
  cleanup() {
    try {
      // تنظيف الذاكرة
      if (window.performance && window.performance.memory) {
        console.log('🧹 تنظيف الذاكرة...');
      }

      // إزالة المستمعين
      document.removeEventListener('click', this.handleClick);
      
      console.log('✅ تم تنظيف الموارد بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تنظيف الموارد:', error);
    }
  }
}

// إنشاء مثيل التطبيق
const app = new MataryalkApp();

// تهيئة التطبيق عند تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// تنظيف الموارد عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
  app.cleanup();
});

// تصدير التطبيق للاستخدام في الملفات الأخرى
export default app; 