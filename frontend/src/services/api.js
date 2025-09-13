import axios from 'axios';

// ===================================================================
// CONFIGURATION & SETUP
// ===================================================================

const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      }
    } catch (e) {
      // Fall through to process.env
    }
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// ===================================================================
// AXIOS INSTANCE CONFIGURATION
// ===================================================================

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds default timeout
});

// ===================================================================
// INTERCEPTORS
// ===================================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      if (!['/login', '/admin/login', '/hospital/login'].includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out:', error.message);
      error.message = 'Request timed out. The operation is taking longer than expected. Please try again.';
      error.userMessage = 'Operation timed out. Please try again or check your connection.';
    }
    
    if (!error.response && error.request) {
      error.userMessage = 'Network error - please check your internet connection.';
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url
      });
    }
    
    return Promise.reject(error);
  }
);

// ===================================================================
// API DEFINITIONS
// ===================================================================

const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingHospitals: (page = 1, limit = 10) => 
    api.get(`/admin/hospitals/pending?page=${page}&limit=${limit}`),
  
  verifyHospital: async (id, verificationData) => {
    try {
      console.log('Verifying hospital:', id, verificationData);
      const response = await api.put(`/admin/hospitals/${id}/verify`, verificationData, {
        timeout: 120000,
      });
      console.log('Hospital verification successful:', response.data);
      return response;
    } catch (error) {
      console.error('Hospital verification failed:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Hospital approval is taking longer than expected. Please check the admin dashboard to see if the approval was processed.');
      }
      
      throw error;
    }
  },
  
  createHospitalManager: (managerData) => api.post('/admin/create-hospital-manager', managerData, {
    timeout: 30000
  }),
  getHospitalDetails: (id) => api.get(`/admin/hospitals/${id}/details`),
  getAllUsers: (page = 1, limit = 20, role = 'all') => 
    api.get(`/admin/users?page=${page}&limit=${limit}&role=${role}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  createAdmin: (adminData) => api.post('/admin/create-admin', adminData, {
    timeout: 30000
  }),
  getMyAdmins: (page = 1, limit = 10) => 
    api.get(`/admin/my-admins?page=${page}&limit=${limit}`),
  updateAdminStatus: (id, statusData) => api.put(`/admin/admins/${id}/status`, statusData),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  generateCredentials: () => api.post('/admin/generate-credentials'),
  getAnalytics: (dateRange) => api.get('/admin/analytics', { params: dateRange }),
  getAuditLogs: (page = 1, limit = 50) => api.get(`/admin/audit-logs?page=${page}&limit=${limit}`),
};

const hospitalAPI = {
  register: (hospitalData) => {
    console.log('API DEBUG: Original hospital data received:');
    console.log(JSON.stringify(hospitalData, null, 2));
    
    const transformedData = {
      hospitalName: hospitalData.hospitalName,
      registrationNumber: hospitalData.registrationNumber,
      hospitalType: hospitalData.hospitalType,
      location: {
        address: hospitalData.location?.address || '',
        city: hospitalData.location?.city || '',
        state: hospitalData.location?.state || '',
        pinCode: hospitalData.location?.pinCode || hospitalData.location?.pincode || '000000'
      },
      contactInfo: {
        phone: hospitalData.contactInfo?.phone || '',
        email: hospitalData.contactInfo?.email || '',
        website: hospitalData.contactInfo?.website || ''
      },
      departments: hospitalData.departments || ['general'],
      facilities: hospitalData.facilities || [],
      services: hospitalData.services || [],
      operatingHours: hospitalData.operatingHours || {
        weekdays: { open: '08:00', close: '18:00' },
        weekends: { open: '09:00', close: '16:00' },
        emergency24x7: false
      }
    };

    if (hospitalData.licenseNumber && 
        typeof hospitalData.licenseNumber === 'string' && 
        hospitalData.licenseNumber.trim() !== '') {
      transformedData.licenseNumber = hospitalData.licenseNumber.trim();
    }

    if (hospitalData.accreditation && hospitalData.accreditation.length > 0) {
      transformedData.accreditation = hospitalData.accreditation;
    }

    if (hospitalData.establishedYear) {
      transformedData.establishedYear = hospitalData.establishedYear;
    }

    console.log('API DEBUG: Transformed data being sent to backend:');
    console.log(JSON.stringify(transformedData, null, 2));
    console.log('Making POST request to:', '/hospitals/register');
    
    return api.post('/hospitals/register', transformedData, {
      timeout: 30000
    });
  },

  getDetails: (id) => api.get(`/hospitals/${id}`),
  updateHospital: (id, hospitalData) => api.put(`/hospitals/${id}`, hospitalData, {
    timeout: 30000
  }),
  uploadDocuments: (id, formData) => api.post(`/hospitals/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000
  }),
  searchHospitals: (params) => api.get('/hospitals/search', { params }),
  getDashboard: (id) => api.get(`/hospitals/${id}/dashboard`),
  
  // FIXED: Use the original working endpoint
  getMyHospital: () => api.get('/hospitals/my-hospital'),
  
  getAllHospitals: (page = 1, limit = 20, status = 'all') => 
    api.get(`/hospitals?page=${page}&limit=${limit}&status=${status}`),
  getStatistics: (id) => api.get(`/hospitals/${id}/statistics`),
  updateOperatingHours: (id, hours) => api.put(`/hospitals/${id}/operating-hours`, hours),
  getReviews: (id, page = 1, limit = 10) => 
    api.get(`/hospitals/${id}/reviews?page=${page}&limit=${limit}`),
  updateBedAvailability: (id, bedData) => api.put(`/hospitals/${id}/beds`, bedData),

  // STAFF MANAGEMENT FUNCTIONS - All included and working
  getStaffStats: () => api.get('/hospital/stats'),
  getHospitalStaff: (params = {}) => {
    console.log('Getting hospital staff with params:', params);
    return api.get('/hospital/staff', { params });
  },
  addStaffMember: (staffData) => {
    console.log('Adding staff member:', staffData);
    return api.post('/staff', staffData);
  },
  updateStaffMember: (staffId, staffData) => {
    console.log('Updating staff member:', staffId, staffData);
    return api.put(`/staff/${staffId}`, staffData);
  },
  deleteStaffMember: (staffId) => {
    console.log('Deleting staff member:', staffId);
    return api.delete(`/staff/${staffId}`);
  },
  getStaffMember: (staffId) => api.get(`/staff/${staffId}`),
  getStaffByRole: (hospitalId, role) => 
    api.get(`/staff/hospital/${hospitalId}/role/${role}`),
  updateStaffAvailability: (staffId, availabilityData) => 
    api.put(`/staff/${staffId}/availability`, availabilityData),
};

const staffAPI = {
  create: (staffData) => api.post('/staff', staffData),
  getByHospital: (hospitalId, params = {}) => 
    api.get(`/staff/hospital/${hospitalId}`, { params }),
  getById: (id) => api.get(`/staff/${id}`),
  update: (id, staffData) => api.put(`/staff/${id}`, staffData),
  delete: (id) => api.delete(`/staff/${id}`),
  getByRole: (hospitalId, role) => 
    api.get(`/staff/hospital/${hospitalId}/role/${role}`),
  updateAvailability: (id, availabilityData) => 
    api.put(`/staff/${id}/availability`, availabilityData),
  getSchedule: (hospitalId, date) => 
    api.get(`/staff/hospital/${hospitalId}/schedule`, { params: { date } }),
  updateProfile: (id, profileData) => api.put(`/staff/${id}/profile`, profileData),
};

const patientAPI = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (patientData) => api.put('/patients/profile', patientData),
  getAppointments: (page = 1, limit = 10) => 
    api.get(`/patients/appointments?page=${page}&limit=${limit}`),
  bookAppointment: (appointmentData) => api.post('/patients/appointments', appointmentData),
  cancelAppointment: (id) => api.delete(`/patients/appointments/${id}`),
  getMedicalHistory: () => api.get('/patients/medical-history'),
  getPrescriptions: (page = 1, limit = 10) => 
    api.get(`/patients/prescriptions?page=${page}&limit=${limit}`),
  searchNearbyHospitals: (location, radius = 10) => 
    api.get('/patients/hospitals/nearby', { params: { ...location, radius } }),
};

const appointmentAPI = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  confirm: (id) => api.put(`/appointments/${id}/confirm`),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/appointments/slots`, { params: { doctorId, date } }),
};

const notificationAPI = {
  getAll: (page = 1, limit = 20) => 
    api.get(`/notifications?page=${page}&limit=${limit}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

const handleApiError = (error) => {
  if (error.code === 'ECONNABORTED') {
    return error.userMessage || 'Request timed out. Please try again.';
  }
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || 'Server error occurred';
    
    switch (status) {
      case 400:
        return `Bad Request: ${message}`;
      case 401:
        return 'Unauthorized: Please log in again';
      case 403:
        return 'Forbidden: You do not have permission to perform this action';
      case 404:
        return 'Not Found: The requested resource was not found';
      case 422:
        return `Validation Error: ${message}`;
      case 429:
        return 'Too Many Requests: Please try again later';
      case 500:
        return 'Internal Server Error: Please try again later';
      case 503:
        return 'Service Unavailable: Please try again later';
      default:
        return message;
    }
  } else if (error.request) {
    return 'Network error - please check your connection';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

const requestWithRetry = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      console.warn(`Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data,
      latency: Date.now() - performance.now()
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error)
    };
  }
};

const getApiInfo = () => ({
  baseURL: API_URL,
  timeout: api.defaults.timeout,
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
});

// ===================================================================
// EXPORTS - Single export block to avoid duplicates
// ===================================================================

export default api;

export {
  api,
  API_URL,
  authAPI,
  adminAPI,
  hospitalAPI,
  staffAPI,
  patientAPI,
  appointmentAPI,
  notificationAPI,
  handleApiError,
  requestWithRetry,
  testConnection,
  getApiInfo
};
