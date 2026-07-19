const express = require('express');
const router = express.Router();
const {
  getInventory, getProductInventory, adjustStock, getLowStockAlerts,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getInventory);
router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/:productId', getProductInventory);
router.put('/:productId/adjust', adjustStock);

module.exports = router;
