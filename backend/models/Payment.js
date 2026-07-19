const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: [true, 'Order reference is required'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'bank_transfer', 'cash'],
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    dueDate: Date,
    // Invoice
    invoiceNumber: String,
    invoiceUrl: String,
    invoiceGeneratedAt: Date,
    // Notes
    notes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Bank transfer details
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
    },
    // Refund
    refundAmount: { type: Number, default: 0 },
    refundReason: String,
    refundDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
paymentSchema.index({ order: 1, vendor: 1 });
paymentSchema.index({ status: 1, paymentDate: -1 });
paymentSchema.index({ paymentNumber: 1 });

// ─── Auto-generate payment number ────────────────────────
paymentSchema.pre('save', async function (next) {
  if (!this.paymentNumber) {
    const count = await this.constructor.countDocuments();
    this.paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
