const prescriptionService = require('../services/prescriptionService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class PrescriptionController {
  async createPrescription(req, res, next) {
    try {
      const prescription = await prescriptionService.createPrescription(req.body, req.user._id);
      return successResponse(res, 201, 'Prescription created successfully.', { prescription });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getPrescriptions(req, res, next) {
    try {
      const result = await prescriptionService.getPrescriptions(req.query, req.user);
      return successResponse(res, 200, 'Prescriptions fetched successfully.', result);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getPrescriptionById(req, res, next) {
    try {
      const prescription = await prescriptionService.getPrescriptionById(req.params.id);
      return successResponse(res, 200, 'Prescription details fetched successfully.', { prescription });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async updatePrescription(req, res, next) {
    try {
      const prescription = await prescriptionService.updatePrescription(req.params.id, req.body, req.user._id);
      return successResponse(res, 200, 'Prescription updated successfully.', { prescription });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async uploadPrescriptionFile(req, res, next) {
    try {
      const prescription = await prescriptionService.uploadPrescriptionFile(req.params.id, req.file, req.user._id);
      return successResponse(res, 200, 'Prescription file uploaded successfully.', { prescription });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async verifyPrescription(req, res, next) {
    try {
      const prescription = await prescriptionService.verifyPrescription(req.params.id, req.body, req.user._id);
      return successResponse(res, 200, 'Prescription verified successfully.', { prescription });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async rejectPrescription(req, res, next) {
    try {
      const prescription = await prescriptionService.rejectPrescription(req.params.id, req.body, req.user._id);
      return successResponse(res, 200, 'Prescription rejected.', { prescription });
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }

  async getPrescriptionFile(req, res, next) {
    try {
      const fileData = await prescriptionService.getPrescriptionFile(req.params.id);
      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileData.originalName}"`);
      return res.sendFile(fileData.filePath);
    } catch (err) {
      if (err.statusCode) {
        return errorResponse(res, err.statusCode, err.message);
      }
      next(err);
    }
  }
}

module.exports = new PrescriptionController();

