const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const User = require('../models/User');

const router = express.Router();

/**
 * Middleware to restrict registration to either:
 * 1) Initial admin setup (if 0 users exist in DB)
 * 2) Authenticated user with 'admin' role
 */
const checkRegisterAccess = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // Allow initial setup
      return next();
    }
    // System already has users: must be authenticated admin
    return protect(req, res, (err) => {
      if (err) return next(err);
      return authorize('admin')(req, res, next);
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'pharmacist', 'cashier', 'inventory_manager'])
    .withMessage('Invalid role specified'),
  validate,
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/register', checkRegisterAccess, registerValidation, authController.register);
router.get('/me', protect, authController.getMe);
router.post('/logout', authController.logout);
router.get('/setup-status', authController.getSetupStatus);

module.exports = router;

