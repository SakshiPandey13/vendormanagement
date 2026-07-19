import api from './axiosInstance';

const orderService = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getMyOrders: (params) => api.get('/orders/vendor/my-orders', { params }),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  uploadInvoice: (id, data) => api.post(`/orders/${id}/invoice`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default orderService;
