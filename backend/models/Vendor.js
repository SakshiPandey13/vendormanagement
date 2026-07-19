const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    // User account linked to this vendor
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    alternatePhone: String,
    // Tax Information
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    // Categorization
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics', 'Furniture', 'Clothing', 'Food & Beverages',
        'Raw Materials', 'Machinery', 'Chemicals', 'Packaging',
        'IT Services', 'Logistics', 'Other',
      ],
    },
    // Address
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    country: {
      type: String,
      default: 'India',
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
    },
    // Profile
    profileImage: {
      type: String,
      default: null,
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'active',
    },
    // Performance
    rating: {
      delivery: { type: Number, default: 0, min: 0, max: 5 },
      quality: { type: Number, default: 0, min: 0, max: 5 },
      communication: { type: Number, default: 0, min: 0, max: 5 },
      support: { type: Number, default: 0, min: 0, max: 5 },
      overall: { type: Number, default: 0, min: 0, max: 5 },
    },
    completionRate: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      upiId: String,
    },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────
vendorSchema.index({ companyName: 'text', ownerName: 'text', email: 'text' });
vendorSchema.index({ status: 1, category: 1 });
vendorSchema.index({ 'rating.overall': -1 });

// ─── Virtual: Full Address ────────────────────────────────
vendorSchema.virtual('fullAddress').get(function () {
  return `${this.address}, ${this.city}, ${this.state} - ${this.pincode}, ${this.country}`;
});

// ─── Method: Recalculate overall rating ──────────────────
vendorSchema.methods.recalculateRating = function () {
  const { delivery, quality, communication, support } = this.rating;
  this.rating.overall = ((delivery + quality + communication + support) / 4).toFixed(1);
  if (this.totalOrders > 0) {
    this.completionRate = ((this.completedOrders / this.totalOrders) * 100).toFixed(1);
  }
};

module.exports = mongoose.model('Vendor', vendorSchema);
