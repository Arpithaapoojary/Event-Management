import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach admin key if logged in
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
  if (token) {
    config.headers['x-admin-key'] = token;
  }
  return config;
});

// Response interceptor for consistent error handling and session control
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // 1. Session expired / Unauthenticated (401)
    if (status === 401 && currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
      sessionStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login?reason=expired';
    }

    // 2. Forbidden / Insufficient administrative privileges (403)
    if (status === 403 && currentPath.startsWith('/admin') && currentPath !== '/admin/forbidden') {
      window.location.href = '/admin/forbidden';
    }

    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
