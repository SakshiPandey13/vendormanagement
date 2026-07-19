const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// @desc    Get all inventory
// @route   GET /api/inventory
// @access  Admin
exports.getInventory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { stockStatus, search } = req.query;

  // Build product filter
  const productQuery = { isActive: true };
  if (search) productQuery.$text = { $search: search };

  const products = await Product.find(productQuery).select('_id').lean();
  const productIds = products.map(p => p._id);

  const inventoryQuery = { product: { $in: productIds } };
  if (stockStatus === 'low_stock') {
    // We'll filter after fetching with virtuals
  }

  const [items, total] = await Promise.all([
    Inventory.find(inventoryQuery)
      .populate('product', 'name sku category price image minimumStock')
      .skip(skip).limit(limit).sort({ currentStock: 1 }),
    Inventory.countDocuments(inventoryQuery),
  ]);

  let result = items;
  if (stockStatus) {
    result = items.filter(i => i.stockStatus === stockStatus);
  }

  paginatedResponse(res, 'Inventory fetched', result, buildPaginationMeta(total, page, limit));
});

// @desc    Get single product inventory
// @route   GET /api/inventory/:productId
// @access  Admin
exports.getProductInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ product: req.params.productId })
    .populate('product', 'name sku category price');
  if (!inventory) return errorResponse(res, 'Inventory record not found', 404);
  successResponse(res, 'Inventory fetched', inventory);
});

// @desc    Adjust stock
// @route   PUT /api/inventory/:productId/adjust
// @access  Admin
exports.adjustStock = asyncHandler(async (req, res) => {
  const { action, quantity, note } = req.body;

  if (!['added', 'removed', 'adjusted'].includes(action)) {
    return errorResponse(res, 'Invalid action. Use: added, removed, adjusted', 400);
  }

  const inventory = await Inventory.findOne({ product: req.params.productId });
  if (!inventory) return errorResponse(res, 'Inventory record not found', 404);

  const previousStock = inventory.currentStock;
  let newStock;

  if (action === 'added') newStock = previousStock + quantity;
  else if (action === 'removed') newStock = Math.max(0, previousStock - quantity);
  else newStock = quantity; // absolute adjustment

  inventory.currentStock = newStock;
  if (action === 'added') {
    inventory.lastRestockedAt = new Date();
    inventory.lastRestockedQuantity = quantity;
  }

  inventory.history.push({
    action,
    quantity,
    previousStock,
    newStock,
    note,
    performedBy: req.user.id,
  });

  await inventory.save();

  // Also update Product.stock
  await Product.findByIdAndUpdate(req.params.productId, { stock: newStock });

  successResponse(res, 'Stock adjusted successfully', inventory);
});

// @desc    Get low stock products
// @route   GET /api/inventory/alerts/low-stock
// @access  Admin
exports.getLowStockAlerts = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find()
    .populate('product', 'name sku category minimumStock price image');

  const lowStock = inventory.filter(i => i.stockStatus === 'low_stock' || i.stockStatus === 'out_of_stock');
  successResponse(res, 'Low stock alerts', lowStock);
});
