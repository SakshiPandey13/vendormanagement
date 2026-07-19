const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta, buildSort } = require('../utils/pagination');
const { generateInvoicePDF } = require('../services/pdfService');
const emailService = require('../services/emailService');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Admin
exports.getPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, vendor, method, startDate, endDate, sort } = req.query;

  const query = {};
  if (status) query.status = status;
  if (vendor) query.vendor = vendor;
  if (method) query.paymentMethod = method;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('vendor', 'companyName')
      .populate('order', 'orderNumber grandTotal')
      .populate('processedBy', 'name')
      .skip(skip).limit(limit).sort(buildSort(sort)).lean(),
    Payment.countDocuments(query),
  ]);

  paginatedResponse(res, 'Payments fetched', payments, buildPaginationMeta(total, page, limit));
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Admin + Vendor (own)
exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('vendor', 'companyName ownerName email phone address bankDetails')
    .populate('order', 'orderNumber items subtotal taxAmount discount shippingCost grandTotal expectedDeliveryDate')
    .populate('processedBy', 'name');
  if (!payment) return errorResponse(res, 'Payment not found', 404);
  successResponse(res, 'Payment fetched', payment);
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Admin
exports.createPayment = asyncHandler(async (req, res) => {
  const { order: orderId, amount, paymentMethod, transactionId, notes, dueDate, bankDetails } = req.body;

  const order = await PurchaseOrder.findById(orderId).populate('vendor');
  if (!order) return errorResponse(res, 'Order not found', 404);

  const payment = await Payment.create({
    order: orderId,
    vendor: order.vendor._id,
    amount,
    paymentMethod,
    transactionId,
    notes,
    dueDate,
    bankDetails,
    processedBy: req.user.id,
  });

  successResponse(res, 'Payment created', payment, 201);
});

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Admin
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, transactionId, notes } = req.body;
  const payment = await Payment.findById(req.params.id)
    .populate('vendor', 'email ownerName user');
  if (!payment) return errorResponse(res, 'Payment not found', 404);

  payment.status = status;
  if (transactionId) payment.transactionId = transactionId;
  if (notes) payment.notes = notes;
  if (status === 'paid') payment.paymentDate = new Date();

  await payment.save();

  // Re-fetch with full populate so the frontend list stays correct
  const populated = await Payment.findById(payment._id)
    .populate('vendor', 'companyName email ownerName user')
    .populate('order', 'orderNumber grandTotal')
    .populate('processedBy', 'name');

  // Notify vendor on payment completion
  if (status === 'paid' && payment.vendor?.user) {
    await Notification.create({
      recipient: payment.vendor.user,
      title: 'Payment Received',
      message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} (${payment.paymentNumber}) has been processed.`,
      type: 'payment_completed',
      link: '/vendor/payments',
    });
    await emailService.sendPaymentCompleted(payment.vendor.email, payment.vendor.ownerName, payment.paymentNumber, payment.amount);
  }

  successResponse(res, 'Payment status updated', populated);
});

// @desc    Generate & download invoice PDF
// @route   GET /api/payments/:id/invoice/pdf
// @access  Admin + Vendor
exports.downloadInvoicePDF = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('vendor', 'companyName ownerName email phone address city state pincode country bankDetails')
    .populate({
      path: 'order',
      populate: { path: 'items.product', select: 'name sku' },
    });
  if (!payment) return errorResponse(res, 'Payment not found', 404);

  const pdfBuffer = await generateInvoicePDF(payment, payment.order, payment.vendor);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${payment.paymentNumber}.pdf`);
  res.send(pdfBuffer);
});

// @desc    Get vendor's own payments
// @route   GET /api/payments/vendor/my-payments
// @access  Vendor
exports.getMyPayments = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);

  const { page, limit, skip } = getPagination(req.query);
  const query = { vendor: vendor._id };
  if (req.query.status) query.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(query).populate('order', 'orderNumber').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Payment.countDocuments(query),
  ]);

  paginatedResponse(res, 'My payments', payments, buildPaginationMeta(total, page, limit));
});
