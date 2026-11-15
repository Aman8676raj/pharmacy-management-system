const express = require('express');
const { body, param, query } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// All inventory endpoints require authentication
router.use(protect);

// Validation rules
const stockInValidation = [
  body('medicine')
    .isMongoId()
    .withMessage('Valid medicine ID reference is required'),
  body('batchNumber')
    .trim()
    .notEmpty()
    .withMessage('Batch number is required')
    .isLength({ min: 2, max: 40 })
    .withMessage('Batch number must be between 2 and 40 characters'),
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Expiry date must be a valid date (YYYY-MM-DD)'),
  body('purchasePrice')
    .notEmpty()
    .withMessage('Purchase price is required')
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  body('sellingPrice')
    .notEmpty()
    .withMessage('Selling price is required')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number'),
  body('quantityReceived')
    .notEmpty()
    .withMessage('Quantity received is required')
    .isFloat({ min: 0.001 })
    .withMessage('Quantity received must be a positive number greater than zero'),
  body('manufacturingDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Manufacturing date must be a valid date'),
  validate,
];

const adjustBatchValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid batch ID format'),
  body('adjustmentType')
    .notEmpty()
    .withMessage('Adjustment type is required')
    .isIn(['adjustment_in', 'adjustment_out'])
    .withMessage("Adjustment type must be either 'adjustment_in' or 'adjustment_out'"),
  body('quantity')
    .notEmpty()
    .withMessage('Adjustment quantity is required')
    .isFloat({ min: 0.001 })
    .withMessage('Adjustment quantity must be greater than zero'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('A descriptive reason is required for stock adjustments'),
  validate,
];

const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate,
];

const medicineIdParamValidation = [
  param('medicineId')
    .isMongoId()
    .withMessage('Invalid medicine ID format'),
  validate,
];

// Read queries (all authenticated staff: Admin, Inventory Manager, Pharmacist, Cashier)
router.get('/summary', inventoryController.getInventorySummary);
router.get('/low-stock', inventoryController.getLowStockMedicines);
router.get('/expiring', inventoryController.getExpiringBatches);
router.get('/expired', inventoryController.getExpiredBatches);
router.get('/transactions', inventoryController.getTransactions);
router.post('/fefo-preview', inventoryController.previewFEFOAllocation);
router.get('/medicines/:medicineId/batches', medicineIdParamValidation, inventoryController.getMedicineBatches);
router.get('/batches/:id', idParamValidation, inventoryController.getBatchById);
router.get('/', inventoryController.getInventory);

// Modifying operations (Admin and Inventory Manager only)
router.post(
  '/stock-in',
  authorize('admin', 'inventory_manager'),
  stockInValidation,
  inventoryController.stockIn
);

router.patch(
  '/batches/:id/adjust',
  authorize('admin', 'inventory_manager'),
  adjustBatchValidation,
  inventoryController.adjustBatch
);

router.patch(
  '/batches/:id/quarantine',
  authorize('admin', 'inventory_manager'),
  idParamValidation,
  inventoryController.quarantineBatch
);

router.patch(
  '/batches/:id/release',
  authorize('admin', 'inventory_manager'),
  idParamValidation,
  inventoryController.releaseBatch
);

module.exports = router;

