const asyncHandler = require('express-async-handler');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta, buildSort } = require('../utils/pagination');
const emailService = require('../services/emailService');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
exports.getOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, vendor, search, startDate, endDate, sort } = req.query;

  const query = {};
  if (status) query.status = status;
  if (vendor) query.vendor = vendor;
  if (search) query.orderNumber = { $regex: search, $options: 'i' };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortObj = buildSort(sort);
  const [orders, total] = await Promise.all([
    PurchaseOrder.find(query)
      .populate('vendor', 'companyName email')
      .populate('createdBy', 'name')
      .skip(skip).limit(limit).sort(sortObj).lean(),
    PurchaseOrder.countDocuments(query),
  ]);

  paginatedResponse(res, 'Orders fetched', orders, buildPaginationMeta(total, page, limit));
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Admin + Vendor (own orders)
exports.getOrder = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);
    query.vendor = vendor._id;
  }

  const order = await PurchaseOrder.findOne(query)
    .populate('vendor', 'companyName ownerName email phone address')
    .populate('items.product', 'name sku image')
    .populate('createdBy', 'name email')
    .populate('statusTimeline.updatedBy', 'name');

  if (!order) return errorResponse(res, 'Order not found', 404);
  successResponse(res, 'Order fetched', order);
});

// @desc    Create purchase order
// @route   POST /api/orders
// @access  Admin
exports.createOrder = asyncHandler(async (req, res) => {
  const { vendor: vendorId, items, expectedDeliveryDate, shippingAddress, paymentTerms, discount, discountType, shippingCost, notes } = req.body;

  // Validate vendor
  const vendor = await Vendor.findById(vendorId).populate('user', 'email name');
  if (!vendor) return errorResponse(res, 'Vendor not found', 404);

  // Build items with product snapshots
  const enrichedItems = await Promise.all(
    (items || []).map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);

      // Use item unitPrice if it's a valid positive number; otherwise fall back to product.price
      const parsedUnitPrice = parseFloat(item.unitPrice);
      const unitPrice = (parsedUnitPrice > 0) ? parsedUnitPrice : product.price;
      const quantity = parseInt(item.quantity) || 1;

      return {
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        taxRate: product.taxRate || 18,
      };
    })
  );

  const order = await PurchaseOrder.create({
    vendor: vendorId,
    createdBy: req.user.id,
    items: enrichedItems,
    expectedDeliveryDate,
    shippingAddress,
    paymentTerms,
    discount: discount || 0,
    discountType: discountType || 'fixed',
    shippingCost: shippingCost || 0,
    notes,
    statusTimeline: [{
      status: 'pending',
      updatedBy: req.user.id,
      updatedByName: req.user.name,
      note: 'Order created',
    }],
  });

  // Notify vendor
  await Notification.create({
    recipient: vendor.user._id,
    title: 'New Purchase Order',
    message: `Order ${order.orderNumber} has been assigned to you.`,
    type: 'order_assigned',
    link: `/vendor/orders/${order._id}`,
    metadata: { orderId: order._id },
  });

  await emailService.sendOrderAssigned(vendor.email, vendor.ownerName, order.orderNumber, expectedDeliveryDate);

  const populated = await order.populate('vendor', 'companyName');
  successResponse(res, 'Purchase order created', populated, 201);
});

// @desc    Update order status (Admin: approve/cancel; Vendor: accept/reject/update)
// @route   PUT /api/orders/:id/status
// @access  Admin + Vendor
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await PurchaseOrder.findById(req.params.id).populate('vendor', 'user companyName email');
  if (!order) return errorResponse(res, 'Order not found', 404);

  // Role-based status restrictions
  const adminStatuses = ['approved', 'cancelled', 'completed'];
  const vendorStatuses = ['accepted', 'rejected', 'processing', 'packed', 'dispatched', 'delivered'];

  if (req.user.role === 'vendor') {
    const vendorProfile = await Vendor.findOne({ user: req.user.id });
    if (!vendorProfile || !order.vendor._id.equals(vendorProfile._id)) {
      return errorResponse(res, 'Not authorized for this order', 403);
    }
    if (!vendorStatuses.includes(status)) {
      return errorResponse(res, `Vendors cannot set status to '${status}'`, 400);
    }
  } else if (req.user.role === 'admin') {
    if (!adminStatuses.includes(status) && !['pending'].includes(status)) {
      // Admin can set any status
    }
  }

  order.status = status;
  order.statusTimeline.push({
    status,
    updatedBy: req.user.id,
    updatedByName: req.user.name,
    note,
  });

  if (status === 'delivered') order.actualDeliveryDate = new Date();
  if (status === 'completed' && order.vendor) {
    const vendor = await Vendor.findById(order.vendor._id);
    if (vendor) {
      vendor.completedOrders += 1;
      vendor.completionRate = ((vendor.completedOrders / vendor.totalOrders) * 100).toFixed(1);
      await vendor.save();
    }
  }

  await order.save();
  successResponse(res, 'Order status updated', order);
});

// @desc    Upload invoice to order
// @route   POST /api/orders/:id/invoice
// @access  Vendor
exports.uploadInvoice = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 'Please upload an invoice file', 400);

  const order = await PurchaseOrder.findById(req.params.id);
  if (!order) return errorResponse(res, 'Order not found', 404);

  order.invoiceUrl = req.file.path || req.file.secure_url;
  order.invoiceUploadedAt = new Date();
  await order.save();

  successResponse(res, 'Invoice uploaded', { invoiceUrl: order.invoiceUrl });
});

// @desc    Get orders for the logged-in vendor
// @route   GET /api/orders/vendor/my-orders
// @access  Vendor
exports.getMyOrders = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);

  const { page, limit, skip } = getPagination(req.query);
  const query = { vendor: vendor._id };
  if (req.query.status) query.status = req.query.status;

  const [orders, total] = await Promise.all([
    PurchaseOrder.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    PurchaseOrder.countDocuments(query),
  ]);

  paginatedResponse(res, 'My orders', orders, buildPaginationMeta(total, page, limit));
});
