const salesService = require('../services/salesService');
const invoiceService = require('../services/invoiceService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class SalesController {
  /**
   * POST /api/sales - Checkout new sale
   */
  async createSale(req, res, next) {
    try {
      const result = await salesService.createSale(req.body, req.user._id);
      return successResponse(res, 201, 'Sale completed successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/sales - Paginated sales history
   */
  async getSales(req, res, next) {
    try {
      const result = await salesService.getSales(req.query, req.user);
      return successResponse(res, 200, 'Sales fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/sales/stats - Aggregated stats for dashboard
   */
  async getSaleStats(req, res, next) {
    try {
      const stats = await salesService.getSaleStats(req.query);
      return successResponse(res, 200, 'Sales statistics fetched successfully.', stats);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/sales/:id - Sale details by ID
   */
  async getSaleById(req, res, next) {
    try {
      const result = await salesService.getSaleById(req.params.id, req.user);
      return successResponse(res, 200, 'Sale details fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/sales/invoice/:invoiceNumber - Sale details by Invoice Number
   */
  async getSaleByInvoice(req, res, next) {
    try {
      const result = await salesService.getSaleByInvoice(req.params.invoiceNumber, req.user);
      return successResponse(res, 200, 'Sale details fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/sales/:id/invoice - Stream PDF invoice download
   */
  async downloadInvoicePDF(req, res, next) {
    try {
      const { sale } = await salesService.getSaleById(req.params.id, req.user);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="Invoice-${sale.invoiceNumber}.pdf"`
      );

      await invoiceService.generateInvoicePDF(sale, res);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * POST /api/sales/:id/payments - Record subsequent balance payment
   */
  async recordPayment(req, res, next) {
    try {
      const result = await salesService.recordPayment(req.params.id, req.body, req.user._id);
      return successResponse(res, 200, 'Payment recorded successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * PATCH /api/sales/:id/cancel - Cancel sale & restore stock (Admin only)
   */
  async cancelSale(req, res, next) {
    try {
      const sale = await salesService.cancelSale(req.params.id, req.body, req.user._id);
      return successResponse(res, 200, 'Sale cancelled and stock restored successfully.', { sale });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  /**
   * GET /api/sales/:id/profit - Profit and margin metrics
   */
  async getSaleProfit(req, res, next) {
    try {
      const profitData = await salesService.getSaleProfit(req.params.id);
      return successResponse(res, 200, 'Sale profit analytics fetched successfully.', profitData);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }
}

module.exports = new SalesController();
