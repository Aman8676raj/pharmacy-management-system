const express = require('express');
const { body, param, query } = require('express-validator');
const purchaseController = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// All purchase routes require authentication
router.use(protect);

// GET /api/purchases/stats (Admin, Inventory Manager, Pharmacist)
router.get(
  '/stats',
  authorize('admin', 'inventory_manager', 'pharmacist'),
  (req, res, next) => purchaseController.getPurchaseStats(req, res, next)
);

// GET /api/purchases (Admin, Inventory Manager, Pharmacist)
router.get(
  '/',
  authorize('admin', 'inventory_manager', 'pharmacist'),
  (req, res, next) => purchaseController.getPurchases(req, res, next)
);

// GET /api/purchases/:id (Admin, Inventory Manager, Pharmacist)
router.get(
  '/:id',
  authorize('admin', 'inventory_manager', 'pharmacist'),
  [param('id').isMongoId().withMessage('Invalid purchase order ID'), validate],
  (req, res, next) => purchaseController.getPurchaseById(req, res, next)
);

// POST /api/purchases (Admin, Inventory Manager)
router.post(
  '/',
  authorize('admin', 'inventory_manager'),
  [
    body('supplier').isMongoId().withMessage('Valid supplier ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one medicine item is required'),
    validate,
  ],
  (req, res, next) => purchaseController.createPurchaseOrder(req, res, next)
);

// PUT /api/purchases/:id (Admin, Inventory Manager)
router.put(
  '/:id',
  authorize('admin', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid purchase order ID'), validate],
  (req, res, next) => purchaseController.updatePurchaseOrder(req, res, next)
);

// PATCH /api/purchases/:id/order (Admin, Inventory Manager)
router.patch(
  '/:id/order',
  authorize('admin', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid purchase order ID'), validate],
  (req, res, next) => purchaseController.markAsOrdered(req, res, next)
);

// POST /api/purchases/:id/receive (Admin, Inventory Manager)
router.post(
  '/:id/receive',
  authorize('admin', 'inventory_manager'),
  [
    param('id').isMongoId().withMessage('Invalid purchase order ID'),
    body('items').isArray({ min: 1 }).withMessage('At least one received item is required'),
    validate,
  ],
  (req, res, next) => purchaseController.receiveStock(req, res, next)
);

// PATCH /api/purchases/:id/cancel (Admin, Inventory Manager)
router.patch(
  '/:id/cancel',
  authorize('admin', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid purchase order ID'), validate],
  (req, res, next) => purchaseController.cancelPurchaseOrder(req, res, next)
);

module.exports = router;
