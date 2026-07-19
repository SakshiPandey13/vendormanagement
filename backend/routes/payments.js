const express = require('express');
const router = express.Router();
const {
  getPayments, getPayment, createPayment, updatePaymentStatus,
  downloadInvoicePDF, getMyPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Vendor routes
router.get('/vendor/my-payments', authorize('vendor'), getMyPayments);

// Invoice PDF (both roles)
router.get('/:id/invoice/pdf', downloadInvoicePDF);

// Admin routes
router.route('/')
  .get(authorize('admin'), getPayments)
  .post(authorize('admin'), createPayment);

router.get('/:id', getPayment);
router.put('/:id/status', authorize('admin'), updatePaymentStatus);

module.exports = router;
