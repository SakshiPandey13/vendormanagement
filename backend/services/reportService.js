const PurchaseOrder = require('../models/PurchaseOrder');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

/**
 * Generate aggregated report data
 */
const reportService = {
  /**
   * Monthly orders/revenue summary for the last N months
   */
  getMonthlyOrderSummary: async (months = 12) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalOrders: { $sum: 1 },
          revenue: { $sum: '$grandTotal' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  },

  /**
   * Payment summary grouped by method and status
   */
  getPaymentSummary: async () => {
    return Payment.aggregate([
      {
        $group: {
          _id: { method: '$paymentMethod', status: '$status' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
  },

  /**
   * Vendor performance report
   */
  getVendorPerformanceReport: async () => {
    return Vendor.find()
      .select('companyName ownerName email phone category status rating totalOrders completedOrders completionRate city state joiningDate')
      .sort({ 'rating.overall': -1 })
      .lean();
  },

  /**
   * Inventory report — products below minimum stock
   */
  getInventoryReport: async () => {
    return Product.aggregate([
      {
        $project: {
          name: 1, sku: 1, category: 1, stock: 1,
          minimumStock: 1, price: 1,
          stockValue: { $multiply: ['$stock', '$price'] },
          stockStatus: {
            $switch: {
              branches: [
                { case: { $eq: ['$stock', 0] }, then: 'out_of_stock' },
                { case: { $lte: ['$stock', '$minimumStock'] }, then: 'low_stock' },
              ],
              default: 'in_stock',
            },
          },
        },
      },
      { $sort: { stock: 1 } },
    ]);
  },

  /**
   * Dashboard overview stats
   */
  getDashboardStats: async () => {
    const [
      totalVendors, activeVendors, totalOrders, pendingOrders,
      completedOrders, totalProducts, lowStockProducts,
      totalRevenue, pendingPayments,
    ] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'active' }),
      PurchaseOrder.countDocuments(),
      PurchaseOrder.countDocuments({ status: { $in: ['pending', 'approved', 'accepted', 'processing'] } }),
      PurchaseOrder.countDocuments({ status: 'completed' }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$minimumStock'] } }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    return {
      totalVendors,
      activeVendors,
      inactiveVendors: totalVendors - activeVendors,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProducts,
      lowStockProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0,
    };
  },
};

module.exports = reportService;
