const express = require('express');
const { body, param, query } = require('express-validator');
const prescriptionController = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { uploadPrescription } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/prescriptions/:id/file (Stream file securely)
router.get(
  '/:id/file',
  authorize('admin', 'pharmacist', 'cashier'),
  [param('id').isMongoId().withMessage('Invalid prescription ID format'), validate],
  (req, res, next) => prescriptionController.getPrescriptionFile(req, res, next)
);

// GET /api/prescriptions/:id
router.get(
  '/:id',
  authorize('admin', 'pharmacist', 'cashier'),
  [param('id').isMongoId().withMessage('Invalid prescription ID format'), validate],
  (req, res, next) => prescriptionController.getPrescriptionById(req, res, next)
);

// GET /api/prescriptions
router.get(
  '/',
  authorize('admin', 'pharmacist', 'cashier'),
  (req, res, next) => prescriptionController.getPrescriptions(req, res, next)
);

// POST /api/prescriptions
router.post(
  '/',
  authorize('admin', 'pharmacist', 'cashier'),
  [
    body('customer').isMongoId().withMessage('Valid customer ID is required'),
    body('doctorName').trim().notEmpty().withMessage('Doctor name is required'),
    validate,
  ],
  (req, res, next) => prescriptionController.createPrescription(req, res, next)
);

// PUT /api/prescriptions/:id
router.put(
  '/:id',
  authorize('admin', 'pharmacist'),
  [
    param('id').isMongoId().withMessage('Invalid prescription ID format'),
    body('doctorName').optional().trim().notEmpty().withMessage('Doctor name cannot be empty'),
    validate,
  ],
  (req, res, next) => prescriptionController.updatePrescription(req, res, next)
);

// POST /api/prescriptions/:id/upload
router.post(
  '/:id/upload',
  authorize('admin', 'pharmacist', 'cashier'),
  [param('id').isMongoId().withMessage('Invalid prescription ID format'), validate],
  uploadPrescription,
  (req, res, next) => prescriptionController.uploadPrescriptionFile(req, res, next)
);

// PATCH /api/prescriptions/:id/verify (Admin, Pharmacist Only)
router.patch(
  '/:id/verify',
  authorize('admin', 'pharmacist'),
  [param('id').isMongoId().withMessage('Invalid prescription ID format'), validate],
  (req, res, next) => prescriptionController.verifyPrescription(req, res, next)
);

// PATCH /api/prescriptions/:id/reject (Admin, Pharmacist Only)
router.patch(
  '/:id/reject',
  authorize('admin', 'pharmacist'),
  [
    param('id').isMongoId().withMessage('Invalid prescription ID format'),
    body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'),
    validate,
  ],
  (req, res, next) => prescriptionController.rejectPrescription(req, res, next)
);

module.exports = router;

