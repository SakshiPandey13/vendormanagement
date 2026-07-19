const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics', 'Furniture', 'Clothing', 'Food & Beverages',
        'Raw Materials', 'Machinery', 'Chemicals', 'Packaging',
        'IT Services', 'Stationery', 'Other',
      ],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      default: 'piece',
      enum: ['piece', 'kg', 'gram', 'liter', 'meter', 'box', 'pack', 'dozen', 'set'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
    },
    minimumStock: {
      type: Number,
      default: 10,
    },
    image: {
      type: String,
      default: null,
    },
    images: [String],
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    taxRate: {
      type: Number,
      default: 18, // GST percentage
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    specifications: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
productSchema.index({ name: 'text', sku: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ stock: 1 });

// ─── Virtuals ────────────────────────────────────────────
productSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.minimumStock && this.stock > 0;
});

productSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0;
});

productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minimumStock) return 'low_stock';
  return 'in_stock';
});

module.exports = mongoose.model('Product', productSchema);
