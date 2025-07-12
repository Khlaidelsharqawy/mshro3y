import { supabase } from './supabase-config.js';
import { TransitionManager, NotificationManager } from './utils.js';
import { UXManager } from './ux.js';
import { SecurityManager } from './security.js';

// التحقق من صلاحيات المدير
async function checkAdminAuth() {
  try {
    const { isAdmin, user, session } = await SecurityManager.checkAdminAuth();
    
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }

    if (!isAdmin) {
      NotificationManager.show('ليس لديك صلاحيات المدير', 'error');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
      return null;
    }

    return { session, user };
  } catch (error) {
    console.error('Error checking admin auth:', error);
    NotificationManager.show('حدث خطأ في التحقق من الصلاحيات', 'error');
    return null;
  }
}

// إدارة التنقل بين الأقسام
function setupNavigation() {
  const tabs = ['materialsTab', 'usersTab', 'accessTab', 'statsTab'];
  const sections = ['materialsSection', 'usersSection', 'accessSection', 'statsSection'];

  tabs.forEach((tabId, index) => {
    document.getElementById(tabId).addEventListener('click', () => {
      // إخفاء جميع الأقسام
      sections.forEach(sectionId => {
        document.getElementById(sectionId).classList.add('hidden');
      });

      // إزالة التفعيل من جميع الأزرار
      tabs.forEach(tab => {
        const element = document.getElementById(tab);
        element.classList.remove('border-indigo-500', 'text-indigo-600', 'font-medium');
        element.classList.add('border-transparent', 'text-gray-600');
      });

      // إظهار القسم المحدد
      document.getElementById(sections[index]).classList.remove('hidden');

      // تفعيل الزر المحدد
      const activeTab = document.getElementById(tabId);
      activeTab.classList.add('border-indigo-500', 'text-indigo-600', 'font-medium');
      activeTab.classList.remove('border-transparent', 'text-gray-600');

      // تحميل البيانات حسب القسم
      switch (index) {
        case 0:
          loadMaterials();
          break;
        case 1:
          loadUsers();
          break;
        case 2:
          loadAccess();
          break;
        case 3:
          loadStats();
          break;
      }
    });
  });
}

// إدارة المواد
function setupMaterialsManagement() {
  const addMaterialBtn = document.getElementById('addMaterialBtn');
  const addMaterialForm = document.getElementById('addMaterialForm');
  const cancelMaterialBtn = document.getElementById('cancelMaterialBtn');
  const materialForm = document.getElementById('materialForm');

  addMaterialBtn.addEventListener('click', () => {
    addMaterialForm.classList.remove('hidden');
  });

  cancelMaterialBtn.addEventListener('click', () => {
    addMaterialForm.classList.add('hidden');
    materialForm.reset();
  });

  materialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      title: document.getElementById('materialTitle').value,
      type: document.getElementById('materialType').value,
      subject_name: document.getElementById('materialSubject').value,
      price: parseFloat(document.getElementById('materialPrice').value),
      link: document.getElementById('materialLink').value,
      image_url: document.getElementById('materialImage').value,
      is_available: true,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('materials')
        .insert([formData]);

      if (error) throw error;

      alert('تم إضافة المادة بنجاح');
      addMaterialForm.classList.add('hidden');
      materialForm.reset();
      loadMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
      alert('حدث خطأ في إضافة المادة');
    }
  });
}

// تحميل المواد
async function loadMaterials() {
  const container = document.getElementById('materialsTable');
  
  try {
    const { data: materials, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!materials || materials.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center">لا توجد مواد متاحة</p>';
      return;
    }

    container.innerHTML = materials.map(material => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center space-x-4 space-x-reverse">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-xl">${getMaterialIcon(material.type)}</span>
          </div>
          <div>
            <h4 class="font-medium">${material.title}</h4>
            <p class="text-sm text-gray-600">${material.type} - ${material.subject_name || 'غير محدد'}</p>
            <p class="text-xs text-gray-500">${new Date(material.created_at).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 space-x-reverse">
          <span class="font-bold text-green-600">${material.price} جنيه</span>
          <button onclick="toggleMaterialStatus('${material.id}', ${material.is_available})" 
                  class="px-3 py-1 rounded text-sm ${material.is_available ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
            ${material.is_available ? 'إيقاف' : 'تفعيل'}
          </button>
          <button onclick="deleteMaterial('${material.id}')" 
                  class="px-3 py-1 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200">
            حذف
          </button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading materials:', error);
    container.innerHTML = '<p class="text-red-500 text-center">حدث خطأ في تحميل المواد</p>';
  }
}

// إدارة الصلاحيات
function setupAccessManagement() {
  const addAccessBtn = document.getElementById('addAccessBtn');
  const addAccessForm = document.getElementById('addAccessForm');
  const cancelAccessBtn = document.getElementById('cancelAccessBtn');
  const accessForm = document.getElementById('accessForm');

  addAccessBtn.addEventListener('click', () => {
    addAccessForm.classList.remove('hidden');
    loadMaterialsForAccess();
  });

  cancelAccessBtn.addEventListener('click', () => {
    addAccessForm.classList.add('hidden');
    accessForm.reset();
  });

  accessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      phone_number: document.getElementById('accessPhone').value,
      material_id: document.getElementById('accessMaterial').value,
      granted: true,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('access_by_phone')
        .insert([formData]);

      if (error) throw error;

      alert('تم منح الصلاحية بنجاح');
      addAccessForm.classList.add('hidden');
      accessForm.reset();
      loadAccess();
    } catch (error) {
      console.error('Error granting access:', error);
      alert('حدث خطأ في منح الصلاحية');
    }
  });
}

// تحميل المواد لقائمة الصلاحيات
async function loadMaterialsForAccess() {
  const select = document.getElementById('accessMaterial');
  
  try {
    const { data: materials, error } = await supabase
      .from('materials')
      .select('id, title, type')
      .eq('is_available', true)
      .order('title');

    if (error) throw error;

    select.innerHTML = '<option value="">اختر المادة</option>' + 
      materials.map(material => 
        `<option value="${material.id}">${material.title} (${material.type})</option>`
      ).join('');

  } catch (error) {
    console.error('Error loading materials for access:', error);
  }
}

// تحميل الصلاحيات
async function loadAccess() {
  const container = document.getElementById('accessTable');
  
  try {
    const { data: access, error } = await supabase
      .from('access_by_phone')
      .select(`
        *,
        materials!inner(title, type, price)
      `)
      .eq('granted', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!access || access.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center">لا توجد صلاحيات ممنوحة</p>';
      return;
    }

    container.innerHTML = access.map(item => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 class="font-medium">${item.materials.title}</h4>
          <p class="text-sm text-gray-600">${item.phone_number} - ${item.materials.type}</p>
          <p class="text-xs text-gray-500">${new Date(item.created_at).toLocaleDateString('ar-EG')}</p>
        </div>
        <div class="flex items-center space-x-2 space-x-reverse">
          <span class="font-bold text-green-600">${item.materials.price} جنيه</span>
          <button onclick="revokeAccess('${item.id}')" 
                  class="px-3 py-1 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200">
            إلغاء الصلاحية
          </button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading access:', error);
    container.innerHTML = '<p class="text-red-500 text-center">حدث خطأ في تحميل الصلاحيات</p>';
  }
}

// تحميل المستخدمين
async function loadUsers() {
  const container = document.getElementById('usersTable');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!users || users.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center">لا يوجد مستخدمين مسجلين</p>';
      return;
    }

    container.innerHTML = users.map(user => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 class="font-medium">${user.full_name || 'مستخدم بدون اسم'}</h4>
          <p class="text-sm text-gray-600">${user.phone_number}</p>
          <p class="text-xs text-gray-500">${new Date(user.created_at).toLocaleDateString('ar-EG')}</p>
        </div>
        <div class="flex items-center space-x-2 space-x-reverse">
          <span class="px-2 py-1 rounded text-xs ${user.is_admin ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}">
            ${user.is_admin ? 'مدير' : 'مستخدم'}
          </span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = '<p class="text-red-500 text-center">حدث خطأ في تحميل المستخدمين</p>';
  }
}

// تحميل الإحصائيات
async function loadStats() {
  try {
    // إجمالي المواد
    const { data: materials } = await supabase
      .from('materials')
      .select('id');
    document.getElementById('totalMaterials').textContent = materials?.length || 0;

    // إجمالي المستخدمين
    const { data: users } = await supabase
      .from('users')
      .select('id');
    document.getElementById('totalUsers').textContent = users?.length || 0;

    // إجمالي الصلاحيات
    const { data: access } = await supabase
      .from('access_by_phone')
      .select('id')
      .eq('granted', true);
    document.getElementById('totalAccess').textContent = access?.length || 0;

    // إجمالي المبيعات
    const { data: sales } = await supabase
      .from('access_by_phone')
      .select(`
        materials!inner(price)
      `)
      .eq('granted', true);

    const totalSales = sales?.reduce((sum, item) => sum + (item.materials?.price || 0), 0) || 0;
    document.getElementById('totalSales').textContent = `${totalSales} جنيه`;

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// دوال مساعدة
function getMaterialIcon(type) {
  switch (type) {
    case 'ماتريال': return '📘';
    case 'مشروع': return '💻';
    case 'بريزنتيشن': return '🖼️';
    default: return '📄';
  }
}

// دوال عامة (للوصول من HTML)
window.toggleMaterialStatus = async function(id, currentStatus) {
  try {
    const { error } = await supabase
      .from('materials')
      .update({ is_available: !currentStatus })
      .eq('id', id);

    if (error) throw error;

    loadMaterials();
  } catch (error) {
    console.error('Error toggling material status:', error);
    alert('حدث خطأ في تغيير حالة المادة');
  }
};

window.deleteMaterial = async function(id) {
  if (!confirm('هل أنت متأكد من حذف هذه المادة؟')) return;

  try {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    loadMaterials();
  } catch (error) {
    console.error('Error deleting material:', error);
    alert('حدث خطأ في حذف المادة');
  }
};

window.revokeAccess = async function(id) {
  if (!confirm('هل أنت متأكد من إلغاء هذه الصلاحية؟')) return;

  try {
    const { error } = await supabase
      .from('access_by_phone')
      .update({ granted: false })
      .eq('id', id);

    if (error) throw error;

    loadAccess();
  } catch (error) {
    console.error('Error revoking access:', error);
    alert('حدث خطأ في إلغاء الصلاحية');
  }
};

// تسجيل الخروج
function setupLogout() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });
}

// تهيئة الصفحة
async function initAdmin() {
  try {
    const auth = await checkAdminAuth();
    if (!auth) return;

    document.getElementById('adminName').textContent = auth.user.full_name || 'المدير';

    setupNavigation();
    setupMaterialsManagement();
    setupAccessManagement();
    setupLogout();

    // تحميل البيانات الأولية
    loadMaterials();
    loadStats();

  } catch (error) {
    console.error('Error initializing admin:', error);
    alert('حدث خطأ في تحميل لوحة الإدارة');
  }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initAdmin);
