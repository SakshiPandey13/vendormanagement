const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getCategories,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { productValidator } = require('../validators/vendorValidators');

router.use(protect);
router.use(authorize('admin'));

router.get('/categories', getCategories);

router.route('/')
  .get(getProducts)
  .post(upload.single('productImage'), productValidator, createProduct);

router.route('/:id')
  .get(getProduct)
  .put(upload.single('productImage'), updateProduct)
  .delete(deleteProduct);

module.exports = router;
