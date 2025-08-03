import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateDetails: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  getUsers: (params) => api.get('/auth/users', { params }),
  getUser: (id) => api.get(`/auth/users/${id}`),
  updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Vehicle API
export const vehicleAPI = {
  createApplication: (vehicleData) => api.post('/vehicles', vehicleData),
  getApplications: (params) => api.get('/vehicles', { params }),
  getApplication: (id) => api.get(`/vehicles/${id}`),
  updateApplication: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  deleteApplication: (id) => api.delete(`/vehicles/${id}`),
  addAdminNote: (id, note) => api.post(`/vehicles/${id}/notes`, note),
  getStats: () => api.get('/vehicles/stats'),
};

// License API
export const licenseAPI = {
  createApplication: (licenseData) => api.post('/licenses', licenseData),
  getApplications: (params) => api.get('/licenses', { params }),
  getApplication: (id) => api.get(`/licenses/${id}`),
  updateApplication: (id, licenseData) => api.put(`/licenses/${id}`, licenseData),
  deleteApplication: (id) => api.delete(`/licenses/${id}`),
  getStats: () => api.get('/licenses/stats'),
};

// Transport API
export const transportAPI = {
  getRoutes: (params) => api.get('/transport', { params }),
  getRoute: (id) => api.get(`/transport/${id}`),
  createRoute: (routeData) => api.post('/transport', routeData),
  updateRoute: (id, routeData) => api.put(`/transport/${id}`, routeData),
  deleteRoute: (id) => api.delete(`/transport/${id}`),
  updateRealTime: (id, realTimeData) => api.post(`/transport/${id}/realtime`, realTimeData),
  searchByLocation: (params) => api.get('/transport/search/location', { params }),
  getStats: () => api.get('/transport/stats'),
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// Health check
export const healthCheck = () => api.get('/health');

export default api; 