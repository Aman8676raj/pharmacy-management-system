const PDFDocument = require('pdfkit');

class InvoiceService {
  /**
   * Generates a PDF invoice stream for a sale and pipes it to a writable stream (e.g. Express res)
   */
  generateInvoicePDF(sale, outputStream) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Invoice-${sale.invoiceNumber}`,
          Author: 'PharmaCore Pharmacy Management System',
          Subject: `Tax Invoice for ${sale.invoiceNumber}`,
        },
      });

      doc.on('error', reject);
      outputStream.on('finish', resolve);
      outputStream.on('error', reject);

      doc.pipe(outputStream);

      // Color Palette
      const primaryColor = '#1E3A8A'; // Navy
      const secondaryColor = '#0D9488'; // Teal
      const textColor = '#1E293B'; // Dark Slate
      const mutedColor = '#64748B'; // Muted Gray
      const lightBg = '#F8FAFC'; // Light Gray Background
      const borderColor = '#E2E8F0';

      // --- HEADER ---
      doc.rect(40, 40, 515, 75).fill(lightBg);

      doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('PHARMACORE PHARMACY', 55, 52);
      doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text('Modern Healthcare & Comprehensive Pharmaceutical Services', 55, 75);
      doc.text('123 Healthcare Ave, Medical Enclave, Tech City - 500081', 55, 87);
      doc.text('DL No: DL-TS-2026-987654 | GSTIN: 36ABCDE1234F1Z5 | Phone: +91 98765 43210', 55, 98);

      // Status Pill on top right
      const isCancelled = sale.saleStatus === 'cancelled';
      const pillBg = isCancelled ? '#FEE2E2' : (sale.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF3C7');
      const pillText = isCancelled ? '#DC2626' : (sale.paymentStatus === 'paid' ? '#16A34A' : '#D97706');
      const statusLabel = isCancelled ? 'CANCELLED' : (sale.paymentStatus === 'paid' ? 'PAID' : 'PARTIALLY PAID');

      doc.roundedRect(420, 52, 120, 24, 4).fill(pillBg);
      doc.fillColor(pillText).fontSize(10).font('Helvetica-Bold').text(statusLabel, 420, 59, { width: 120, align: 'center' });

      // Invoice Title
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('TAX INVOICE', 420, 85, { width: 120, align: 'center' });

      // --- METADATA & CUSTOMER INFO ---
      const infoTop = 125;
      doc.roundedRect(40, infoTop, 250, 95, 4).strokeColor(borderColor).stroke();
      doc.roundedRect(305, infoTop, 250, 95, 4).strokeColor(borderColor).stroke();

      // Customer Block
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Billed To (Customer Details)', 50, infoTop + 10);
      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold').text(sale.customerSnapshot?.name || 'Walk-in Customer', 50, infoTop + 25);
      doc.font('Helvetica').fillColor(mutedColor);
      if (sale.customerSnapshot?.phone) {
        doc.text(`Phone: ${sale.customerSnapshot.phone}`, 50, infoTop + 38);
      }
      if (sale.customerSnapshot?.email) {
        doc.text(`Email: ${sale.customerSnapshot.email}`, 50, infoTop + 50);
      }
      if (sale.customerSnapshot?.address) {
        doc.text(`Address: ${sale.customerSnapshot.address}`, 50, infoTop + 62, { width: 230 });
      }
      if (sale.customerSnapshot?.prescriptionRef) {
        doc.font('Helvetica-Bold').fillColor(secondaryColor).text(`Rx / Doctor: ${sale.customerSnapshot.prescriptionRef}`, 50, infoTop + 76);
      }

      // Invoice Details Block
      const saleDate = new Date(sale.createdAt || Date.now()).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Invoice Details', 315, infoTop + 10);
      doc.fillColor(textColor).fontSize(9).font('Helvetica');
      doc.text(`Invoice No: `, 315, infoTop + 25);
      doc.font('Helvetica-Bold').text(sale.invoiceNumber, 385, infoTop + 25);

      doc.font('Helvetica').text(`Date & Time: `, 315, infoTop + 38);
      doc.text(saleDate, 385, infoTop + 38);

      doc.text(`Payment Mode: `, 315, infoTop + 50);
      doc.font('Helvetica-Bold').text((sale.paymentMethod || 'CASH').toUpperCase(), 385, infoTop + 50);

      doc.font('Helvetica').text(`Dispensed By: `, 315, infoTop + 62);
      doc.text(sale.soldBy?.name || 'Staff Pharmacist', 385, infoTop + 62);

      if (isCancelled && sale.cancelledAt) {
        doc.fillColor('#DC2626').font('Helvetica-Bold').text(`Cancelled: ${new Date(sale.cancelledAt).toLocaleDateString()}`, 315, infoTop + 76);
      }

      // --- ITEMS TABLE ---
      let y = 232;

      // Table Header
      doc.rect(40, y, 515, 22).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
      doc.text('#', 45, y + 6, { width: 20 });
      doc.text('Item / Medicine Description', 68, y + 6, { width: 160 });
      doc.text('Batch / Exp', 230, y + 6, { width: 80 });
      doc.text('Qty', 315, y + 6, { width: 35, align: 'right' });
      doc.text('Price (INR)', 355, y + 6, { width: 50, align: 'right' });
      doc.text('Disc', 410, y + 6, { width: 35, align: 'right' });
      doc.text('Tax', 450, y + 6, { width: 35, align: 'right' });
      doc.text('Total (INR)', 490, y + 6, { width: 60, align: 'right' });

      y += 24;

      // Table Rows
      let rowIndex = 0;
      doc.font('Helvetica').fontSize(8.5);

      (sale.items || []).forEach((item, index) => {
        // Multi-page check
        if (y > 690) {
          doc.addPage();
          y = 40;
          // Redraw table header on new page
          doc.rect(40, y, 515, 22).fill(primaryColor);
          doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
          doc.text('#', 45, y + 6, { width: 20 });
          doc.text('Item / Medicine Description', 68, y + 6, { width: 160 });
          doc.text('Batch / Exp', 230, y + 6, { width: 80 });
          doc.text('Qty', 315, y + 6, { width: 35, align: 'right' });
          doc.text('Price (INR)', 355, y + 6, { width: 50, align: 'right' });
          doc.text('Disc', 410, y + 6, { width: 35, align: 'right' });
          doc.text('Tax', 450, y + 6, { width: 35, align: 'right' });
          doc.text('Total (INR)', 490, y + 6, { width: 60, align: 'right' });
          y += 24;
        }

        const rowBg = rowIndex % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(40, y, 515, 24).fill(rowBg);

        // Batch details
        let batchInfo = '-';
        if (item.batchAllocations && item.batchAllocations.length > 0) {
          const firstAlloc = item.batchAllocations[0];
          const exp = firstAlloc.expiryDate ? new Date(firstAlloc.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : '';
          batchInfo = `${firstAlloc.batchNumber || ''} (${exp})`;
          if (item.batchAllocations.length > 1) {
            batchInfo += ` +${item.batchAllocations.length - 1}`;
          }
        }

        const discStr = item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : `-${item.discount}`) : '-';
        const taxStr = item.taxRate > 0 ? `${item.taxRate}%` : '0%';

        doc.fillColor(textColor);
        doc.text(String(index + 1), 45, y + 7, { width: 20 });
        doc.font('Helvetica-Bold').text(item.medicineName || 'Medicine', 68, y + 7, { width: 160 });
        doc.font('Helvetica').fillColor(mutedColor).text(batchInfo, 230, y + 7, { width: 80 });
        doc.fillColor(textColor).text(String(item.quantity), 315, y + 7, { width: 35, align: 'right' });
        doc.text(Number(item.unitPrice).toFixed(2), 355, y + 7, { width: 50, align: 'right' });
        doc.text(discStr, 410, y + 7, { width: 35, align: 'right' });
        doc.text(taxStr, 450, y + 7, { width: 35, align: 'right' });
        doc.font('Helvetica-Bold').text(Number(item.lineTotal).toFixed(2), 490, y + 7, { width: 60, align: 'right' });

        y += 24;
        rowIndex++;
      });

      // Bottom border for items table
      doc.rect(40, y, 515, 1).fill(borderColor);
      y += 10;

      // Check space for totals
      if (y > 670) {
        doc.addPage();
        y = 40;
      }

      // --- FINANCIAL SUMMARY & NOTES ---
      const summaryLeft = 330;
      const summaryWidth = 225;

      // Notes block on left
      doc.rect(40, y, 270, 95).strokeColor(borderColor).stroke();
      doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold').text('Terms & Conditions / Notes', 50, y + 10);
      doc.font('Helvetica').fontSize(7.5).fillColor(mutedColor);
      doc.text('1. Check batch number and expiry date before accepting medicines.', 50, y + 25, { width: 250 });
      doc.text('2. Refrigerated & Schedule H/X products are non-returnable.', 50, y + 37, { width: 250 });
      doc.text('3. In case of return, original invoice is mandatory within 7 days.', 50, y + 49, { width: 250 });
      if (sale.notes) {
        doc.font('Helvetica-Bold').fillColor(textColor).text(`Customer Note: ${sale.notes}`, 50, y + 65, { width: 250 });
      }

      // Financials on right
      doc.rect(summaryLeft, y, summaryWidth, 120).fill(lightBg);
      doc.roundedRect(summaryLeft, y, summaryWidth, 120, 4).strokeColor(borderColor).stroke();

      let sumY = y + 8;
      const lineSummary = (label, val, isBold = false, color = textColor) => {
        doc.fontSize(8.5).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color);
        doc.text(label, summaryLeft + 12, sumY, { width: 120 });
        doc.text(val, summaryLeft + 130, sumY, { width: 80, align: 'right' });
        sumY += 15;
      };

      lineSummary('Items Subtotal:', `Rs. ${Number(sale.subtotal || 0).toFixed(2)}`);

      if (sale.discount > 0) {
        const discLabel = sale.discountValue > 0 ? `Discount (${sale.discountValue}%):` : 'Order Discount:';
        lineSummary(discLabel, `- Rs. ${Number(sale.discount || 0).toFixed(2)}`, false, '#DC2626');
      }

      if (sale.taxAmount > 0) {
        lineSummary('Applicable GST/Tax:', `+ Rs. ${Number(sale.taxAmount || 0).toFixed(2)}`);
      }

      if (sale.rounding && sale.rounding !== 0) {
        lineSummary('Round Off:', `${sale.rounding > 0 ? '+' : ''} Rs. ${Number(sale.rounding).toFixed(2)}`);
      }

      doc.rect(summaryLeft + 10, sumY - 2, summaryWidth - 20, 1).fill(borderColor);
      sumY += 5;

      lineSummary('Total Amount:', `Rs. ${Number(sale.totalAmount || 0).toFixed(2)}`, true, primaryColor);
      lineSummary('Amount Paid:', `Rs. ${Number(sale.amountPaid || 0).toFixed(2)}`, true, '#16A34A');

      if (sale.balanceAmount > 0) {
        lineSummary('Balance Due:', `Rs. ${Number(sale.balanceAmount || 0).toFixed(2)}`, true, '#DC2626');
      }

      // --- FOOTER SIGNATURE ---
      y = Math.max(y + 135, sumY + 20);
      if (y > 740) {
        doc.addPage();
        y = 40;
      }

      doc.fontSize(8).fillColor(mutedColor).font('Helvetica');
      doc.text('This is a computer-generated tax invoice. No physical signature is required.', 40, y);
      doc.text('Authorized Pharmacist / Signatory', 380, y, { width: 175, align: 'right' });

      doc.end();
    });
  }
}

module.exports = new InvoiceService();
