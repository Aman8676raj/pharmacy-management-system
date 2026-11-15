const express = require('express');
const { body, param, query } = require('express-validator');
const salesController = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// All sales endpoints require authentication
router.use(protect);

// GET /api/sales/stats (Admin, Pharmacist, Cashier, Inventory Manager)
router.get(
  '/stats',
  authorize('admin', 'pharmacist', 'cashier', 'inventory_manager'),
  (req, res, next) => salesController.getSaleStats(req, res, next)
);

// GET /api/sales/invoice/:invoiceNumber (Admin, Pharmacist, Cashier, Inventory Manager)
router.get(
  '/invoice/:invoiceNumber',
  authorize('admin', 'pharmacist', 'cashier', 'inventory_manager'),
  [param('invoiceNumber').notEmpty().withMessage('Invoice number is required'), validate],
  (req, res, next) => salesController.getSaleByInvoice(req, res, next)
);

// GET /api/sales/:id/invoice (Download/Stream PDF)
router.get(
  '/:id/invoice',
  authorize('admin', 'pharmacist', 'cashier', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid sale ID format'), validate],
  (req, res, next) => salesController.downloadInvoicePDF(req, res, next)
);

// GET /api/sales/:id/profit (Admin, Pharmacist)
router.get(
  '/:id/profit',
  authorize('admin', 'pharmacist'),
  [param('id').isMongoId().withMessage('Invalid sale ID format'), validate],
  (req, res, next) => salesController.getSaleProfit(req, res, next)
);

// GET /api/sales/:id (Admin, Pharmacist, Cashier, Inventory Manager)
router.get(
  '/:id',
  authorize('admin', 'pharmacist', 'cashier', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid sale ID format'), validate],
  (req, res, next) => salesController.getSaleById(req, res, next)
);

// GET /api/sales (Admin, Pharmacist, Cashier, Inventory Manager)
router.get(
  '/',
  authorize('admin', 'pharmacist', 'cashier', 'inventory_manager'),
  (req, res, next) => salesController.getSales(req, res, next)
);

// POST /api/sales (Admin, Pharmacist, Cashier)
router.post(
  '/',
  authorize('admin', 'pharmacist', 'cashier'),
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required in the sale.'),
    body('items.*.medicine')
      .isMongoId()
      .withMessage('Each item must have a valid medicine ID.'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Item quantity must be a positive integer.'),
    body('items.*.unitPrice')
      .isFloat({ min: 0 })
      .withMessage('Item unit price must be a non-negative number.'),
    validate,
  ],
  (req, res, next) => salesController.createSale(req, res, next)
);

// POST /api/sales/:id/payments (Admin, Pharmacist, Cashier)
router.post(
  '/:id/payments',
  authorize('admin', 'pharmacist', 'cashier'),
  [
    param('id').isMongoId().withMessage('Invalid sale ID format'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Payment amount must be greater than zero.'),
    body('paymentMethod')
      .isIn(['cash', 'card', 'upi', 'bank_transfer', 'other'])
      .withMessage('Invalid payment method.'),
    validate,
  ],
  (req, res, next) => salesController.recordPayment(req, res, next)
);

// PATCH /api/sales/:id/cancel (Admin Only)
router.patch(
  '/:id/cancel',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid sale ID format'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Cancellation reason is required.'),
    validate,
  ],
  (req, res, next) => salesController.cancelSale(req, res, next)
);

module.exports = router;

