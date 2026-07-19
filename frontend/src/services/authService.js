import api from './axiosInstance';

const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updateProfile: (data) => api.put('/auth/update-profile', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  changePassword: (data) => api.put('/auth/change-password', data),
  updateNotificationPreferences: (data) => api.put('/auth/notifications/preferences', data),
};

export default authService;
