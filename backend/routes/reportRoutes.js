const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All report endpoints require authentication
router.use(protect);

// Dashboard summary stats: admin, pharmacist, inventory_manager, cashier
router.get(
  '/dashboard',
  authorize('admin', 'pharmacist', 'inventory_manager', 'cashier'),
  reportController.getDashboardStats
);

// Sales reports: admin, pharmacist
router.get(
  '/sales',
  authorize('admin', 'pharmacist'),
  reportController.getSalesReport
);

// Inventory reports: admin, pharmacist, inventory_manager
router.get(
  '/inventory',
  authorize('admin', 'pharmacist', 'inventory_manager'),
  reportController.getInventoryReport
);

// Purchase reports: admin, inventory_manager
router.get(
  '/purchases',
  authorize('admin', 'inventory_manager'),
  reportController.getPurchaseReport
);

// Profit & Loss reports: admin, pharmacist
router.get(
  '/profit-loss',
  authorize('admin', 'pharmacist'),
  reportController.getProfitLossReport
);

// Medicine performance reports: admin, pharmacist
router.get(
  '/medicines',
  authorize('admin', 'pharmacist'),
  reportController.getMedicinePerformanceReport
);

// Customer reports: admin, pharmacist
router.get(
  '/customers',
  authorize('admin', 'pharmacist'),
  reportController.getCustomerReport
);

// Export CSV: admin, pharmacist, inventory_manager
router.get(
  '/export/csv',
  authorize('admin', 'pharmacist', 'inventory_manager'),
  reportController.exportCSV
);

// Export PDF: admin, pharmacist, inventory_manager
router.get(
  '/export/pdf',
  authorize('admin', 'pharmacist', 'inventory_manager'),
  reportController.exportPDF
);

module.exports = router;
