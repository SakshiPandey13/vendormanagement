const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta, buildSort } = require('../utils/pagination');

// @desc    Get all products
// @route   GET /api/products
// @access  Admin
exports.getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, category, status, minPrice, maxPrice, stockStatus, sort } = req.query;

  const query = {};
  if (category) query.category = category;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (search) query.$text = { $search: search };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  if (stockStatus === 'low_stock') query.$expr = { $lte: ['$stock', '$minimumStock'] };
  if (stockStatus === 'out_of_stock') query.stock = 0;
  if (stockStatus === 'in_stock') query.$expr = { $gt: ['$stock', '$minimumStock'] };

  const sortObj = buildSort(sort);
  const [products, total] = await Promise.all([
    Product.find(query).populate('supplier', 'companyName').skip(skip).limit(limit).sort(sortObj).lean(),
    Product.countDocuments(query),
  ]);

  paginatedResponse(res, 'Products fetched', products, buildPaginationMeta(total, page, limit));
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Admin
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('supplier', 'companyName email');
  if (!product) return errorResponse(res, 'Product not found', 404);
  successResponse(res, 'Product fetched', product);
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

  if (req.file) req.body.image = req.file.path || req.file.secure_url;

  const product = await Product.create(req.body);

  // Create inventory record
  await Inventory.create({
    product: product._id,
    currentStock: product.stock,
    minimumStock: product.minimumStock || 10,
    history: [{ action: 'added', quantity: product.stock, newStock: product.stock, note: 'Initial stock' }],
  });

  successResponse(res, 'Product created successfully', product, 201);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return errorResponse(res, 'Product not found', 404);

  if (req.file) req.body.image = req.file.path || req.file.secure_url;

  // If stock changed, update inventory
  if (req.body.stock !== undefined && req.body.stock !== product.stock) {
    await Inventory.findOneAndUpdate(
      { product: product._id },
      {
        currentStock: req.body.stock,
        $push: {
          history: {
            action: 'adjusted',
            quantity: req.body.stock - product.stock,
            previousStock: product.stock,
            newStock: req.body.stock,
            note: 'Manual adjustment',
          },
        },
      }
    );
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  successResponse(res, 'Product updated successfully', product);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return errorResponse(res, 'Product not found', 404);

  await Inventory.findOneAndDelete({ product: product._id });
  await product.deleteOne();

  successResponse(res, 'Product deleted successfully');
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Admin
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  successResponse(res, 'Categories fetched', categories);
});
