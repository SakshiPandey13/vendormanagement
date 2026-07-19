const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: [
        'order_assigned', 'order_approved', 'order_accepted', 'order_rejected',
        'order_delivered', 'order_completed', 'payment_completed', 'payment_failed',
        'low_stock', 'vendor_registered', 'system', 'info',
      ],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Frontend route to navigate to
      default: null,
    },
    metadata: mongoose.Schema.Types.Mixed, // Extra data like orderId, vendorId
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
