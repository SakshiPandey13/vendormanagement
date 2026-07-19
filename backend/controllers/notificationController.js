const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { recipient: req.user.id };
  if (req.query.unread === 'true') query.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user.id, isRead: false }),
  ]);

  paginatedResponse(res, 'Notifications fetched', { notifications, unreadCount }, buildPaginationMeta(total, page, limit));
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return errorResponse(res, 'Notification not found', 404);
  successResponse(res, 'Marked as read', notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
  successResponse(res, 'All notifications marked as read');
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id,
  });
  if (!notification) return errorResponse(res, 'Notification not found', 404);
  successResponse(res, 'Notification deleted');
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
  successResponse(res, 'Unread count', { count });
});
