const express = require('express');
const authRoutes = require('./authRoutes');
const medicineRoutes = require('./medicineRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pharmacy Management API is operational',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    phase: 'Phase 2 - Medicine Management',
  });
});

// Mount sub-routes
router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);

module.exports = router;
