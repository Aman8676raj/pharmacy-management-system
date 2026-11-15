const supplierService = require('../services/supplierService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class SupplierController {
  /**
   * POST /api/suppliers
   */
  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body, req.user._id);
      return successResponse(res, 201, 'Supplier registered successfully', { supplier });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/suppliers
   */
  async getSuppliers(req, res, next) {
    try {
      const result = await supplierService.getSuppliers(req.query);
      return successResponse(res, 200, 'Suppliers retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/suppliers/stats
   */
  async getSupplierStats(req, res, next) {
    try {
      const stats = await supplierService.getSupplierStats();
      return successResponse(res, 200, 'Supplier statistics retrieved successfully', stats);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/suppliers/:id
   */
  async getSupplierById(req, res, next) {
    try {
      const result = await supplierService.getSupplierById(req.params.id);
      return successResponse(res, 200, 'Supplier details retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/suppliers/:id
   */
  async updateSupplier(req, res, next) {
    try {
      const supplier = await supplierService.updateSupplier(req.params.id, req.body);
      return successResponse(res, 200, 'Supplier updated successfully', { supplier });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/suppliers/:id/deactivate
   */
  async deactivateSupplier(req, res, next) {
    try {
      const supplier = await supplierService.deactivateSupplier(req.params.id);
      return successResponse(res, 200, 'Supplier deactivated successfully', { supplier });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/suppliers/:id/activate
   */
  async activateSupplier(req, res, next) {
    try {
      const supplier = await supplierService.activateSupplier(req.params.id);
      return successResponse(res, 200, 'Supplier activated successfully', { supplier });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SupplierController();
