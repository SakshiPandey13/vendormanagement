const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta, buildSort } = require('../utils/pagination');
const emailService = require('../services/emailService');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Admin
exports.getVendors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, status, category, sort } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const sortObj = buildSort(sort);
  const [vendors, total] = await Promise.all([
    Vendor.find(query).populate('user', 'email lastLogin').skip(skip).limit(limit).sort(sortObj).lean(),
    Vendor.countDocuments(query),
  ]);

  paginatedResponse(res, 'Vendors fetched', vendors, buildPaginationMeta(total, page, limit));
});

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Admin
exports.getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('user', 'email lastLogin isActive notificationPreferences');
  if (!vendor) return errorResponse(res, 'Vendor not found', 404);
  successResponse(res, 'Vendor fetched', vendor);
});

// @desc    Create vendor + user account
// @route   POST /api/vendors
// @access  Admin
exports.createVendor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

  const {
    companyName, ownerName, email, phone, alternatePhone,
    gstNumber, panNumber, category, address, city, state,
    country, pincode, password = 'Vendor@123', notes,
    bankDetails,
  } = req.body;

  // Check if vendor email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return errorResponse(res, 'Email already registered', 409);

  // Create user account for vendor
  const user = await User.create({
    name: ownerName,
    email,
    password,
    role: 'vendor',
    phone,
  });

  // Create vendor profile
  const vendorData = {
    user: user._id,
    companyName, ownerName, email, phone, alternatePhone,
    gstNumber, panNumber, category, address, city, state,
    country: country || 'India', pincode, notes, bankDetails,
  };

  if (req.file) {
    vendorData.profileImage = req.file.path || req.file.secure_url;
  }

  const vendor = await Vendor.create(vendorData);

  // Link vendor profile to user
  await User.findByIdAndUpdate(user._id, { vendorProfile: vendor._id });

  // Send welcome email
  await emailService.sendWelcome(email, ownerName, 'vendor');

  successResponse(res, 'Vendor created successfully', vendor, 201);
});

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Admin
exports.updateVendor = asyncHandler(async (req, res) => {
  let vendor = await Vendor.findById(req.params.id);
  if (!vendor) return errorResponse(res, 'Vendor not found', 404);

  if (req.file) {
    req.body.profileImage = req.file.path || req.file.secure_url;
  }

  vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });

  successResponse(res, 'Vendor updated successfully', vendor);
});

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Admin
exports.deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return errorResponse(res, 'Vendor not found', 404);

  // Also remove the user account
  await User.findByIdAndDelete(vendor.user);
  await vendor.deleteOne();

  successResponse(res, 'Vendor deleted successfully');
});

// @desc    Upload vendor document
// @route   POST /api/vendors/:id/documents
// @access  Admin
exports.uploadDocument = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return errorResponse(res, 'Vendor not found', 404);

  if (!req.file) return errorResponse(res, 'Please upload a file', 400);

  const doc = {
    name: req.body.name || req.file.originalname,
    url: req.file.path || req.file.secure_url,
  };

  vendor.documents.push(doc);
  await vendor.save();

  successResponse(res, 'Document uploaded', vendor.documents);
});

// @desc    Get vendor's own profile (vendor role)
// @route   GET /api/vendors/profile/me
// @access  Vendor
exports.getMyProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });
  if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);
  successResponse(res, 'Profile fetched', vendor);
});

// @desc    Update vendor's own profile (vendor role)
// @route   PUT /api/vendors/profile/me
// @access  Vendor
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['phone', 'alternatePhone', 'address', 'city', 'state', 'pincode', 'bankDetails'];
  const update = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

  if (req.file) update.profileImage = req.file.path || req.file.secure_url;

  const vendor = await Vendor.findOneAndUpdate({ user: req.user.id }, update, { new: true });
  if (!vendor) return errorResponse(res, 'Vendor profile not found', 404);

  successResponse(res, 'Profile updated', vendor);
});

// @desc    Get vendor stats summary
// @route   GET /api/vendors/:id/stats
// @access  Admin
exports.getVendorStats = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return errorResponse(res, 'Vendor not found', 404);

  const PurchaseOrder = require('../models/PurchaseOrder');
  const Payment = require('../models/Payment');

  const [orders, payments] = await Promise.all([
    PurchaseOrder.find({ vendor: vendor._id }).select('status grandTotal createdAt'),
    Payment.find({ vendor: vendor._id }).select('amount status paymentDate'),
  ]);

  successResponse(res, 'Vendor stats', {
    vendor,
    orderStats: {
      total: orders.length,
      completed: orders.filter(o => o.status === 'completed').length,
      pending: orders.filter(o => ['pending', 'accepted', 'processing'].includes(o.status)).length,
      totalValue: orders.reduce((s, o) => s + (o.grandTotal || 0), 0),
    },
    paymentStats: {
      total: payments.length,
      paid: payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      pending: payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
    },
  });
});
