const mongoose = require('mongoose');

const inventoryHistorySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['added', 'removed', 'adjusted', 'reserved', 'released', 'purchase_order'],
    required: true,
  },
  quantity: { type: Number, required: true },
  previousStock: Number,
  newStock: Number,
  reference: String, // Order number or description
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  timestamp: { type: Date, default: Date.now },
});

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    currentStock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    availableStock: { type: Number, default: 0 },
    minimumStock: { type: Number, default: 10 },
    maximumStock: { type: Number, default: 1000 },
    reorderPoint: { type: Number, default: 20 },
    lastRestockedAt: Date,
    lastRestockedQuantity: Number,
    history: [inventoryHistorySchema],
    warehouse: {
      type: String,
      default: 'Main Warehouse',
    },
    location: String, // e.g., "Rack A-12"
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
inventorySchema.index({ product: 1 });
inventorySchema.index({ currentStock: 1 });

// ─── Auto-calculate available stock ──────────────────────
inventorySchema.pre('save', function (next) {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  next();
});

// ─── Virtuals ────────────────────────────────────────────
inventorySchema.virtual('stockStatus').get(function () {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= this.minimumStock) return 'low_stock';
  if (this.currentStock <= this.reorderPoint) return 'reorder_needed';
  return 'in_stock';
});

module.exports = mongoose.model('Inventory', inventorySchema);
