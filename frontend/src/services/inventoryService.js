import api from './axiosInstance';

const inventoryService = {
  getInventory: (params) => api.get('/inventory', { params }),
  getProductInventory: (productId) => api.get(`/inventory/${productId}`),
  adjustStock: (productId, data) => api.put(`/inventory/${productId}/adjust`, data),
  getLowStockAlerts: () => api.get('/inventory/alerts/low-stock'),
};

export default inventoryService;
