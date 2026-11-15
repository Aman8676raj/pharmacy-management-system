const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const SalePayment = require('../models/SalePayment');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const Customer = require('../models/Customer');
const Prescription = require('../models/Prescription');
const inventoryService = require('./inventoryService');

class SalesService {
  /**
   * Generate sequential, unique invoice number: INV-YYYYMMDD-XXXX
   */
  async generateInvoiceNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `INV-${year}${month}${day}`;

    // Find latest invoice created today
    const latestSale = await Sale.findOne({
      invoiceNumber: new RegExp(`^${prefix}`),
    })
      .sort({ invoiceNumber: -1 })
      .select('invoiceNumber')
      .lean();

    let sequence = 1;
    if (latestSale && latestSale.invoiceNumber) {
      const parts = latestSale.invoiceNumber.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          sequence = lastSeq + 1;
        }
      }
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Create POS Sale with FEFO stock deduction and optional initial payment
   */
  async createSale(data, userId) {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      const error = new Error('A sale must include at least one medicine item.');
      error.statusCode = 400;
      throw error;
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const processedItems = [];
    const successfulDeductions = []; // For rollback in case of midway failure

    // Verify customer if provided
    let customerDoc = null;
    if (data.customer && mongoose.Types.ObjectId.isValid(data.customer)) {
      customerDoc = await Customer.findById(data.customer);
    }

    // Verify prescription if provided
    let verifiedPrescription = null;
    if (data.prescription && mongoose.Types.ObjectId.isValid(data.prescription)) {
      const pDoc = await Prescription.findById(data.prescription);
      if (!pDoc) {
        const error = new Error('Selected prescription not found.');
        error.statusCode = 404;
        throw error;
      }
      if (pDoc.status !== 'verified') {
        const error = new Error(
          `Prescription ${pDoc.prescriptionNumber} is ${pDoc.status}. Only verified prescriptions can be dispensed.`
        );
        error.statusCode = 400;
        throw error;
      }
      if (pDoc.expiryDate && new Date(pDoc.expiryDate) < new Date()) {
        const error = new Error(`Prescription ${pDoc.prescriptionNumber} has expired.`);
        error.statusCode = 400;
        throw error;
      }
      verifiedPrescription = pDoc;
    }

    try {
      for (const rawItem of data.items) {
        if (!rawItem.medicine || !mongoose.Types.ObjectId.isValid(rawItem.medicine)) {
          const error = new Error('Invalid medicine ID format.');
          error.statusCode = 400;
          throw error;
        }

        const medicine = await Medicine.findById(rawItem.medicine);
        if (!medicine) {
          const error = new Error(`Medicine not found: ${rawItem.medicine}`);
          error.statusCode = 404;
          throw error;
        }

        if (!medicine.isActive) {
          const error = new Error(`Cannot sell inactive medicine: ${medicine.name}`);
          error.statusCode = 400;
          throw error;
        }

        // Check prescription policy if configured
        if (medicine.requiresPrescription && data.requireVerifiedPrescription && !verifiedPrescription) {
          const error = new Error(
            `A verified doctor prescription is required to dispense ${medicine.name} (Schedule H/X).`
          );
          error.statusCode = 400;
          throw error;
        }

        const quantity = parseInt(rawItem.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
          const error = new Error(`Quantity for ${medicine.name} must be at least 1.`);
          error.statusCode = 400;
          throw error;
        }

        // Selling price: from item or medicine default
        const unitPrice = parseFloat(rawItem.unitPrice);
        if (isNaN(unitPrice) || unitPrice < 0) {
          const error = new Error(`Unit price for ${medicine.name} cannot be negative.`);
          error.statusCode = 400;
          throw error;
        }

        // Deduct batches using FEFO strategy
        const batchAllocations = await inventoryService.deductFEFO(
          medicine._id,
          quantity,
          `POS Sale checkout - ${invoiceNumber}`,
          invoiceNumber,
          userId
        );

        // Keep track of successful deductions for rollback if subsequent items fail
        for (const alloc of batchAllocations) {
          successfulDeductions.push({
            batchId: alloc.batch,
            quantity: alloc.quantity,
          });
        }

        // Calculations for line item
        const itemDiscount = Math.max(0, parseFloat(rawItem.discount || 0));
        const discountType = rawItem.discountType === 'fixed' ? 'fixed' : 'percentage';
        const taxRate = Math.max(0, parseFloat(rawItem.taxRate || 0));

        const baseTotal = quantity * unitPrice;
        const discountAmount = discountType === 'fixed'
          ? Math.min(baseTotal, itemDiscount)
          : (baseTotal * itemDiscount) / 100;

        const taxableAmount = Math.max(0, baseTotal - discountAmount);
        const taxAmount = (taxableAmount * taxRate) / 100;
        const lineTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

        processedItems.push({
          medicine: medicine._id,
          medicineName: medicine.name,
          sku: medicine.sku || '',
          unit: medicine.unit || 'Strip',
          dosageForm: medicine.dosageForm || '',
          quantity,
          unitPrice,
          discount: itemDiscount,
          discountType,
          taxRate,
          taxAmount: Math.round(taxAmount * 100) / 100,
          lineTotal,
          batchAllocations,
        });
      }
    } catch (deductError) {
      // Rollback any stock already deducted
      for (const deduction of successfulDeductions) {
        try {
          await inventoryService.restoreBatchStock(
            deduction.batchId,
            deduction.quantity,
            `POS checkout error rollback - ${invoiceNumber}`,
            invoiceNumber,
            userId
          );
        } catch (rollbackErr) {
          console.error('Failed to rollback deduction:', rollbackErr);
        }
      }
      throw deductError;
    }

    // Financial calculations
    const subtotal = processedItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const itemDiscountsSum = processedItems.reduce(
      (acc, item) =>
        acc +
        (item.discountType === 'fixed'
          ? item.discount
          : (item.quantity * item.unitPrice * item.discount) / 100),
      0
    );

    const orderDiscountValue = Math.max(0, parseFloat(data.discountValue || data.discount || 0));
    const orderDiscountType = data.discountType === 'fixed' ? 'fixed' : 'percentage';
    const orderDiscountAmount = orderDiscountType === 'fixed'
      ? Math.min(subtotal - itemDiscountsSum, orderDiscountValue)
      : ((subtotal - itemDiscountsSum) * orderDiscountValue) / 100;

    const totalDiscount = Math.round((itemDiscountsSum + orderDiscountAmount) * 100) / 100;
    const totalTaxAmount = Math.round(
      processedItems.reduce((acc, item) => acc + item.taxAmount, 0) * 100
    ) / 100;

    const rawTotal = subtotal - totalDiscount + totalTaxAmount;
    const roundedTotal = Math.max(0, Math.round(rawTotal * 100) / 100);
    const rounding = Math.round((roundedTotal - rawTotal) * 100) / 100;

    // Payment calculations
    const amountPaid = Math.max(0, parseFloat(data.amountPaid || 0));
    let paymentStatus = 'unpaid';
    let balanceAmount = roundedTotal;

    if (amountPaid >= roundedTotal) {
      paymentStatus = 'paid';
      balanceAmount = 0;
    } else if (amountPaid > 0) {
      paymentStatus = 'partially_paid';
      balanceAmount = Math.round((roundedTotal - amountPaid) * 100) / 100;
    }

    // Create Sale
    const sale = await Sale.create({
      invoiceNumber,
      customer: customerDoc
        ? customerDoc._id
        : data.customer && mongoose.Types.ObjectId.isValid(data.customer)
        ? data.customer
        : null,
      prescription: verifiedPrescription
        ? verifiedPrescription._id
        : data.prescription && mongoose.Types.ObjectId.isValid(data.prescription)
        ? data.prescription
        : null,
      customerSnapshot: {
        name: data.customerSnapshot?.name?.trim() || customerDoc?.name || 'Walk-in Customer',
        phone: data.customerSnapshot?.phone?.trim() || customerDoc?.phone || '',
        email: data.customerSnapshot?.email?.trim() || customerDoc?.email || '',
        address: data.customerSnapshot?.address?.trim() || customerDoc?.address || '',
        prescriptionRef: verifiedPrescription
          ? `${verifiedPrescription.prescriptionNumber} - Dr. ${verifiedPrescription.doctorName}`
          : data.customerSnapshot?.prescriptionRef?.trim() || '',
      },
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: totalDiscount,
      discountType: orderDiscountType,
      discountValue: orderDiscountValue,
      taxAmount: totalTaxAmount,
      rounding,
      totalAmount: roundedTotal,
      amountPaid: Math.min(amountPaid, roundedTotal),
      balanceAmount,
      paymentStatus,
      paymentMethod: data.paymentMethod || 'cash',
      saleStatus: 'completed',
      notes: data.notes?.trim() || '',
      soldBy: userId,
    });

    // Record initial payment if amountPaid > 0
    let initialPayment = null;
    if (amountPaid > 0) {
      initialPayment = await SalePayment.create({
        sale: sale._id,
        paymentReference: data.paymentReference?.trim() || `PAY-${invoiceNumber.split('-').slice(1).join('-')}-01`,
        amount: Math.min(amountPaid, roundedTotal),
        paymentMethod: data.paymentMethod || 'cash',
        notes: data.paymentNotes?.trim() || 'Initial POS checkout payment',
        receivedBy: userId,
      });
    }

    await sale.populate('soldBy', 'name email role');

    return { sale, initialPayment };
  }

  /**
   * Paginated listing of sales with filtering & Cashier isolation
   */
  async getSales(query = {}, user = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Cashier isolation: cashiers only see their own sales
    if (user && user.role === 'cashier') {
      filter.soldBy = user._id;
    } else if (query.soldBy && mongoose.Types.ObjectId.isValid(query.soldBy)) {
      filter.soldBy = new mongoose.Types.ObjectId(query.soldBy);
    }

    if (query.paymentStatus && query.paymentStatus !== 'all') {
      filter.paymentStatus = query.paymentStatus;
    }

    if (query.saleStatus && query.saleStatus !== 'all') {
      filter.saleStatus = query.saleStatus;
    }

    if (query.paymentMethod && query.paymentMethod !== 'all') {
      filter.paymentMethod = query.paymentMethod;
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Search query: invoice number, customer name, phone
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { invoiceNumber: searchRegex },
        { 'customerSnapshot.name': searchRegex },
        { 'customerSnapshot.phone': searchRegex },
        { 'customerSnapshot.prescriptionRef': searchRegex },
      ];
    }

    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('soldBy', 'name email role')
        .populate('cancelledBy', 'name email role'),
      Sale.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      sales,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single sale by ID with payments history & permission check
   */
  async getSaleById(id, user = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid sale ID format.');
      error.statusCode = 400;
      throw error;
    }

    const sale = await Sale.findById(id)
      .populate('soldBy', 'name email role')
      .populate('cancelledBy', 'name email role')
      .populate('customer', 'name phone email customerCode')
      .populate('prescription', 'prescriptionNumber doctorName status issueDate')
      .populate('items.medicine', 'name genericName brandName sku dosageForm unit category requiresPrescription');

    if (!sale) {
      const error = new Error('Sale not found.');
      error.statusCode = 404;
      throw error;
    }

    // Cashier permission check
    if (user && user.role === 'cashier' && sale.soldBy?._id.toString() !== user._id.toString()) {
      const error = new Error('Access denied. Cashiers can only access their own sales records.');
      error.statusCode = 403;
      throw error;
    }

    const payments = await SalePayment.find({ sale: sale._id })
      .populate('receivedBy', 'name email role')
      .sort({ paymentDate: -1 });

    return { sale, payments };
  }

  /**
   * Get sale by invoice number
   */
  async getSaleByInvoice(invoiceNumber, user = {}) {
    if (!invoiceNumber || !invoiceNumber.trim()) {
      const error = new Error('Invoice number is required.');
      error.statusCode = 400;
      throw error;
    }

    const sale = await Sale.findOne({
      invoiceNumber: invoiceNumber.trim().toUpperCase(),
    })
      .populate('soldBy', 'name email role')
      .populate('cancelledBy', 'name email role')
      .populate('customer', 'name phone email customerCode')
      .populate('prescription', 'prescriptionNumber doctorName status issueDate')
      .populate('items.medicine', 'name genericName brandName sku dosageForm unit category');

    if (!sale) {
      const error = new Error(`Invoice not found: ${invoiceNumber}`);
      error.statusCode = 404;
      throw error;
    }

    if (user && user.role === 'cashier' && sale.soldBy?._id.toString() !== user._id.toString()) {
      const error = new Error('Access denied. Cashiers can only access their own sales records.');
      error.statusCode = 403;
      throw error;
    }

    const payments = await SalePayment.find({ sale: sale._id })
      .populate('receivedBy', 'name email role')
      .sort({ paymentDate: -1 });

    return { sale, payments };
  }

  /**
   * Record subsequent payment on a partially paid or unpaid sale
   */
  async recordPayment(saleId, paymentData, userId) {
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      const error = new Error('Invalid sale ID format.');
      error.statusCode = 400;
      throw error;
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      const error = new Error('Sale not found.');
      error.statusCode = 404;
      throw error;
    }

    if (sale.saleStatus === 'cancelled') {
      const error = new Error('Cannot record payment for a cancelled sale.');
      error.statusCode = 400;
      throw error;
    }

    if (sale.paymentStatus === 'paid' || sale.balanceAmount <= 0) {
      const error = new Error('This invoice is already fully paid.');
      error.statusCode = 400;
      throw error;
    }

    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      const error = new Error('Payment amount must be greater than zero.');
      error.statusCode = 400;
      throw error;
    }

    // Determine actual payable amount (cap at remaining balance)
    const effectivePayment = Math.min(amount, sale.balanceAmount);

    const paymentCount = await SalePayment.countDocuments({ sale: sale._id });
    const paymentSeq = String(paymentCount + 1).padStart(2, '0');
    const paymentRef = paymentData.paymentReference?.trim() || `PAY-${sale.invoiceNumber.split('-').slice(1).join('-')}-${paymentSeq}`;

    const payment = await SalePayment.create({
      sale: sale._id,
      paymentReference: paymentRef,
      amount: effectivePayment,
      paymentMethod: paymentData.paymentMethod || 'cash',
      notes: paymentData.notes?.trim() || 'Subsequent balance payment',
      receivedBy: userId,
    });

    const newAmountPaid = Math.round((sale.amountPaid + effectivePayment) * 100) / 100;
    const newBalance = Math.max(0, Math.round((sale.totalAmount - newAmountPaid) * 100) / 100);

    sale.amountPaid = newAmountPaid;
    sale.balanceAmount = newBalance;
    sale.paymentStatus = newBalance === 0 ? 'paid' : 'partially_paid';

    await sale.save();
    await payment.populate('receivedBy', 'name email role');

    return { sale, payment };
  }

  /**
   * Cancel sale (Admin-only), restores stock to original batches with return_in transactions
   */
  async cancelSale(saleId, { reason }, userId) {
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      const error = new Error('Invalid sale ID format.');
      error.statusCode = 400;
      throw error;
    }

    if (!reason || !reason.trim()) {
      const error = new Error('A cancellation reason is required.');
      error.statusCode = 400;
      throw error;
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      const error = new Error('Sale not found.');
      error.statusCode = 404;
      throw error;
    }

    if (sale.saleStatus === 'cancelled') {
      const error = new Error('This sale has already been cancelled.');
      error.statusCode = 400;
      throw error;
    }

    // Restore stock for all allocated batches in each item
    for (const item of sale.items) {
      for (const allocation of item.batchAllocations) {
        await inventoryService.restoreBatchStock(
          allocation.batch,
          allocation.quantity,
          `Sale cancellation (${sale.invoiceNumber}): ${reason.trim()}`,
          sale.invoiceNumber,
          userId
        );
      }
    }

    sale.saleStatus = 'cancelled';
    sale.cancelledBy = userId;
    sale.cancelReason = reason.trim();
    sale.cancelledAt = new Date();

    await sale.save();
    await sale.populate('soldBy', 'name email role');
    await sale.populate('cancelledBy', 'name email role');

    return sale;
  }

  /**
   * Compute comprehensive sales statistics for dashboard and reports
   */
  async getSaleStats(query = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    // 1. Overall Completed Sales Aggregation
    const completedSales = await Sale.find({ saleStatus: 'completed' });
    const todaySales = completedSales.filter((s) => new Date(s.createdAt) >= today);

    const totalRevenue = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalAmountPaid = completedSales.reduce((acc, s) => acc + s.amountPaid, 0);
    const totalBalanceDue = completedSales.reduce((acc, s) => acc + s.balanceAmount, 0);

    // Calculate Gross Margin & Cost of Goods Sold (COGS)
    let totalCOGS = 0;
    for (const s of completedSales) {
      for (const item of s.items) {
        for (const alloc of item.batchAllocations) {
          totalCOGS += (alloc.unitCost || 0) * alloc.quantity;
        }
      }
    }
    const totalGrossProfit = totalRevenue - totalCOGS;
    const grossMarginPercent = totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Payment Status distribution
    const paidCount = completedSales.filter((s) => s.paymentStatus === 'paid').length;
    const partialCount = completedSales.filter((s) => s.paymentStatus === 'partially_paid').length;
    const unpaidCount = completedSales.filter((s) => s.paymentStatus === 'unpaid').length;
    const cancelledCount = await Sale.countDocuments({ saleStatus: 'cancelled' });

    // Average Order Value (AOV)
    const aov = completedSales.length > 0 ? (totalRevenue / completedSales.length).toFixed(2) : 0;

    // 7-day trend for chart
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const daySales = completedSales.filter((s) => {
        const c = new Date(s.createdAt);
        return c >= d && c < nextD;
      });

      const dayRevenue = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
      const dayCount = daySales.length;

      dailyTrend.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.round(dayRevenue * 100) / 100,
        orders: dayCount,
      });
    }

    return {
      today: {
        count: todaySales.length,
        revenue: Math.round(todayRevenue * 100) / 100,
      },
      overall: {
        totalSales: completedSales.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalAmountPaid: Math.round(totalAmountPaid * 100) / 100,
        totalBalanceDue: Math.round(totalBalanceDue * 100) / 100,
        totalCOGS: Math.round(totalCOGS * 100) / 100,
        totalGrossProfit: Math.round(totalGrossProfit * 100) / 100,
        grossMarginPercent: parseFloat(grossMarginPercent),
        aov: parseFloat(aov),
      },
      statusCounts: {
        paid: paidCount,
        partially_paid: partialCount,
        unpaid: unpaidCount,
        cancelled: cancelledCount,
      },
      dailyTrend,
    };
  }

  /**
   * Profit & margin analysis for a single sale
   */
  async getSaleProfit(saleId) {
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      const error = new Error('Invalid sale ID format.');
      error.statusCode = 400;
      throw error;
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      const error = new Error('Sale not found.');
      error.statusCode = 404;
      throw error;
    }

    let cogs = 0;
    const itemProfits = [];

    for (const item of sale.items) {
      let itemCost = 0;
      for (const alloc of item.batchAllocations) {
        itemCost += (alloc.unitCost || 0) * alloc.quantity;
      }
      cogs += itemCost;
      const profit = item.lineTotal - itemCost;
      const margin = item.lineTotal > 0 ? ((profit / item.lineTotal) * 100).toFixed(1) : 0;

      itemProfits.push({
        medicineName: item.medicineName,
        quantity: item.quantity,
        revenue: item.lineTotal,
        cost: itemCost,
        profit: Math.round(profit * 100) / 100,
        marginPercent: parseFloat(margin),
      });
    }

    const grossProfit = Math.round((sale.totalAmount - cogs) * 100) / 100;
    const marginPercent = sale.totalAmount > 0 ? parseFloat(((grossProfit / sale.totalAmount) * 100).toFixed(1)) : 0;

    return {
      invoiceNumber: sale.invoiceNumber,
      totalRevenue: sale.totalAmount,
      totalCost: Math.round(cogs * 100) / 100,
      grossProfit,
      marginPercent,
      itemProfits,
    };
  }
}

module.exports = new SalesService();

