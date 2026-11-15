const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const Medicine = require('../models/Medicine');
const inventoryService = require('./inventoryService');

class PurchaseService {
  /**
   * Helper to generate unique Purchase Order numbers like PO-2026-0001
   */
  async generatePONumber() {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;

    // Find the latest PO for this year
    const latestPO = await PurchaseOrder.findOne({
      purchaseOrderNumber: { $regex: `^${prefix}` },
    })
      .sort({ purchaseOrderNumber: -1 })
      .lean();

    let nextNum = 1;
    if (latestPO && latestPO.purchaseOrderNumber) {
      const parts = latestPO.purchaseOrderNumber.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          nextNum = lastSeq + 1;
        }
      }
    }

    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  /**
   * Internal calculator for PO item totals and order totals
   */
  calculateTotals(items = [], orderDiscount = 0, shippingCharges = 0) {
    let subtotal = 0;
    let totalTax = 0;
    let itemDiscounts = 0;

    const calculatedItems = items.map((item) => {
      const qty = parseFloat(item.orderedQuantity) || 0;
      const cost = parseFloat(item.unitCost) || 0;
      const disc = parseFloat(item.discount) || 0;
      const taxRate = parseFloat(item.taxRate) || 0;

      const itemSubtotal = Math.round(qty * cost * 100) / 100;
      const taxable = Math.max(0, itemSubtotal - disc);
      const taxAmount = Math.round(((taxable * taxRate) / 100) * 100) / 100;
      const lineTotal = Math.round((taxable + taxAmount) * 100) / 100;

      subtotal += itemSubtotal;
      itemDiscounts += disc;
      totalTax += taxAmount;

      return {
        ...item,
        orderedQuantity: qty,
        unitCost: cost,
        discount: disc,
        taxRate,
        taxAmount,
        lineTotal,
      };
    });

    const parsedOrderDiscount = parseFloat(orderDiscount) || 0;
    const parsedShipping = parseFloat(shippingCharges) || 0;

    const totalDiscount = Math.round((itemDiscounts + parsedOrderDiscount) * 100) / 100;
    const totalAmount = Math.max(
      0,
      Math.round((subtotal - totalDiscount + totalTax + parsedShipping) * 100) / 100
    );

    return {
      items: calculatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: totalDiscount,
      taxAmount: Math.round(totalTax * 100) / 100,
      shippingCharges: parsedShipping,
      totalAmount,
    };
  }

  /**
   * Create a purchase order
   */
  async createPurchaseOrder(data, userId) {
    const { supplier: supplierId, items, expectedDeliveryDate, notes, status } = data;

    if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
      const error = new Error('Valid supplier ID is required.');
      error.statusCode = 400;
      throw error;
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!supplier.isActive) {
      const error = new Error('Cannot create purchase order for an inactive supplier.');
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error('A purchase order must contain at least one medicine item.');
      error.statusCode = 400;
      throw error;
    }

    // Verify all medicines exist and are active, extract snapshots
    const processedItems = [];
    for (const item of items) {
      if (!item.medicine || !mongoose.Types.ObjectId.isValid(item.medicine)) {
        const error = new Error('Each item must contain a valid medicine ID.');
        error.statusCode = 400;
        throw error;
      }

      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        const error = new Error(`Medicine not found.`);
        error.statusCode = 404;
        throw error;
      }

      if (!medicine.isActive) {
        const error = new Error(`Cannot add inactive medicine "${medicine.name}" to a purchase order.`);
        error.statusCode = 400;
        throw error;
      }

      const qty = parseFloat(item.orderedQuantity);
      if (isNaN(qty) || qty <= 0) {
        const error = new Error(`Ordered quantity must be positive for ${medicine.name}.`);
        error.statusCode = 400;
        throw error;
      }

      const cost = parseFloat(item.unitCost);
      if (isNaN(cost) || cost < 0) {
        const error = new Error(`Unit cost cannot be negative for ${medicine.name}.`);
        error.statusCode = 400;
        throw error;
      }

      processedItems.push({
        medicine: medicine._id,
        medicineName: medicine.name,
        sku: medicine.sku,
        orderedQuantity: qty,
        receivedQuantity: 0,
        unitCost: cost,
        discount: parseFloat(item.discount) || 0,
        taxRate: parseFloat(item.taxRate) || 0,
      });
    }

    // Calculate totals on backend
    const calculated = this.calculateTotals(
      processedItems,
      data.discount,
      data.shippingCharges
    );

    // Auto-generate PO number
    const purchaseOrderNumber = await this.generatePONumber();

    const poStatus = status === 'ordered' ? 'ordered' : 'draft';

    const purchaseOrder = await PurchaseOrder.create({
      purchaseOrderNumber,
      supplier: supplier._id,
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      status: poStatus,
      items: calculated.items,
      subtotal: calculated.subtotal,
      discount: calculated.discount,
      taxAmount: calculated.taxAmount,
      shippingCharges: calculated.shippingCharges,
      totalAmount: calculated.totalAmount,
      notes: notes ? notes.trim() : '',
      createdBy: userId,
      updatedBy: userId,
    });

    await purchaseOrder.populate('supplier', 'name supplierCode phone email city');
    await purchaseOrder.populate('createdBy', 'name email role');

    return purchaseOrder;
  }

  /**
   * List purchase orders with search and filters
   */
  async getPurchases(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Search query
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');

      // Find matching suppliers first for supplier name search
      const matchingSuppliers = await Supplier.find({ name: regex }).select('_id').lean();
      const supplierIds = matchingSuppliers.map((s) => s._id);

      filter.$or = [
        { purchaseOrderNumber: regex },
        { supplier: { $in: supplierIds } },
      ];
    }

    // Filter by supplier
    if (query.supplier && mongoose.Types.ObjectId.isValid(query.supplier)) {
      filter.supplier = query.supplier;
    }

    // Filter by status
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      filter.orderDate = {};
      if (query.startDate) {
        filter.orderDate.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.orderDate.$lte = end;
      }
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [purchaseOrders, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate('supplier', 'name supplierCode phone email city')
        .populate('createdBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get purchase statistics
   */
  async getPurchaseStats() {
    const [
      totalOrders,
      draftOrders,
      orderedOrders,
      partiallyReceivedOrders,
      receivedOrders,
      cancelledOrders,
      spendAgg,
    ] = await Promise.all([
      PurchaseOrder.countDocuments(),
      PurchaseOrder.countDocuments({ status: 'draft' }),
      PurchaseOrder.countDocuments({ status: 'ordered' }),
      PurchaseOrder.countDocuments({ status: 'partially_received' }),
      PurchaseOrder.countDocuments({ status: 'received' }),
      PurchaseOrder.countDocuments({ status: 'cancelled' }),
      PurchaseOrder.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalSpend: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalPurchaseValue = spendAgg.length > 0 ? spendAgg[0].totalSpend : 0;
    const pendingOrders = orderedOrders + partiallyReceivedOrders;

    return {
      totalOrders,
      draftOrders,
      orderedOrders,
      partiallyReceivedOrders,
      receivedOrders,
      cancelledOrders,
      pendingOrders,
      totalPurchaseValue: Math.round(totalPurchaseValue * 100) / 100,
    };
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid purchase order ID format.');
      error.statusCode = 400;
      throw error;
    }

    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate('supplier')
      .populate('items.medicine', 'name genericName category dosageForm strength unit sku')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .populate('receivingHistory.receivedBy', 'name email role');

    if (!purchaseOrder) {
      const error = new Error('Purchase order not found.');
      error.statusCode = 404;
      throw error;
    }

    return purchaseOrder;
  }

  /**
   * Update draft purchase order
   */
  async updatePurchaseOrder(id, data, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid purchase order ID format.');
      error.statusCode = 400;
      throw error;
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      const error = new Error('Purchase order not found.');
      error.statusCode = 404;
      throw error;
    }

    if (po.status !== 'draft') {
      const error = new Error('Only draft purchase orders can be modified.');
      error.statusCode = 400;
      throw error;
    }

    // If supplier is being updated
    if (data.supplier && data.supplier.toString() !== po.supplier.toString()) {
      const supplier = await Supplier.findById(data.supplier);
      if (!supplier || !supplier.isActive) {
        const error = new Error('Supplier not found or is inactive.');
        error.statusCode = 400;
        throw error;
      }
      po.supplier = supplier._id;
    }

    // If items are being updated
    if (data.items) {
      if (!Array.isArray(data.items) || data.items.length === 0) {
        const error = new Error('Purchase order must have at least one item.');
        error.statusCode = 400;
        throw error;
      }

      const processedItems = [];
      for (const item of data.items) {
        const medicine = await Medicine.findById(item.medicine);
        if (!medicine || !medicine.isActive) {
          const error = new Error(`Medicine not found or inactive: ${item.medicine}`);
          error.statusCode = 400;
          throw error;
        }

        const qty = parseFloat(item.orderedQuantity);
        if (isNaN(qty) || qty <= 0) {
          const error = new Error(`Ordered quantity must be positive for ${medicine.name}.`);
          error.statusCode = 400;
          throw error;
        }

        const cost = parseFloat(item.unitCost);
        if (isNaN(cost) || cost < 0) {
          const error = new Error(`Unit cost cannot be negative for ${medicine.name}.`);
          error.statusCode = 400;
          throw error;
        }

        processedItems.push({
          medicine: medicine._id,
          medicineName: medicine.name,
          sku: medicine.sku,
          orderedQuantity: qty,
          receivedQuantity: 0,
          unitCost: cost,
          discount: parseFloat(item.discount) || 0,
          taxRate: parseFloat(item.taxRate) || 0,
        });
      }

      const calculated = this.calculateTotals(
        processedItems,
        data.discount !== undefined ? data.discount : po.discount,
        data.shippingCharges !== undefined ? data.shippingCharges : po.shippingCharges
      );

      po.items = calculated.items;
      po.subtotal = calculated.subtotal;
      po.discount = calculated.discount;
      po.taxAmount = calculated.taxAmount;
      po.shippingCharges = calculated.shippingCharges;
      po.totalAmount = calculated.totalAmount;
    } else {
      // Recalculate if discount or shipping changed without items change
      if (data.discount !== undefined || data.shippingCharges !== undefined) {
        const calculated = this.calculateTotals(
          po.items,
          data.discount !== undefined ? data.discount : po.discount,
          data.shippingCharges !== undefined ? data.shippingCharges : po.shippingCharges
        );
        po.subtotal = calculated.subtotal;
        po.discount = calculated.discount;
        po.taxAmount = calculated.taxAmount;
        po.shippingCharges = calculated.shippingCharges;
        po.totalAmount = calculated.totalAmount;
      }
    }

    if (data.expectedDeliveryDate !== undefined) {
      po.expectedDeliveryDate = data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null;
    }
    if (data.notes !== undefined) {
      po.notes = data.notes.trim();
    }

    po.updatedBy = userId;
    await po.save();

    await po.populate('supplier', 'name supplierCode phone email city');
    await po.populate('createdBy', 'name email role');

    return po;
  }

  /**
   * Mark draft purchase order as ordered
   */
  async markAsOrdered(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid purchase order ID format.');
      error.statusCode = 400;
      throw error;
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      const error = new Error('Purchase order not found.');
      error.statusCode = 404;
      throw error;
    }

    if (po.status !== 'draft') {
      const error = new Error(`Only draft purchase orders can be marked as ordered. Current status: ${po.status}.`);
      error.statusCode = 400;
      throw error;
    }

    po.status = 'ordered';
    po.updatedBy = userId;
    await po.save();

    await po.populate('supplier', 'name supplierCode phone email city');
    return po;
  }

  /**
   * Cancel purchase order
   */
  async cancelPurchaseOrder(id, userId, reason = '') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid purchase order ID format.');
      error.statusCode = 400;
      throw error;
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      const error = new Error('Purchase order not found.');
      error.statusCode = 404;
      throw error;
    }

    if (po.status === 'cancelled') {
      const error = new Error('Purchase order is already cancelled.');
      error.statusCode = 400;
      throw error;
    }

    if (po.status === 'received') {
      const error = new Error('Fully received purchase orders cannot be cancelled.');
      error.statusCode = 400;
      throw error;
    }

    if (po.status === 'partially_received') {
      const error = new Error('Partially received purchase orders cannot be cancelled.');
      error.statusCode = 400;
      throw error;
    }

    // For ordered status: verify that no items have received quantities
    if (po.status === 'ordered') {
      const anyReceived = po.items.some((item) => item.receivedQuantity > 0);
      if (anyReceived) {
        const error = new Error('Cannot cancel an order with received items.');
        error.statusCode = 400;
        throw error;
      }
    }

    po.status = 'cancelled';
    po.updatedBy = userId;
    if (reason && reason.trim()) {
      po.notes = po.notes ? `${po.notes}\n[Cancelled]: ${reason.trim()}` : `[Cancelled]: ${reason.trim()}`;
    }
    await po.save();

    await po.populate('supplier', 'name supplierCode phone email city');
    return po;
  }

  /**
   * Receive stock for a purchase order (Integrates with Phase 3 Inventory)
   */
  async receiveStock(id, receivingData, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid purchase order ID format.');
      error.statusCode = 400;
      throw error;
    }

    const po = await PurchaseOrder.findById(id).populate('supplier');
    if (!po) {
      const error = new Error('Purchase order not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check status
    if (po.status === 'draft') {
      const error = new Error('Cannot receive stock for a draft order. Please mark it as ordered first.');
      error.statusCode = 400;
      throw error;
    }

    if (po.status === 'received') {
      const error = new Error('This purchase order has already been fully received.');
      error.statusCode = 400;
      throw error;
    }

    if (po.status === 'cancelled') {
      const error = new Error('Cannot receive stock for a cancelled purchase order.');
      error.statusCode = 400;
      throw error;
    }

    const { items: receivedItems, supplierInvoiceNumber, notes } = receivingData;
    if (!Array.isArray(receivedItems) || receivedItems.length === 0) {
      const error = new Error('Please provide at least one item to receive.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Validation pass: Check all received items against PO lines & business rules
    const now = new Date();
    const validatedBatchesToProcess = [];

    for (const recItem of receivedItems) {
      const {
        medicine: medId,
        batchNumber,
        manufacturingDate,
        expiryDate,
        quantityReceived,
        sellingPrice,
        purchasePrice,
      } = recItem;

      if (!medId || !mongoose.Types.ObjectId.isValid(medId)) {
        const error = new Error('Valid medicine ID is required for each received item.');
        error.statusCode = 400;
        throw error;
      }

      // Find matching item in PO
      const poItem = po.items.find((it) => it.medicine.toString() === medId.toString());
      if (!poItem) {
        const error = new Error(`Medicine ${medId} is not part of this purchase order.`);
        error.statusCode = 400;
        throw error;
      }

      const qty = parseFloat(quantityReceived);
      if (isNaN(qty) || qty <= 0) {
        const error = new Error(`Quantity received must be a positive number for ${poItem.medicineName}.`);
        error.statusCode = 400;
        throw error;
      }

      const remainingOrdered = poItem.orderedQuantity - poItem.receivedQuantity;
      if (qty > remainingOrdered) {
        const error = new Error(
          `Received quantity (${qty}) exceeds remaining ordered quantity (${remainingOrdered}) for ${poItem.medicineName}.`
        );
        error.statusCode = 400;
        throw error;
      }

      if (!batchNumber || !batchNumber.trim()) {
        const error = new Error(`Batch number is required for ${poItem.medicineName}.`);
        error.statusCode = 400;
        throw error;
      }

      if (!expiryDate) {
        const error = new Error(`Expiry date is required for batch ${batchNumber}.`);
        error.statusCode = 400;
        throw error;
      }

      const expDate = new Date(expiryDate);
      if (isNaN(expDate.getTime()) || expDate <= now) {
        const error = new Error(
          `Cannot receive expired batch (${batchNumber}). Expiry date must be in the future.`
        );
        error.statusCode = 400;
        throw error;
      }

      const mfgDate = manufacturingDate ? new Date(manufacturingDate) : null;
      if (mfgDate && expDate <= mfgDate) {
        const error = new Error(
          `Expiry date must be later than manufacturing date for batch ${batchNumber}.`
        );
        error.statusCode = 400;
        throw error;
      }

      const sPrice = parseFloat(sellingPrice);
      if (isNaN(sPrice) || sPrice < 0) {
        const error = new Error(`Selling price cannot be negative for batch ${batchNumber}.`);
        error.statusCode = 400;
        throw error;
      }

      const pPrice =
        purchasePrice !== undefined && purchasePrice !== null && !isNaN(parseFloat(purchasePrice))
          ? parseFloat(purchasePrice)
          : poItem.unitCost;

      validatedBatchesToProcess.push({
        poItem,
        medId,
        batchNumber: batchNumber.trim().toUpperCase(),
        manufacturingDate: mfgDate,
        expiryDate: expDate,
        quantityReceived: qty,
        purchasePrice: pPrice,
        sellingPrice: sPrice,
      });
    }

    // 2. Execution pass: Call inventoryService.stockIn() for each item
    const receivingEventItems = [];

    for (const itemData of validatedBatchesToProcess) {
      const stockInResult = await inventoryService.stockIn(
        {
          medicine: itemData.medId,
          batchNumber: itemData.batchNumber,
          manufacturingDate: itemData.manufacturingDate,
          expiryDate: itemData.expiryDate,
          purchasePrice: itemData.purchasePrice,
          sellingPrice: itemData.sellingPrice,
          quantityReceived: itemData.quantityReceived,
          supplierName: po.supplier ? po.supplier.name : '',
          reason: `Purchase Order receipt: ${po.purchaseOrderNumber}`,
          reference: supplierInvoiceNumber ? supplierInvoiceNumber.trim() : po.purchaseOrderNumber,
        },
        userId
      );

      // Increment received quantity on the PO item
      itemData.poItem.receivedQuantity += itemData.quantityReceived;

      receivingEventItems.push({
        medicine: itemData.medId,
        medicineName: itemData.poItem.medicineName,
        batchNumber: itemData.batchNumber,
        quantityReceived: itemData.quantityReceived,
        purchasePrice: itemData.purchasePrice,
        sellingPrice: itemData.sellingPrice,
        expiryDate: itemData.expiryDate,
        manufacturingDate: itemData.manufacturingDate,
        batchId: stockInResult.batch._id,
        transactionId: stockInResult.transaction._id,
      });
    }

    // 3. Update PO overall status
    const allFullyReceived = po.items.every((it) => it.receivedQuantity >= it.orderedQuantity);
    if (allFullyReceived) {
      po.status = 'received';
      po.receivedAt = new Date();
    } else {
      po.status = 'partially_received';
    }

    // Record receiving history event
    po.receivingHistory.push({
      receivedAt: new Date(),
      receivedBy: userId,
      supplierInvoiceNumber: supplierInvoiceNumber ? supplierInvoiceNumber.trim() : '',
      notes: notes ? notes.trim() : '',
      items: receivingEventItems,
    });

    po.updatedBy = userId;
    await po.save();

    await po.populate('supplier', 'name supplierCode phone email city');
    await po.populate('createdBy', 'name email role');
    await po.populate('updatedBy', 'name email role');

    return {
      purchaseOrder: po,
      receivingRecord: po.receivingHistory[po.receivingHistory.length - 1],
    };
  }
}

module.exports = new PurchaseService();
