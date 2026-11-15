const express = require('express');
const authRoutes = require('./authRoutes');
const medicineRoutes = require('./medicineRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const supplierRoutes = require('./supplierRoutes');
const purchaseRoutes = require('./purchaseRoutes');
const salesRoutes = require('./salesRoutes');
const customerRoutes = require('./customerRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pharmacy Management API is operational',
    timestamp: new Date().toISOString(),
    version: '8.0.0',
    phase: 'Phase 8 - Production Ready System',
  });
});

// Mount sub-routes
router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/sales', salesRoutes);
router.use('/customers', customerRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
