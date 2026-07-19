import api from './axiosInstance';

const paymentService = {
  getPayments: (params) => api.get('/payments', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
  getMyPayments: (params) => api.get('/payments/vendor/my-payments', { params }),
  createPayment: (data) => api.post('/payments', data),
  updatePaymentStatus: (id, data) => api.put(`/payments/${id}/status`, data),
  downloadInvoicePDF: (id) => api.get(`/payments/${id}/invoice/pdf`, { responseType: 'blob' }),
};

export default paymentService;
