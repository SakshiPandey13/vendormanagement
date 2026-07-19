const express = require('express');
const router = express.Router();
const {
  getVendors, getVendor, createVendor, updateVendor, deleteVendor,
  uploadDocument, getMyProfile, updateMyProfile, getVendorStats,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { vendorValidator } = require('../validators/vendorValidators');

router.use(protect);

// Vendor self-service routes
router.get('/profile/me', authorize('vendor'), getMyProfile);
router.put('/profile/me', authorize('vendor'), upload.single('profileImage'), updateMyProfile);

// Admin routes
router.route('/')
  .get(authorize('admin'), getVendors)
  .post(authorize('admin'), upload.single('profileImage'), vendorValidator, createVendor);

router.route('/:id')
  .get(authorize('admin'), getVendor)
  .put(authorize('admin'), upload.single('profileImage'), updateVendor)
  .delete(authorize('admin'), deleteVendor);

router.get('/:id/stats', authorize('admin'), getVendorStats);
router.post('/:id/documents', authorize('admin'), upload.single('documents'), uploadDocument);

module.exports = router;
