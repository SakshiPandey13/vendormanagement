const PDFDocument = require('pdfkit');

/**
 * Generate Invoice PDF for a Payment
 */
const generateInvoicePDF = (payment, order, vendor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ─── Header ──────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 100).fill('#2563EB');
      doc.fillColor('white').fontSize(28).font('Helvetica-Bold').text('VendorLink', 50, 30);
      doc.fontSize(12).font('Helvetica').text('Vendor Management System', 50, 62);
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 40, { align: 'right' });
      doc.fillColor('white').fontSize(11).text(`#${payment.paymentNumber}`, 0, 65, { align: 'right', width: doc.page.width - 50 });

      doc.fillColor('#1E293B');

      // ─── Invoice Details ──────────────────────────────────
      doc.moveDown(3);
      const infoY = 120;

      // Left: Vendor Info
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748B').text('BILLED TO', 50, infoY);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1E293B').text(vendor.companyName, 50, infoY + 18);
      doc.fontSize(10).font('Helvetica').fillColor('#475569')
        .text(vendor.ownerName, 50, infoY + 35)
        .text(vendor.email, 50, infoY + 50)
        .text(vendor.phone, 50, infoY + 65)
        .text(vendor.fullAddress || vendor.address, 50, infoY + 80, { width: 200 });

      // Right: Invoice Info
      const rightX = 350;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748B').text('INVOICE DETAILS', rightX, infoY);

      const details = [
        ['Invoice Number:', payment.paymentNumber],
        ['Order Number:', order.orderNumber],
        ['Invoice Date:', new Date().toLocaleDateString('en-IN')],
        ['Due Date:', order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN') : 'N/A'],
        ['Payment Method:', payment.paymentMethod?.toUpperCase() || 'N/A'],
        ['Payment Status:', payment.status?.toUpperCase() || 'PENDING'],
      ];

      details.forEach(([label, value], i) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748B').text(label, rightX, infoY + 18 + i * 17);
        doc.fontSize(10).font('Helvetica').fillColor('#1E293B').text(value, rightX + 120, infoY + 18 + i * 17);
      });

      // ─── Order Items Table ────────────────────────────────
      const tableY = infoY + 180;

      // Table Header
      doc.rect(50, tableY, doc.page.width - 100, 28).fill('#1E293B');
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
      doc.text('PRODUCT', 60, tableY + 9);
      doc.text('SKU', 230, tableY + 9);
      doc.text('QTY', 310, tableY + 9, { width: 50, align: 'center' });
      doc.text('UNIT PRICE', 370, tableY + 9, { width: 80, align: 'right' });
      doc.text('TOTAL', 460, tableY + 9, { width: 80, align: 'right' });

      // Table Rows
      let rowY = tableY + 28;
      doc.fillColor('#1E293B').font('Helvetica');

      (order.items || []).forEach((item, idx) => {
        const bgColor = idx % 2 === 0 ? '#F8FAFC' : 'white';
        doc.rect(50, rowY, doc.page.width - 100, 24).fill(bgColor);

        doc.fontSize(9).fillColor('#1E293B')
          .text(item.productName || 'Product', 60, rowY + 7, { width: 160 })
          .text(item.sku || '-', 230, rowY + 7, { width: 70 })
          .text(item.quantity.toString(), 310, rowY + 7, { width: 50, align: 'center' })
          .text(`₹${(item.unitPrice || 0).toLocaleString('en-IN')}`, 370, rowY + 7, { width: 80, align: 'right' })
          .text(`₹${(item.totalPrice || 0).toLocaleString('en-IN')}`, 460, rowY + 7, { width: 80, align: 'right' });

        rowY += 24;
      });

      // ─── Totals ───────────────────────────────────────────
      const totalsY = rowY + 20;
      doc.moveTo(350, totalsY).lineTo(doc.page.width - 50, totalsY).stroke('#E2E8F0');

      const totals = [
        ['Subtotal:', `₹${(order.subtotal || 0).toLocaleString('en-IN')}`],
        ['GST/Tax:', `₹${(order.taxAmount || 0).toLocaleString('en-IN')}`],
        ['Discount:', `-₹${(order.discount || 0).toLocaleString('en-IN')}`],
        ['Shipping:', `₹${(order.shippingCost || 0).toLocaleString('en-IN')}`],
      ];

      totals.forEach(([label, value], i) => {
        doc.fontSize(10).font('Helvetica').fillColor('#64748B').text(label, 350, totalsY + 15 + i * 18);
        doc.fillColor('#1E293B').text(value, 0, totalsY + 15 + i * 18, { align: 'right', width: doc.page.width - 50 });
      });

      // Grand Total
      const grandY = totalsY + 15 + totals.length * 18 + 10;
      doc.rect(350, grandY, doc.page.width - 400, 36).fill('#2563EB');
      doc.fillColor('white').fontSize(13).font('Helvetica-Bold')
        .text('GRAND TOTAL:', 360, grandY + 11)
        .text(`₹${(order.grandTotal || payment.amount || 0).toLocaleString('en-IN')}`, 0, grandY + 11, { align: 'right', width: doc.page.width - 60 });

      // ─── Footer ───────────────────────────────────────────
      doc.fillColor('#94A3B8').fontSize(9).font('Helvetica')
        .text('Thank you for your business with VendorLink.', 50, doc.page.height - 80, { align: 'center' })
        .text('For queries, contact support@vendorlink.com', 50, doc.page.height - 65, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Vendor Report PDF
 */
const generateVendorReportPDF = (vendors, title = 'Vendor Report') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageW = doc.page.width;

      // ─── Header ──────────────────────────────────────────
      doc.rect(0, 0, pageW, 85).fill('#2563EB');
      doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('VendorLink', 50, 18);
      doc.fontSize(13).font('Helvetica').text(title, 50, 48);
      doc.fontSize(9).text(`Generated: ${new Date().toLocaleString('en-IN')}`, 0, 58, { align: 'right', width: pageW - 50 });

      doc.fillColor('#1E293B');

      // ─── Summary Row ──────────────────────────────────────
      const summaryY = 100;
      const summaryItems = [
        { label: 'Total Vendors', value: vendors.length },
        { label: 'Active', value: vendors.filter(v => v.status === 'active').length },
        { label: 'Inactive', value: vendors.filter(v => v.status !== 'active').length },
        { label: 'Avg Rating', value: vendors.length ? (vendors.reduce((s, v) => s + (v.rating?.overall || 0), 0) / vendors.length).toFixed(1) : '0.0' },
      ];
      const boxW = (pageW - 100) / summaryItems.length;
      summaryItems.forEach((item, i) => {
        const bx = 50 + i * boxW;
        doc.rect(bx, summaryY, boxW - 6, 40).fill(i % 2 === 0 ? '#F1F5F9' : '#E2E8F0');
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#2563EB').text(String(item.value), bx, summaryY + 5, { width: boxW - 6, align: 'center' });
        doc.fontSize(8).font('Helvetica').fillColor('#64748B').text(item.label, bx, summaryY + 26, { width: boxW - 6, align: 'center' });
      });

      // ─── Table ────────────────────────────────────────────
      const headers  = ['Company',   'Owner',  'Category', 'Status',  'Rating', 'Orders', 'Completion'];
      const colWidths = [120,         90,        90,         60,        45,       45,        45];
      const tableY = summaryY + 55;
      let x = 50;

      // Table header row
      doc.rect(50, tableY, pageW - 100, 24).fill('#1E293B');
      doc.fillColor('white').fontSize(8).font('Helvetica-Bold');
      headers.forEach((h, i) => {
        doc.text(h, x + 4, tableY + 8, { width: colWidths[i] - 8 });
        x += colWidths[i];
      });

      if (vendors.length === 0) {
        doc.moveDown(3).fillColor('#64748B').fontSize(14).font('Helvetica')
          .text('No vendor data available.', 50, tableY + 40, { align: 'center', width: pageW - 100 });
      } else {
        let rowY = tableY + 24;
        vendors.forEach((v, idx) => {
          if (rowY > doc.page.height - 80) {
            doc.addPage();
            rowY = 50;
            // Re-draw header on new page
            x = 50;
            doc.rect(50, rowY, pageW - 100, 24).fill('#1E293B');
            doc.fillColor('white').fontSize(8).font('Helvetica-Bold');
            headers.forEach((h, i) => {
              doc.text(h, x + 4, rowY + 8, { width: colWidths[i] - 8 });
              x += colWidths[i];
            });
            rowY += 24;
          }

          doc.rect(50, rowY, pageW - 100, 22).fill(idx % 2 === 0 ? '#F8FAFC' : 'white');
          x = 50;

          const statusColor = v.status === 'active' ? '#16A34A' : v.status === 'suspended' ? '#DC2626' : '#64748B';
          const cols = [
            v.companyName || '-',
            v.ownerName || '-',
            v.category || '-',
            (v.status || 'active').toUpperCase(),
            `${v.rating?.overall || 0}/5`,
            String(v.totalOrders || 0),
            `${v.completionRate || 0}%`,
          ];

          doc.fontSize(8).font('Helvetica');
          cols.forEach((c, i) => {
            const isStatus = i === 3;
            doc.fillColor(isStatus ? statusColor : '#1E293B')
              .text(c, x + 4, rowY + 7, { width: colWidths[i] - 8 });
            x += colWidths[i];
          });
          rowY += 22;
        });
      }

      // ─── Footer ───────────────────────────────────────────
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
        .text('Confidential — VendorLink Vendor Management System', 50, doc.page.height - 60, { align: 'center', width: pageW - 100 })
        .text(`Total Records: ${vendors.length}`, 50, doc.page.height - 45, { align: 'center', width: pageW - 100 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF, generateVendorReportPDF };
