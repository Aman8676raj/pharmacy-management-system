const inventoryService = require('../services/inventoryService');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Add stock (stock-in) to a new or existing batch
 * @route   POST /api/inventory/stock-in
 * @access  Private (Admin, Inventory Manager)
 */
const stockIn = async (req, res, next) => {
  try {
    const result = await inventoryService.stockIn(req.body, req.user._id);
    const message = result.isExistingBatch
      ? `Stock replenished successfully for batch ${result.batch.batchNumber}`
      : `New batch ${result.batch.batchNumber} received and registered successfully`;

    return successResponse(res, 201, message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated inventory batches with filters
 * @route   GET /api/inventory
 * @access  Private (All authenticated roles)
 */
const getInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getInventory(req.query);
    return successResponse(res, 200, 'Inventory records retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overall inventory summary statistics
 * @route   GET /api/inventory/summary
 * @access  Private (All authenticated roles)
 */
const getInventorySummary = async (req, res, next) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    return successResponse(res, 200, 'Inventory summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single batch details by ID
 * @route   GET /api/inventory/batches/:id
 * @access  Private (All authenticated roles)
 */
const getBatchById = async (req, res, next) => {
  try {
    const result = await inventoryService.getBatchById(req.params.id);
    return successResponse(res, 200, 'Batch details retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all batches for a specific medicine
 * @route   GET /api/inventory/medicines/:medicineId/batches
 * @access  Private (All authenticated roles)
 */
const getMedicineBatches = async (req, res, next) => {
  try {
    const batches = await inventoryService.getMedicineBatches(req.params.medicineId);
    return successResponse(res, 200, 'Medicine batches retrieved successfully', { batches });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Adjust batch stock quantity (increase/decrease)
 * @route   PATCH /api/inventory/batches/:id/adjust
 * @access  Private (Admin, Inventory Manager)
 */
const adjustBatch = async (req, res, next) => {
  try {
    const result = await inventoryService.adjustBatch(req.params.id, req.body, req.user._id);
    return successResponse(res, 200, 'Batch stock adjusted successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quarantine a batch
 * @route   PATCH /api/inventory/batches/:id/quarantine
 * @access  Private (Admin, Inventory Manager)
 */
const quarantineBatch = async (req, res, next) => {
  try {
    const result = await inventoryService.quarantineBatch(req.params.id, req.body, req.user._id);
    return successResponse(res, 200, 'Batch quarantined successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Release a batch from quarantine
 * @route   PATCH /api/inventory/batches/:id/release
 * @access  Private (Admin, Inventory Manager)
 */
const releaseBatch = async (req, res, next) => {
  try {
    const result = await inventoryService.releaseBatch(req.params.id, req.body, req.user._id);
    return successResponse(res, 200, 'Batch released from quarantine successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List medicines with low stock (sellable <= minimumStock)
 * @route   GET /api/inventory/low-stock
 * @access  Private (All authenticated roles)
 */
const getLowStockMedicines = async (req, res, next) => {
  try {
    const lowStockMedicines = await inventoryService.getLowStockMedicines();
    return successResponse(res, 200, 'Low-stock medicines retrieved successfully', {
      count: lowStockMedicines.length,
      lowStockMedicines,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List batches expiring within threshold (default 90 days)
 * @route   GET /api/inventory/expiring
 * @access  Private (All authenticated roles)
 */
const getExpiringBatches = async (req, res, next) => {
  try {
    const days = req.query.days || 90;
    const expiringBatches = await inventoryService.getExpiringBatches(days);
    return successResponse(res, 200, 'Expiring batches retrieved successfully', {
      count: expiringBatches.length,
      daysThreshold: parseInt(days, 10),
      batches: expiringBatches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List expired batches
 * @route   GET /api/inventory/expired
 * @access  Private (All authenticated roles)
 */
const getExpiredBatches = async (req, res, next) => {
  try {
    const expiredBatches = await inventoryService.getExpiredBatches();
    return successResponse(res, 200, 'Expired batches retrieved successfully', {
      count: expiredBatches.length,
      batches: expiredBatches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stock movement transaction history
 * @route   GET /api/inventory/transactions
 * @access  Private (All authenticated roles)
 */
const getTransactions = async (req, res, next) => {
  try {
    const result = await inventoryService.getTransactions(req.query);
    return successResponse(res, 200, 'Inventory transactions retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Preview FEFO allocation across batches for a requested quantity
 * @route   POST /api/inventory/fefo-preview
 * @access  Private (All authenticated roles)
 */
const previewFEFOAllocation = async (req, res, next) => {
  try {
    const { medicineId, quantity } = req.body;
    const result = await inventoryService.allocateFEFO(medicineId, quantity);
    return successResponse(res, 200, 'FEFO allocation preview generated successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  stockIn,
  getInventory,
  getInventorySummary,
  getBatchById,
  getMedicineBatches,
  adjustBatch,
  quarantineBatch,
  releaseBatch,
  getLowStockMedicines,
  getExpiringBatches,
  getExpiredBatches,
  getTransactions,
  previewFEFOAllocation,
};

