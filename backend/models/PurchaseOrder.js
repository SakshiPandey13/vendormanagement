const mongoose = require('mongoose');

// Line items in a purchase order
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String, // snapshot at order time
  sku: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
});

// Status timeline entry
const statusTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: String,
  note: String,
  timestamp: { type: Date, default: Date.now },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    // Financials
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    shippingCost: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    // Dates
    expectedDeliveryDate: {
      type: Date,
      required: [true, 'Expected delivery date is required'],
    },
    actualDeliveryDate: Date,
    // Shipping
    shippingAddress: {
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    paymentTerms: {
      type: String,
      enum: ['immediate', 'net15', 'net30', 'net45', 'net60', 'cod'],
      default: 'net30',
    },
    // Status
    status: {
      type: String,
      enum: [
        'pending', 'approved', 'accepted', 'rejected',
        'processing', 'packed', 'dispatched', 'delivered', 'completed', 'cancelled',
      ],
      default: 'pending',
    },
    statusTimeline: [statusTimelineSchema],
    // Notes
    notes: String,
    rejectionReason: String,
    // Invoice
    invoiceUrl: String,
    invoiceNumber: String,
    invoiceUploadedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
purchaseOrderSchema.index({ orderNumber: 1 });
purchaseOrderSchema.index({ vendor: 1, status: 1 });
purchaseOrderSchema.index({ createdBy: 1 });
purchaseOrderSchema.index({ status: 1, createdAt: -1 });

// ─── Generate Order Number ────────────────────────────────
purchaseOrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  // Recalculate totals
  this.subtotal = this.items.reduce((sum, item) => {
    item.taxAmount = (item.unitPrice * item.quantity * (item.taxRate / 100));
    item.totalPrice = (item.unitPrice * item.quantity) + item.taxAmount;
    return sum + (item.unitPrice * item.quantity);
  }, 0);

  this.taxAmount = this.items.reduce((sum, item) => sum + item.taxAmount, 0);

  const discountAmount = this.discountType === 'percentage'
    ? (this.subtotal * this.discount) / 100
    : this.discount;

  this.grandTotal = this.subtotal + this.taxAmount - discountAmount + this.shippingCost;
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
