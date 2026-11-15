const medicineService = require('../services/medicineService');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Add a new medicine
 * @route   POST /api/medicines
 * @access  Private (Admin, Pharmacist, Inventory Manager)
 */
const createMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.createMedicine(req.body, req.user._id);
    return successResponse(res, 201, 'Medicine added successfully', { medicine });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all medicines with pagination, filters, and sorting
 * @route   GET /api/medicines
 * @access  Private (All authenticated roles)
 */
const getMedicines = async (req, res, next) => {
  try {
    const result = await medicineService.getMedicines(req.query);
    return successResponse(res, 200, 'Medicines retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search medicines with partial & case-insensitive matching
 * @route   GET /api/medicines/search
 * @access  Private (All authenticated roles)
 */
const searchMedicines = async (req, res, next) => {
  try {
    const term = req.query.q || req.query.query || req.query.search || '';
    const medicines = await medicineService.searchMedicines(term);
    return successResponse(res, 200, 'Search results retrieved successfully', { medicines });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single medicine details by ID
 * @route   GET /api/medicines/:id
 * @access  Private (All authenticated roles)
 */
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    return successResponse(res, 200, 'Medicine details retrieved successfully', { medicine });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing medicine
 * @route   PUT /api/medicines/:id
 * @access  Private (Admin, Pharmacist, Inventory Manager)
 */
const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body);
    return successResponse(res, 200, 'Medicine updated successfully', { medicine });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate medicine (Soft delete)
 * @route   DELETE /api/medicines/:id
 * @access  Private (Admin)
 */
const deactivateMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.deactivateMedicine(req.params.id);
    return successResponse(res, 200, 'Medicine deactivated successfully', { medicine });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get distinct category and manufacturer filter options
 * @route   GET /api/medicines/filter-options
 * @access  Private (All authenticated roles)
 */
const getFilterOptions = async (req, res, next) => {
  try {
    const filterOptions = await medicineService.getFilterOptions();
    return successResponse(res, 200, 'Filter options retrieved successfully', filterOptions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate statistics for Dashboard integration
 * @route   GET /api/medicines/stats
 * @access  Private (All authenticated roles)
 */
const getMedicineStats = async (req, res, next) => {
  try {
    const stats = await medicineService.getMedicineStats();
    return successResponse(res, 200, 'Medicine statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  searchMedicines,
  getMedicineById,
  updateMedicine,
  deactivateMedicine,
  getFilterOptions,
  getMedicineStats,
};

