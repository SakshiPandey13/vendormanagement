const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getMonthlyReport, getPaymentReport,
  getVendorPerformanceReport, getInventoryReport,
  downloadVendorReportPDF, downloadOrdersExcel,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlyReport);
router.get('/payments', getPaymentReport);
router.get('/vendor-performance', getVendorPerformanceReport);
router.get('/inventory', getInventoryReport);
router.get('/vendors/pdf', downloadVendorReportPDF);
router.get('/orders/excel', downloadOrdersExcel);

module.exports = router;
