const express = require('express');
const authRoutes = require('./authRoutes');
const medicineRoutes = require('./medicineRoutes');
const inventoryRoutes = require('./inventoryRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pharmacy Management API is operational',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    phase: 'Phase 3 - Inventory Management',
  });
});

// Mount sub-routes
router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;
