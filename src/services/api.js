import axios from 'axios';

// Base API instance with proxy to PHP backend
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodrescue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear on login failure
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('foodrescue_token');
        localStorage.removeItem('foodrescue_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login.php', { email, password }),
  register: (data) => api.post('/auth/register.php', data),
  logout: () => api.post('/auth/logout.php'),
  me: () => api.get('/auth/me.php'),
  changePassword: (current_password, new_password) =>
    api.post('/auth/change-password.php', { current_password, new_password }),
};

export const donationsAPI = {
  list: (params) => api.get('/donations/list.php', { params }),
  get: (id) => api.get(`/donations/details.php?id=${id}`),
  create: (formData) => {
    // If FormData, let Axios set boundary
    if (formData instanceof FormData) {
      return api.post('/donations/create.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/donations/create.php', formData);
  },
  claim: (donation_id, notes) => api.post('/donations/claim.php', { donation_id, notes }),
  cancel: (donation_id, reason) => api.post('/donations/cancel.php', { donation_id, reason }),
  getRecommended: () => api.get('/donations/recommended.php'),
};

export const pickupsAPI = {
  schedule: (data) => api.post('/pickups/schedule.php', data),
  verify: (verification_code, donation_id) =>
    api.post('/pickups/verify.php', { verification_code, donation_id }),
  updateStatus: (donation_id, status) =>
    api.post('/pickups/update-status.php', { donation_id, status }),
};

export const notificationsAPI = {
  list: () => api.get('/notifications/list.php'),
  markRead: (id = null, mark_all = false) =>
    api.post('/notifications/read.php', { id, mark_all }),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile.php'),
  updateProfile: (data) => api.post('/users/profile.php', data),
  getImpact: (params) => api.get('/users/impact.php', { params }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard.php'),
  getAnalytics: () => api.get('/admin/analytics.php'),
  getUsers: (params) => api.get('/admin/users.php', { params }),
  verifyUser: (user_id, action, reason) =>
    api.post('/admin/verify-user.php', { user_id, action, reason }),
  getAuditLogs: () => api.get('/admin/audit-logs.php'),
};

export default api;
