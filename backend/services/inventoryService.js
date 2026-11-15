const mongoose = require('mongoose');
const MedicineBatch = require('../models/MedicineBatch');
const InventoryTransaction = require('../models/InventoryTransaction');
const Medicine = require('../models/Medicine');

class InventoryService {
  /**
   * Helper to ensure expired statuses are updated in DB
   */
  async autoUpdateExpiredBatches() {
    const now = new Date();
    await MedicineBatch.updateMany(
      {
        expiryDate: { $lt: now },
        status: { $nin: ['expired', 'quarantined'] },
      },
      { status: 'expired' }
    );
  }

  /**
   * Add stock (stock-in) to a new or existing batch
   */
  async stockIn(data, userId) {
    if (!mongoose.Types.ObjectId.isValid(data.medicine)) {
      const error = new Error('Invalid medicine ID format.');
      error.statusCode = 400;
      throw error;
    }

    // Verify medicine exists and is active
    const medicine = await Medicine.findById(data.medicine);
    if (!medicine) {
      const error = new Error('Medicine not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!medicine.isActive) {
      const error = new Error('Cannot add stock to an inactive medicine.');
      error.statusCode = 400;
      throw error;
    }

    const batchNumber = data.batchNumber.trim().toUpperCase();
    const quantityReceived = parseFloat(data.quantityReceived);

    if (isNaN(quantityReceived) || quantityReceived <= 0) {
      const error = new Error('Quantity received must be a positive number.');
      error.statusCode = 400;
      throw error;
    }

    const purchasePrice = parseFloat(data.purchasePrice);
    const sellingPrice = parseFloat(data.sellingPrice);

    if (isNaN(purchasePrice) || purchasePrice < 0) {
      const error = new Error('Purchase price cannot be negative.');
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(sellingPrice) || sellingPrice < 0) {
      const error = new Error('Selling price cannot be negative.');
      error.statusCode = 400;
      throw error;
    }

    // Check if batch already exists for this medicine
    let batch = await MedicineBatch.findOne({
      medicine: medicine._id,
      batchNumber,
    });

    let previousQuantity = 0;
    let isExistingBatch = false;

    if (batch) {
      // Existing batch found: replenish stock
      isExistingBatch = true;
      previousQuantity = batch.availableQuantity;

      batch.availableQuantity += quantityReceived;
      batch.quantityReceived += quantityReceived;

      // Update pricing if new prices are provided
      if (purchasePrice > 0) batch.purchasePrice = purchasePrice;
      if (sellingPrice > 0) batch.sellingPrice = sellingPrice;
      if (data.supplierName) batch.supplierName = data.supplierName.trim();
      if (data.manufacturingDate) batch.manufacturingDate = new Date(data.manufacturingDate);
      if (data.expiryDate) batch.expiryDate = new Date(data.expiryDate);

      // Save batch (pre-save handles status recalculation)
      await batch.save();
    } else {
      // New batch creation
      const manufacturingDate = data.manufacturingDate ? new Date(data.manufacturingDate) : null;
      const expiryDate = new Date(data.expiryDate);

      if (manufacturingDate && expiryDate <= manufacturingDate) {
        const error = new Error('Expiry date must be later than manufacturing date.');
        error.statusCode = 400;
        throw error;
      }

      batch = await MedicineBatch.create({
        medicine: medicine._id,
        batchNumber,
        manufacturingDate,
        expiryDate,
        purchasePrice,
        sellingPrice,
        quantityReceived,
        availableQuantity: quantityReceived,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
        supplierName: data.supplierName ? data.supplierName.trim() : '',
        createdBy: userId,
      });
    }

    // Create immutable audit transaction record
    const transaction = await InventoryTransaction.create({
      medicine: medicine._id,
      batch: batch._id,
      transactionType: 'stock_in',
      quantity: quantityReceived,
      previousQuantity,
      newQuantity: batch.availableQuantity,
      reason: data.reason || (isExistingBatch ? 'Stock replenishment' : 'Initial batch entry'),
      reference: data.reference || `RCV-${Date.now().toString().slice(-6)}`,
      performedBy: userId,
    });

    await batch.populate('medicine', 'name genericName brandName category sku dosageForm strength unit');
    await batch.populate('createdBy', 'name email role');

    return {
      batch,
      transaction,
      isExistingBatch,
    };
  }

  /**
   * Paginated inventory listing with filters
   */
  async getInventory(query = {}) {
    await this.autoUpdateExpiredBatches();

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by medicine ID
    if (query.medicine && mongoose.Types.ObjectId.isValid(query.medicine)) {
      filter.medicine = new mongoose.Types.ObjectId(query.medicine);
    }

    // Filter by batch status
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    // Expiry classifications
    const now = new Date();
    const in90Days = new Date();
    in90Days.setDate(in90Days.getDate() + 90);

    if (query.expiry === 'expired') {
      filter.expiryDate = { $lt: now };
    } else if (query.expiry === 'expiring_soon') {
      filter.expiryDate = { $gte: now, $lte: in90Days };
      if (!filter.status) filter.status = 'active';
    } else if (query.expiry === 'safe') {
      filter.expiryDate = { $gt: in90Days };
    }

    // Search query
    let medicineIds = null;
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      const matchedMeds = await Medicine.find({
        $or: [
          { name: searchRegex },
          { genericName: searchRegex },
          { brandName: searchRegex },
          { sku: searchRegex },
        ],
      }).select('_id');

      medicineIds = matchedMeds.map((m) => m._id);

      // Search either in matched medicine IDs OR batch number
      filter.$or = [
        { medicine: { $in: medicineIds } },
        { batchNumber: searchRegex },
        { supplierName: searchRegex },
      ];
    }

    // Category filter
    if (query.category && query.category !== 'all') {
      const catRegex = new RegExp(`^${query.category.trim()}$`, 'i');
      const medsInCat = await Medicine.find({ category: catRegex }).select('_id');
      const catMedIds = medsInCat.map((m) => m._id);

      if (filter.medicine) {
        // If already filtering by medicine, ensure it's in category
      } else if (filter.$or) {
        filter.medicine = { $in: catMedIds };
      } else {
        filter.medicine = { $in: catMedIds };
      }
    }

    // Sorting
    const sortBy = query.sortBy || 'expiryDate';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortOrder };

    const [batches, total] = await Promise.all([
      MedicineBatch.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('medicine', 'name genericName brandName category sku dosageForm strength unit minimumStock isActive')
        .populate('createdBy', 'name email role'),
      MedicineBatch.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      batches,
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
   * Aggregate real-time inventory statistics
   */
  async getInventorySummary() {
    await this.autoUpdateExpiredBatches();

    const now = new Date();
    const in90Days = new Date();
    in90Days.setDate(in90Days.getDate() + 90);

    const [
      totalActiveMedicines,
      totalBatches,
      sellableUnitsResult,
      expiringBatchCount,
      expiredBatchCount,
      quarantinedBatchCount,
      purchaseValueResult,
      lowStockList,
    ] = await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      MedicineBatch.countDocuments(),
      MedicineBatch.aggregate([
        {
          $match: {
            status: 'active',
            expiryDate: { $gte: now },
            availableQuantity: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$availableQuantity' },
          },
        },
      ]),
      MedicineBatch.countDocuments({
        status: 'active',
        availableQuantity: { $gt: 0 },
        expiryDate: { $gte: now, $lte: in90Days },
      }),
      MedicineBatch.countDocuments({
        expiryDate: { $lt: now },
      }),
      MedicineBatch.countDocuments({
        status: 'quarantined',
      }),
      MedicineBatch.aggregate([
        {
          $match: {
            availableQuantity: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            totalPurchaseValue: {
              $sum: { $multiply: ['$purchasePrice', '$availableQuantity'] },
            },
          },
        },
      ]),
      this.getLowStockMedicines(),
    ]);

    const totalSellableUnits = sellableUnitsResult[0]?.totalUnits || 0;
    const inventoryPurchaseValue = purchaseValueResult[0]?.totalPurchaseValue || 0;
    const lowStockMedicineCount = lowStockList.length;

    return {
      totalActiveMedicines,
      totalBatches,
      totalSellableUnits,
      lowStockMedicineCount,
      expiringBatchCount,
      expiredBatchCount,
      quarantinedBatchCount,
      inventoryPurchaseValue,
    };
  }

  /**
   * Get single batch details with recent transaction history
   */
  async getBatchById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid batch ID format.');
      error.statusCode = 400;
      throw error;
    }

    const batch = await MedicineBatch.findById(id)
      .populate('medicine', 'name genericName brandName category sku dosageForm strength unit minimumStock isActive')
      .populate('createdBy', 'name email role');

    if (!batch) {
      const error = new Error('Batch record not found.');
      error.statusCode = 404;
      throw error;
    }

    const transactions = await InventoryTransaction.find({ batch: batch._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('performedBy', 'name email role');

    return {
      batch,
      transactions,
    };
  }

  /**
   * List all batches for a specific medicine
   */
  async getMedicineBatches(medicineId) {
    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      const error = new Error('Invalid medicine ID format.');
      error.statusCode = 400;
      throw error;
    }

    await this.autoUpdateExpiredBatches();

    const batches = await MedicineBatch.find({ medicine: medicineId })
      .sort({ expiryDate: 1 })
      .populate('createdBy', 'name email role');

    return batches;
  }

  /**
   * Adjust batch quantity (Damage, audit count, discrepancy)
   */
  async adjustBatch(id, { adjustmentType, quantity, reason, reference }, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid batch ID format.');
      error.statusCode = 400;
      throw error;
    }

    if (!adjustmentType || !['adjustment_in', 'adjustment_out'].includes(adjustmentType)) {
      const error = new Error("Adjustment type must be either 'adjustment_in' or 'adjustment_out'.");
      error.statusCode = 400;
      throw error;
    }

    const adjQty = parseFloat(quantity);
    if (isNaN(adjQty) || adjQty <= 0) {
      const error = new Error('Adjustment quantity must be greater than zero.');
      error.statusCode = 400;
      throw error;
    }

    if (!reason || !reason.trim()) {
      const error = new Error('A valid reason is required for stock adjustments.');
      error.statusCode = 400;
      throw error;
    }

    const batch = await MedicineBatch.findById(id).populate('medicine');
    if (!batch) {
      const error = new Error('Batch record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (batch.status === 'quarantined') {
      const error = new Error('Cannot adjust stock on a quarantined batch. Release the batch first.');
      error.statusCode = 400;
      throw error;
    }

    const previousQuantity = batch.availableQuantity;
    let newQuantity = previousQuantity;

    if (adjustmentType === 'adjustment_out') {
      if (previousQuantity - adjQty < 0) {
        const error = new Error(
          `Insufficient stock for deduction. Available: ${previousQuantity}, Requested: ${adjQty}`
        );
        error.statusCode = 400;
        throw error;
      }
      newQuantity = previousQuantity - adjQty;
    } else {
      newQuantity = previousQuantity + adjQty;
    }

    batch.availableQuantity = newQuantity;
    await batch.save();

    // Create immutable audit transaction
    const transaction = await InventoryTransaction.create({
      medicine: batch.medicine._id,
      batch: batch._id,
      transactionType: adjustmentType,
      quantity: adjQty,
      previousQuantity,
      newQuantity,
      reason: reason.trim(),
      reference: reference || `ADJ-${Date.now().toString().slice(-6)}`,
      performedBy: userId,
    });

    return {
      batch,
      transaction,
    };
  }

  /**
   * Quarantine a batch
   */
  async quarantineBatch(id, { reason }, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid batch ID format.');
      error.statusCode = 400;
      throw error;
    }

    const batch = await MedicineBatch.findById(id);
    if (!batch) {
      const error = new Error('Batch record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (batch.status === 'quarantined') {
      const error = new Error('Batch is already quarantined.');
      error.statusCode = 400;
      throw error;
    }

    batch.status = 'quarantined';
    await batch.save();

    const transaction = await InventoryTransaction.create({
      medicine: batch.medicine,
      batch: batch._id,
      transactionType: 'quarantine',
      quantity: batch.availableQuantity,
      previousQuantity: batch.availableQuantity,
      newQuantity: batch.availableQuantity,
      reason: reason || 'Quarantined for quality / compliance review',
      performedBy: userId,
    });

    return { batch, transaction };
  }

  /**
   * Release a batch from quarantine
   */
  async releaseBatch(id, { reason }, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid batch ID format.');
      error.statusCode = 400;
      throw error;
    }

    const batch = await MedicineBatch.findById(id);
    if (!batch) {
      const error = new Error('Batch record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (batch.status !== 'quarantined') {
      const error = new Error('Batch is not currently in quarantine.');
      error.statusCode = 400;
      throw error;
    }

    // Re-evaluate status based on expiry and stock
    const isExpired = new Date(batch.expiryDate) < new Date();
    if (isExpired) {
      batch.status = 'expired';
    } else if (batch.availableQuantity === 0) {
      batch.status = 'depleted';
    } else {
      batch.status = 'active';
    }

    await batch.save();

    const transaction = await InventoryTransaction.create({
      medicine: batch.medicine,
      batch: batch._id,
      transactionType: 'release',
      quantity: batch.availableQuantity,
      previousQuantity: batch.availableQuantity,
      newQuantity: batch.availableQuantity,
      reason: reason || 'Released from quarantine to active inventory',
      performedBy: userId,
    });

    return { batch, transaction };
  }

  /**
   * Get medicines where total sellable stock <= Medicine.minimumStock
   */
  async getLowStockMedicines() {
    await this.autoUpdateExpiredBatches();

    const now = new Date();

    const medicines = await Medicine.find({ isActive: true });
    const lowStockMedicines = [];

    for (const med of medicines) {
      // Sum eligible sellable stock across active, non-expired, non-quarantined batches
      const eligibleBatches = await MedicineBatch.find({
        medicine: med._id,
        status: 'active',
        expiryDate: { $gte: now },
        availableQuantity: { $gt: 0 },
      });

      const totalSellableQuantity = eligibleBatches.reduce(
        (sum, b) => sum + b.availableQuantity,
        0
      );

      const minimumStock = med.minimumStock !== undefined ? med.minimumStock : 10;

      if (totalSellableQuantity <= minimumStock) {
        lowStockMedicines.push({
          medicine: med,
          totalSellableQuantity,
          minimumStock,
          deficit: Math.max(0, minimumStock - totalSellableQuantity),
          activeBatchesCount: eligibleBatches.length,
          isCritical: totalSellableQuantity === 0 || totalSellableQuantity <= minimumStock / 2,
        });
      }
    }

    // Sort by deficit descending
    return lowStockMedicines.sort((a, b) => b.deficit - a.deficit);
  }

  /**
   * List batches expiring soon (within 90 days threshold)
   */
  async getExpiringBatches(days = 90) {
    await this.autoUpdateExpiredBatches();

    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + parseInt(days, 10));

    const batches = await MedicineBatch.find({
      status: 'active',
      availableQuantity: { $gt: 0 },
      expiryDate: { $gte: now, $lte: thresholdDate },
    })
      .sort({ expiryDate: 1 })
      .populate('medicine', 'name genericName brandName category sku dosageForm strength unit');

    return batches.map((b) => {
      const diffTime = new Date(b.expiryDate) - now;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...b.toJSON(),
        daysLeft,
        isUrgent: daysLeft <= 30,
      };
    });
  }

  /**
   * List expired batches
   */
  async getExpiredBatches() {
    await this.autoUpdateExpiredBatches();

    const now = new Date();

    const batches = await MedicineBatch.find({
      expiryDate: { $lt: now },
    })
      .sort({ expiryDate: -1 })
      .populate('medicine', 'name genericName brandName category sku dosageForm strength unit');

    return batches;
  }

  /**
   * Stock movement history transactions
   */
  async getTransactions(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.medicine && mongoose.Types.ObjectId.isValid(query.medicine)) {
      filter.medicine = new mongoose.Types.ObjectId(query.medicine);
    }

    if (query.batch && mongoose.Types.ObjectId.isValid(query.batch)) {
      filter.batch = new mongoose.Types.ObjectId(query.batch);
    }

    if (query.transactionType && query.transactionType !== 'all') {
      filter.transactionType = query.transactionType;
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

    // Search by reference, reason, batch number, or medicine
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      const [matchingMeds, matchingBatches] = await Promise.all([
        Medicine.find({ $or: [{ name: searchRegex }, { sku: searchRegex }] }).select('_id').lean(),
        MedicineBatch.find({ batchNumber: searchRegex }).select('_id').lean(),
      ]);
      const medIds = matchingMeds.map((m) => m._id);
      const batchIds = matchingBatches.map((b) => b._id);

      filter.$or = [
        { reference: searchRegex },
        { reason: searchRegex },
        { medicine: { $in: medIds } },
        { batch: { $in: batchIds } },
      ];
    }

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('medicine', 'name genericName sku category dosageForm unit')
        .populate('batch', 'batchNumber expiryDate sellingPrice')
        .populate('performedBy', 'name email role'),
      InventoryTransaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      transactions,
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
   * First Expiry, First Out (FEFO) Allocation Helper
   * Selects earliest-expiring eligible batches to fulfill requested quantity
   */
  async allocateFEFO(medicineId, requestedQuantity) {
    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      const error = new Error('Invalid medicine ID format.');
      error.statusCode = 400;
      throw error;
    }

    const reqQty = parseFloat(requestedQuantity);
    if (isNaN(reqQty) || reqQty <= 0) {
      const error = new Error('Requested allocation quantity must be greater than zero.');
      error.statusCode = 400;
      throw error;
    }

    await this.autoUpdateExpiredBatches();

    const now = new Date();

    // Find eligible batches: active, non-expired, non-quarantined, availableQuantity > 0
    const eligibleBatches = await MedicineBatch.find({
      medicine: medicineId,
      status: 'active',
      expiryDate: { $gte: now },
      availableQuantity: { $gt: 0 },
    }).sort({ expiryDate: 1 }); // Earliest expiry first

    const totalAvailable = eligibleBatches.reduce((acc, b) => acc + b.availableQuantity, 0);

    if (totalAvailable < reqQty) {
      return {
        isAllocatable: false,
        totalAvailable,
        requestedQuantity: reqQty,
        deficit: reqQty - totalAvailable,
        message: `Insufficient sellable stock. Available: ${totalAvailable}, Requested: ${reqQty}`,
        allocations: [],
      };
    }

    let remainingToAllocate = reqQty;
    const allocations = [];

    for (const batch of eligibleBatches) {
      if (remainingToAllocate <= 0) break;

      const allocateFromBatch = Math.min(batch.availableQuantity, remainingToAllocate);
      remainingToAllocate -= allocateFromBatch;

      allocations.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        sellingPrice: batch.sellingPrice,
        allocatedQuantity: allocateFromBatch,
        currentAvailable: batch.availableQuantity,
        remainingAfterAllocation: batch.availableQuantity - allocateFromBatch,
      });
    }

    return {
      isAllocatable: true,
      requestedQuantity: reqQty,
      totalAvailable,
      allocations,
    };
  }
}

module.exports = new InventoryService();

