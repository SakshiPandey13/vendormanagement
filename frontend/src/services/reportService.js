import api from './axiosInstance';

const reportService = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getMonthlyReport: (months = 12) => api.get('/reports/monthly', { params: { months } }),
  getPaymentReport: () => api.get('/reports/payments'),
  getVendorPerformanceReport: () => api.get('/reports/vendor-performance'),
  getInventoryReport: () => api.get('/reports/inventory'),
  downloadVendorReportPDF: () => api.get('/reports/vendors/pdf', { responseType: 'blob' }),
  downloadOrdersExcel: () => api.get('/reports/orders/excel', { responseType: 'blob' }),
};

export default reportService;
