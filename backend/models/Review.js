const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: {
      delivery: { type: Number, required: true, min: 1, max: 5 },
      quality: { type: Number, required: true, min: 1, max: 5 },
      communication: { type: Number, required: true, min: 1, max: 5 },
      support: { type: Number, required: true, min: 1, max: 5 },
    },
    overallRating: { type: Number, min: 0, max: 5 },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isDeliveredOnTime: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────
reviewSchema.index({ vendor: 1, createdAt: -1 });
reviewSchema.index({ order: 1 }, { unique: true }); // One review per order

// ─── Calculate overall rating before save ────────────────
reviewSchema.pre('save', function (next) {
  const { delivery, quality, communication, support } = this.ratings;
  this.overallRating = parseFloat(((delivery + quality + communication + support) / 4).toFixed(1));
  next();
});

// ─── Update vendor ratings after save ────────────────────
reviewSchema.post('save', async function () {
  const Vendor = mongoose.model('Vendor');
  const Review = this.constructor;

  const stats = await Review.aggregate([
    { $match: { vendor: this.vendor } },
    {
      $group: {
        _id: '$vendor',
        avgDelivery: { $avg: '$ratings.delivery' },
        avgQuality: { $avg: '$ratings.quality' },
        avgCommunication: { $avg: '$ratings.communication' },
        avgSupport: { $avg: '$ratings.support' },
        avgOverall: { $avg: '$overallRating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Vendor.findByIdAndUpdate(this.vendor, {
      'rating.delivery': parseFloat(stats[0].avgDelivery.toFixed(1)),
      'rating.quality': parseFloat(stats[0].avgQuality.toFixed(1)),
      'rating.communication': parseFloat(stats[0].avgCommunication.toFixed(1)),
      'rating.support': parseFloat(stats[0].avgSupport.toFixed(1)),
      'rating.overall': parseFloat(stats[0].avgOverall.toFixed(1)),
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
