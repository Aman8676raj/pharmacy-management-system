const purchaseService = require('../services/purchaseService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class PurchaseController {
  /**
   * POST /api/purchases
   */
  async createPurchaseOrder(req, res, next) {
    try {
      const purchaseOrder = await purchaseService.createPurchaseOrder(req.body, req.user._id);
      return successResponse(res, 201, 'Purchase order created successfully', { purchaseOrder });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/purchases
   */
  async getPurchases(req, res, next) {
    try {
      const result = await purchaseService.getPurchases(req.query);
      return successResponse(res, 200, 'Purchase orders retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/purchases/stats
   */
  async getPurchaseStats(req, res, next) {
    try {
      const stats = await purchaseService.getPurchaseStats();
      return successResponse(res, 200, 'Purchase statistics retrieved successfully', stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/purchases/:id
   */
  async getPurchaseById(req, res, next) {
    try {
      const purchaseOrder = await purchaseService.getPurchaseById(req.params.id);
      return successResponse(res, 200, 'Purchase order retrieved successfully', { purchaseOrder });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/purchases/:id
   */
  async updatePurchaseOrder(req, res, next) {
    try {
      const purchaseOrder = await purchaseService.updatePurchaseOrder(
        req.params.id,
        req.body,
        req.user._id
      );
      return successResponse(res, 200, 'Purchase order updated successfully', { purchaseOrder });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/purchases/:id/order
   */
  async markAsOrdered(req, res, next) {
    try {
      const purchaseOrder = await purchaseService.markAsOrdered(req.params.id, req.user._id);
      return successResponse(res, 200, 'Purchase order marked as ordered', { purchaseOrder });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/purchases/:id/receive
   */
  async receiveStock(req, res, next) {
    try {
      const result = await purchaseService.receiveStock(req.params.id, req.body, req.user._id);
      return successResponse(res, 200, 'Stock received and inventory updated successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/purchases/:id/cancel
   */
  async cancelPurchaseOrder(req, res, next) {
    try {
      const purchaseOrder = await purchaseService.cancelPurchaseOrder(
        req.params.id,
        req.user._id,
        req.body.reason
      );
      return successResponse(res, 200, 'Purchase order cancelled successfully', { purchaseOrder });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PurchaseController();

