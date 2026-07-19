const express = require('express');
const router = express.Router();
const {
  getOrders, getOrder, createOrder, updateOrderStatus,
  uploadInvoice, getMyOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// Vendor-specific routes
router.get('/vendor/my-orders', authorize('vendor'), getMyOrders);

// Shared: both admin and vendor can view a single order (controller enforces vendor scope)
router.get('/:id', getOrder);

// Admin-only
router.get('/', authorize('admin'), getOrders);
router.post('/', authorize('admin'), createOrder);

// Shared status update
router.put('/:id/status', updateOrderStatus);

// Vendor uploads invoice
router.post('/:id/invoice', upload.single('invoice'), uploadInvoice);

module.exports = router;
