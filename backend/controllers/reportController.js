const reportService = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class ReportController {
  /**
   * GET /api/reports/dashboard - High-level executive statistics
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportService.getDashboardStats();
      return successResponse(res, 200, 'Dashboard statistics fetched successfully.', stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/sales - Sales report with trends and payment methods
   */
  async getSalesReport(req, res, next) {
    try {
      const report = await reportService.getSalesReport(req.query);
      return successResponse(res, 200, 'Sales report generated successfully.', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/inventory - Stock valuation, low stock alerts, and expiry analysis
   */
  async getInventoryReport(req, res, next) {
    try {
      const report = await reportService.getInventoryReport();
      return successResponse(res, 200, 'Inventory valuation and stock report generated successfully.', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/purchases - Procurement spending, status counts, and supplier analytics
   */
  async getPurchaseReport(req, res, next) {
    try {
      const report = await reportService.getPurchaseReport(req.query);
      return successResponse(res, 200, 'Purchase procurement report generated successfully.', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/profit-loss - Revenue, COGS, and gross profit margins
   */
  async getProfitLossReport(req, res, next) {
    try {
      const report = await reportService.getProfitLossReport(req.query);
      return successResponse(res, 200, 'Profit and Loss report generated successfully.', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/medicines - Best-selling, slow-moving, and high-margin medicines
   */
  async getMedicinePerformanceReport(req, res, next) {
    try {
      const report = await reportService.getMedicinePerformanceReport(req.query);
      return successResponse(res, 200, 'Medicine performance analytics generated successfully.', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/customers - Customer retention, spenders, and repeat rate
   */
  async getCustomerReport(req, res, next) {
    try {
      const report = await reportService.getCustomerReport(req.query);
      return successResponse(res, 200, 'Customer analytics report generated successfully.', report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/export/csv - Stream formatted CSV report
   */
  async exportCSV(req, res, next) {
    try {
      const { type } = req.query;
      let data = {};

      switch (type) {
        case 'sales':
          data = await reportService.getSalesReport(req.query);
          break;
        case 'inventory':
          data = await reportService.getInventoryReport();
          break;
        case 'purchases':
          data = await reportService.getPurchaseReport(req.query);
          break;
        case 'profit_loss':
          data = await reportService.getProfitLossReport(req.query);
          break;
        case 'medicines':
          data = await reportService.getMedicinePerformanceReport(req.query);
          break;
        case 'customers':
          data = await reportService.getCustomerReport(req.query);
          break;
        default:
          return errorResponse(res, 400, 'Invalid report type for CSV export.');
      }

      const csvContent = reportService.exportReportCSV(type, data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="PharmaCore-${type}-report.csv"`);
      return res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/reports/export/pdf - Stream PDF report via PDFKit
   */
  async exportPDF(req, res, next) {
    try {
      const { type } = req.query;
      let data = {};

      switch (type) {
        case 'sales':
          data = await reportService.getSalesReport(req.query);
          break;
        case 'inventory':
          data = await reportService.getInventoryReport();
          break;
        case 'purchases':
          data = await reportService.getPurchaseReport(req.query);
          break;
        case 'profit_loss':
          data = await reportService.getProfitLossReport(req.query);
          break;
        case 'medicines':
          data = await reportService.getMedicinePerformanceReport(req.query);
          break;
        case 'customers':
          data = await reportService.getCustomerReport(req.query);
          break;
        default:
          return errorResponse(res, 400, 'Invalid report type for PDF export.');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="PharmaCore-${type}-report.pdf"`);
      await reportService.exportReportPDF(type, data, res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();

