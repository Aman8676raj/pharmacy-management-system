const express = require('express');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pharmacy Management API is operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    phase: 'Phase 1 - Project Foundation',
  });
});

// Mount sub-routes
router.use('/auth', authRoutes);

module.exports = router;
