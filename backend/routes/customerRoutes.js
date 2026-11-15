const express = require('express');
const { body, param, query } = require('express-validator');
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/customers/stats
router.get(
  '/stats',
  authorize('admin', 'pharmacist', 'cashier'),
  (req, res, next) => customerController.getCustomerStats(req, res, next)
);

// GET /api/customers/search
router.get(
  '/search',
  authorize('admin', 'pharmacist', 'cashier'),
  [query('q').trim().notEmpty().withMessage('Search query is required'), validate],
  (req, res, next) => customerController.searchCustomers(req, res, next)
);

// GET /api/customers/:id/sales
router.get(
  '/:id/sales',
  authorize('admin', 'pharmacist', 'cashier'),
  [param('id').isMongoId().withMessage('Invalid customer ID format'), validate],
  (req, res, next) => customerController.getCustomerSales(req, res, next)
);

// GET /api/customers/:id/prescriptions
router.get(
  '/:id/prescriptions',
  authorize('admin', 'pharmacist', 'cashier'),
  [param('id').isMongoId().withMessage('Invalid customer ID format'), validate],
  (req, res, next) => customerController.getCustomerPrescriptions(req, res, next)
);

// GET /api/customers/:id
router.get(
  '/:id',
  authorize('admin', 'pharmacist', 'cashier'),
  [param('id').isMongoId().withMessage('Invalid customer ID format'), validate],
  (req, res, next) => customerController.getCustomerById(req, res, next)
);

// GET /api/customers
router.get(
  '/',
  authorize('admin', 'pharmacist', 'cashier'),
  (req, res, next) => customerController.getCustomers(req, res, next)
);

// POST /api/customers
router.post(
  '/',
  authorize('admin', 'pharmacist', 'cashier'),
  [
    body('name').trim().notEmpty().withMessage('Customer name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    validate,
  ],
  (req, res, next) => customerController.createCustomer(req, res, next)
);

// PUT /api/customers/:id
router.put(
  '/:id',
  authorize('admin', 'pharmacist'),
  [
    param('id').isMongoId().withMessage('Invalid customer ID format'),
    body('name').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
    validate,
  ],
  (req, res, next) => customerController.updateCustomer(req, res, next)
);

// PATCH /api/customers/:id/activate
router.patch(
  '/:id/activate',
  authorize('admin', 'pharmacist'),
  [param('id').isMongoId().withMessage('Invalid customer ID format'), validate],
  (req, res, next) => customerController.activateCustomer(req, res, next)
);

// PATCH /api/customers/:id/deactivate
router.patch(
  '/:id/deactivate',
  authorize('admin', 'pharmacist'),
  [param('id').isMongoId().withMessage('Invalid customer ID format'), validate],
  (req, res, next) => customerController.deactivateCustomer(req, res, next)
);

module.exports = router;
