// دوال مساعدة عامة للمشروع

// إدارة الانتقالات والتحميل
export class TransitionManager {
  static showLoading(element, message = 'جاري التحميل...') {
    element.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="mr-3 text-gray-600">${message}</span>
      </div>
    `;
  }

  static showError(element, message, showRetry = true) {
    element.innerHTML = `
      <div class="text-center py-12">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">حدث خطأ</h3>
        <p class="text-gray-600 mb-4">${message}</p>
        ${showRetry ? `
          <button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            إعادة المحاولة
          </button>
        ` : ''}
      </div>
    `;
  }

  static showEmpty(element, icon, title, message) {
    element.innerHTML = `
      <div class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">${icon}</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
        <p class="text-gray-600">${message}</p>
      </div>
    `;
  }

  static animateElement(element, animation = 'fadeIn') {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      element.style.transition = 'all 0.5s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100);
  }

  static staggerElements(elements, delay = 100) {
    elements.forEach((element, index) => {
      setTimeout(() => {
        this.animateElement(element);
      }, index * delay);
    });
  }
}

// إدارة الإشعارات
export class NotificationManager {
  static show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const colors = {
      success: 'bg-green-100 border-green-400 text-green-700',
      error: 'bg-red-100 border-red-400 text-red-700',
      warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      info: 'bg-blue-100 border-blue-400 text-blue-700'
    };

    notification.className += ` ${colors[type]} border`;
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">${this.getIcon(type)}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="mr-2 text-lg hover:opacity-70">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // إظهار الإشعار
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // إخفاء الإشعار تلقائياً
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }

  static getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
}

// إدارة التخزين المحلي
export class StorageManager {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

// إدارة النماذج
export class FormManager {
  static validatePhone(phone) {
    const phoneRegex = /^\+20\d{10}$/;
    return phoneRegex.test(phone);
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static showFormError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-600 text-sm mt-1';
    errorDiv.textContent = message;
    
    // إزالة رسائل الخطأ السابقة
    const existingError = element.parentElement.querySelector('.text-red-600');
    if (existingError) {
      existingError.remove();
    }
    
    element.parentElement.appendChild(errorDiv);
    element.classList.add('border-red-500');
  }

  static clearFormError(element) {
    const errorDiv = element.parentElement.querySelector('.text-red-600');
    if (errorDiv) {
      errorDiv.remove();
    }
    element.classList.remove('border-red-500');
  }

  static setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.dataset.originalText || submitBtn.textContent;
    
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = originalText;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        جاري المعالجة...
      `;
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

// إدارة التنقل
export class NavigationManager {
  static addActiveClass(activeElement) {
    // إزالة الفئة النشطة من جميع العناصر
    const navItems = document.querySelectorAll('nav a, nav button');
    navItems.forEach(item => {
      item.classList.remove('border-indigo-500', 'text-indigo-600', 'font-medium');
      item.classList.add('border-transparent', 'text-gray-600');
    });

    // إضافة الفئة النشطة للعنصر المحدد
    if (activeElement) {
      activeElement.classList.add('border-indigo-500', 'text-indigo-600', 'font-medium');
      activeElement.classList.remove('border-transparent', 'text-gray-600');
    }
  }

  static smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

// إدارة الصور
export class ImageManager {
  static preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  static getPlaceholderImage(type) {
    const placeholders = {
      material: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yp9mE2YHZitivPC90ZXh0Pgo8L3N2Zz4K',
      project: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yp9mE2YHZitivPC90ZXh0Pgo8L3N2Zz4K',
      presentation: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yp9mE2YHZitivPC90ZXh0Pgo8L3N2Zz4K'
    };
    return placeholders[type] || placeholders.material;
  }
}

// إدارة التواريخ
export class DateManager {
  static formatDate(date, locale = 'ar-EG') {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static formatDateTime(date, locale = 'ar-EG') {
    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    
    return this.formatDate(date);
  }
}

// إدارة الأرقام والعملة
export class CurrencyManager {
  static formatPrice(price, currency = 'جنيه') {
    return `${parseFloat(price).toLocaleString('ar-EG')} ${currency}`;
  }

  static formatNumber(number) {
    return number.toLocaleString('ar-EG');
  }
}

// تصدير جميع المديرين
export default {
  TransitionManager,
  NotificationManager,
  StorageManager,
  FormManager,
  NavigationManager,
  ImageManager,
  DateManager,
  CurrencyManager
}; 