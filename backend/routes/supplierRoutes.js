const express = require('express');
const { body, param, query } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// All supplier routes require authentication
router.use(protect);

// Validations
const supplierValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ max: 150 })
    .withMessage('Name cannot exceed 150 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ max: 25 })
    .withMessage('Phone number cannot exceed 25 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('paymentTerms')
    .optional()
    .isIn(['immediate', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60'])
    .withMessage('Invalid payment terms value'),
  validate,
];

// GET /api/suppliers/stats
router.get('/stats', (req, res, next) => supplierController.getSupplierStats(req, res, next));

// GET /api/suppliers
router.get('/', (req, res, next) => supplierController.getSuppliers(req, res, next));

// GET /api/suppliers/:id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid supplier ID'), validate],
  (req, res, next) => supplierController.getSupplierById(req, res, next)
);

// POST /api/suppliers (Admin, Inventory Manager)
router.post(
  '/',
  authorize('admin', 'inventory_manager'),
  supplierValidation,
  (req, res, next) => supplierController.createSupplier(req, res, next)
);

// PUT /api/suppliers/:id (Admin, Inventory Manager)
router.put(
  '/:id',
  authorize('admin', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid supplier ID'), ...supplierValidation],
  (req, res, next) => supplierController.updateSupplier(req, res, next)
);

// PATCH /api/suppliers/:id/deactivate (Admin, Inventory Manager)
router.patch(
  '/:id/deactivate',
  authorize('admin', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid supplier ID'), validate],
  (req, res, next) => supplierController.deactivateSupplier(req, res, next)
);

// PATCH /api/suppliers/:id/activate (Admin, Inventory Manager)
router.patch(
  '/:id/activate',
  authorize('admin', 'inventory_manager'),
  [param('id').isMongoId().withMessage('Invalid supplier ID'), validate],
  (req, res, next) => supplierController.activateSupplier(req, res, next)
);

module.exports = router;
