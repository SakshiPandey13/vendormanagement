const asyncHandler = require('express-async-handler');
const reportService = require('../services/reportService');
const { generateVendorReportPDF } = require('../services/pdfService');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Admin
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await reportService.getDashboardStats();
  successResponse(res, 'Dashboard stats', stats);
});

// @desc    Monthly order/revenue summary
// @route   GET /api/reports/monthly
// @access  Admin
exports.getMonthlyReport = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const data = await reportService.getMonthlyOrderSummary(months);
  successResponse(res, 'Monthly report', data);
});

// @desc    Payment analytics
// @route   GET /api/reports/payments
// @access  Admin
exports.getPaymentReport = asyncHandler(async (req, res) => {
  const data = await reportService.getPaymentSummary();
  successResponse(res, 'Payment report', data);
});

// @desc    Vendor performance
// @route   GET /api/reports/vendor-performance
// @access  Admin
exports.getVendorPerformanceReport = asyncHandler(async (req, res) => {
  const data = await reportService.getVendorPerformanceReport();
  successResponse(res, 'Vendor performance report', data);
});

// @desc    Inventory report
// @route   GET /api/reports/inventory
// @access  Admin
exports.getInventoryReport = asyncHandler(async (req, res) => {
  const data = await reportService.getInventoryReport();
  successResponse(res, 'Inventory report', data);
});

// @desc    Download vendor report as PDF
// @route   GET /api/reports/vendors/pdf
// @access  Admin
exports.downloadVendorReportPDF = asyncHandler(async (req, res) => {
  const vendors = await reportService.getVendorPerformanceReport();
  const pdfBuffer = await generateVendorReportPDF(vendors, 'Vendor Performance Report');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Vendor-Report.pdf');
  res.send(pdfBuffer);
});

// @desc    Download orders report as Excel
// @route   GET /api/reports/orders/excel
// @access  Admin
exports.downloadOrdersExcel = asyncHandler(async (req, res) => {
  const PurchaseOrder = require('../models/PurchaseOrder');
  const xl = require('excel4node');

  const orders = await PurchaseOrder.find()
    .populate('vendor', 'companyName')
    .lean();

  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Orders');

  const headerStyle = wb.createStyle({
    font: { bold: true, color: '#FFFFFF', size: 12 },
    fill: { type: 'pattern', patternType: 'solid', fgColor: '#2563EB' },
    alignment: { horizontal: 'center' },
  });

  const headers = ['Order Number', 'Vendor', 'Status', 'Subtotal', 'Tax', 'Grand Total', 'Created Date'];
  headers.forEach((h, i) => ws.cell(1, i + 1).string(h).style(headerStyle));

  orders.forEach((order, i) => {
    const row = i + 2;
    ws.cell(row, 1).string(order.orderNumber || '');
    ws.cell(row, 2).string(order.vendor?.companyName || '');
    ws.cell(row, 3).string(order.status || '');
    ws.cell(row, 4).number(order.subtotal || 0);
    ws.cell(row, 5).number(order.taxAmount || 0);
    ws.cell(row, 6).number(order.grandTotal || 0);
    ws.cell(row, 7).string(order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '');
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=Orders-Report.xlsx');
  wb.write('Orders-Report.xlsx', res);
});
