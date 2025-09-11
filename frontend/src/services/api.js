import axios from 'axios';

// Check if we're in Vite or CRA environment
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env) 
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  : process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Regular Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  logout: () => api.post('/auth/logout')
};

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingHospitals: (page = 1, limit = 10) => api.get(`/admin/hospitals/pending?page=${page}&limit=${limit}`),
  verifyHospital: (id, verificationData) => api.put(`/admin/hospitals/${id}/verify`, verificationData),
  getAllUsers: (page = 1, limit = 20, role = 'all') => api.get(`/admin/users?page=${page}&limit=${limit}&role=${role}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  createAdmin: (adminData) => api.post('/admin/create-admin', adminData),
  getMyAdmins: (page = 1, limit = 10) => api.get(`/admin/my-admins?page=${page}&limit=${limit}`),
  updateAdminStatus: (id, statusData) => api.put(`/admin/admins/${id}/status`, statusData),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  generateCredentials: () => api.post('/admin/generate-credentials')
};

// Hospital API
export const hospitalAPI = {
  register: (hospitalData) => api.post('/hospitals/register', hospitalData),
  getDetails: (id) => api.get(`/hospitals/${id}`),
  updateHospital: (id, hospitalData) => api.put(`/hospitals/${id}`, hospitalData),
  uploadDocuments: (id, formData) => api.post(`/hospitals/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  searchHospitals: (params) => api.get('/hospitals/search', { params }),
  getDashboard: (id) => api.get(`/hospitals/${id}/dashboard`)
};

export default api;
