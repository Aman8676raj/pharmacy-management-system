const express = require('express');
const { body, param, query } = require('express-validator');
const medicineController = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { dosageForms, units } = require('../models/Medicine');

const router = express.Router();

// All medicine routes require authentication
router.use(protect);

// Validation rules
const createMedicineValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 120 })
    .withMessage('Name cannot exceed 120 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Medicine category is required'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU identifier is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  body('dosageForm')
    .optional()
    .isIn(dosageForms)
    .withMessage(`Dosage form must be one of: ${dosageForms.join(', ')}`),
  body('unit')
    .optional()
    .isIn(units)
    .withMessage(`Unit must be one of: ${units.join(', ')}`),
  body('minimumStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('requiresPrescription')
    .optional()
    .isBoolean()
    .withMessage('requiresPrescription must be a boolean'),
  validate,
];

const updateMedicineValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid medicine ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medicine name cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Name cannot exceed 120 characters'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medicine category cannot be empty'),
  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SKU cannot be empty'),
  body('dosageForm')
    .optional()
    .isIn(dosageForms)
    .withMessage(`Dosage form must be one of: ${dosageForms.join(', ')}`),
  body('unit')
    .optional()
    .isIn(units)
    .withMessage(`Unit must be one of: ${units.join(', ')}`),
  body('minimumStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('requiresPrescription')
    .optional()
    .isBoolean()
    .withMessage('requiresPrescription must be a boolean'),
  validate,
];

const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid medicine ID format'),
  validate,
];

// Special endpoints (before :id parameter routes)
router.get('/search', medicineController.searchMedicines);
router.get('/filter-options', medicineController.getFilterOptions);
router.get('/stats', medicineController.getMedicineStats);

// Main CRUD endpoints
router
  .route('/')
  .get(medicineController.getMedicines)
  .post(
    authorize('admin', 'pharmacist', 'inventory_manager'),
    createMedicineValidation,
    medicineController.createMedicine
  );

router
  .route('/:id')
  .get(idParamValidation, medicineController.getMedicineById)
  .put(
    authorize('admin', 'pharmacist', 'inventory_manager'),
    updateMedicineValidation,
    medicineController.updateMedicine
  )
  .delete(
    authorize('admin'),
    idParamValidation,
    medicineController.deactivateMedicine
  );

module.exports = router;
