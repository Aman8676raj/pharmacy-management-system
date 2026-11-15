const customerService = require('../services/customerService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class CustomerController {
  async createCustomer(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body, req.user._id);
      return successResponse(res, 201, 'Customer created successfully.', { customer });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const result = await customerService.getCustomers(req.query);
      return successResponse(res, 200, 'Customers fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getCustomerStats(req, res, next) {
    try {
      const stats = await customerService.getCustomerStats();
      return successResponse(res, 200, 'Customer statistics fetched successfully.', stats);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async searchCustomers(req, res, next) {
    try {
      const customers = await customerService.searchCustomers(req.query.q);
      return successResponse(res, 200, 'Customers search results fetched.', { customers });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const result = await customerService.getCustomerById(req.params.id);
      return successResponse(res, 200, 'Customer details fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body, req.user._id);
      return successResponse(res, 200, 'Customer updated successfully.', { customer });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async activateCustomer(req, res, next) {
    try {
      const customer = await customerService.activateCustomer(req.params.id);
      return successResponse(res, 200, 'Customer activated successfully.', { customer });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async deactivateCustomer(req, res, next) {
    try {
      const customer = await customerService.deactivateCustomer(req.params.id);
      return successResponse(res, 200, 'Customer deactivated successfully.', { customer });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getCustomerSales(req, res, next) {
    try {
      const result = await customerService.getCustomerSales(req.params.id, req.query);
      return successResponse(res, 200, 'Customer sales fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getCustomerPrescriptions(req, res, next) {
    try {
      const result = await customerService.getCustomerPrescriptions(req.params.id, req.query);
      return successResponse(res, 200, 'Customer prescriptions fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }
}

module.exports = new CustomerController();
