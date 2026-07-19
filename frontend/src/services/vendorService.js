import api from './axiosInstance';

const vendorService = {
  getVendors: (params) => api.get('/vendors', { params }),
  getVendor: (id) => api.get(`/vendors/${id}`),
  createVendor: (data) => api.post('/vendors', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  updateVendor: (id, data) => api.put(`/vendors/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  deleteVendor: (id) => api.delete(`/vendors/${id}`),
  getVendorStats: (id) => api.get(`/vendors/${id}/stats`),
  uploadDocument: (id, data) => api.post(`/vendors/${id}/documents`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyProfile: () => api.get('/vendors/profile/me'),
  updateMyProfile: (data) => api.put('/vendors/profile/me', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
};

export default vendorService;
