const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { sendTokenResponse } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const emailService = require('../services/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (Admin creates vendor accounts typically)
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 400);
  }

  const { name, email, password, role = 'vendor', phone } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return errorResponse(res, 'Email already registered', 409);

  const user = await User.create({ name, email, password, role, phone });
  await emailService.sendWelcome(email, name, role);
  sendTokenResponse(user, 201, res, 'Account created successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password').populate('vendorProfile');

  if (!user) return errorResponse(res, 'Invalid email or password', 401);
  if (!user.isActive) return errorResponse(res, 'Your account has been deactivated. Contact admin.', 403);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return errorResponse(res, 'Invalid email or password', 401);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  successResponse(res, 'Logged out successfully');
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('vendorProfile');
  successResponse(res, 'User fetched', user);
});

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updateData = { name, phone };
  if (req.file) {
    updateData.avatar = req.file.path || req.file.secure_url;
  }
  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true, runValidators: true,
  });
  successResponse(res, 'Profile updated', user);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return errorResponse(res, 'Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();
  successResponse(res, 'Password changed successfully');
});

// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return errorResponse(res, 'No account found with that email', 404);

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await emailService.sendPasswordReset(user.email, user.name, resetUrl);

  successResponse(res, 'Password reset link sent to your email');
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorResponse(res, errors.array()[0].msg, 400);

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return errorResponse(res, 'Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Update notification preferences
// @route   PUT /api/auth/notifications/preferences
// @access  Private
exports.updateNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { notificationPreferences: req.body },
    { new: true }
  );
  successResponse(res, 'Notification preferences updated', user.notificationPreferences);
});
