const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

class MedicineService {
  /**
   * Add a new medicine
   */
  async createMedicine(data, userId) {
    const sku = data.sku ? data.sku.trim().toUpperCase() : '';

    // Check duplicate SKU
    const existingSku = await Medicine.findOne({ sku });
    if (existingSku) {
      const error = new Error(`A medicine with SKU '${sku}' already exists.`);
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate Barcode if provided
    if (data.barcode && data.barcode.trim()) {
      const barcode = data.barcode.trim();
      const existingBarcode = await Medicine.findOne({ barcode });
      if (existingBarcode) {
        const error = new Error(`A medicine with barcode '${barcode}' already exists.`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Prepare medicine data
    const medicinePayload = {
      ...data,
      sku,
      barcode: data.barcode && data.barcode.trim() ? data.barcode.trim() : null,
      createdBy: userId,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    };

    const medicine = await Medicine.create(medicinePayload);
    await medicine.populate('createdBy', 'name email role');

    return medicine;
  }

  /**
   * Get all medicines with pagination, filters, and sorting
   */
  async getMedicines(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by active status
    // Default: normal listings exclude inactive medicines (isActive: true)
    if (query.status === 'inactive' || query.isActive === 'false') {
      filter.isActive = false;
    } else if (query.status === 'all' || query.isActive === 'all') {
      // Return both active and inactive
    } else {
      filter.isActive = true; // default
    }

    // Filter by category
    if (query.category && query.category.trim() && query.category !== 'all') {
      filter.category = new RegExp(`^${query.category.trim()}$`, 'i');
    }

    // Filter by manufacturer
    if (query.manufacturer && query.manufacturer.trim() && query.manufacturer !== 'all') {
      filter.manufacturer = new RegExp(query.manufacturer.trim(), 'i');
    }

    // Filter by dosageForm
    if (query.dosageForm && query.dosageForm.trim() && query.dosageForm !== 'all') {
      filter.dosageForm = new RegExp(`^${query.dosageForm.trim()}$`, 'i');
    }

    // Filter by requiresPrescription
    if (query.requiresPrescription !== undefined && query.requiresPrescription !== '') {
      filter.requiresPrescription = query.requiresPrescription === 'true';
    }

    // Search query across name, genericName, brandName, and SKU
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { genericName: searchRegex },
        { brandName: searchRegex },
        { sku: searchRegex },
        { barcode: searchRegex },
      ];
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role'),
      Medicine.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      medicines,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Fast search medicines (autocomplete / search bar)
   */
  async searchMedicines(term) {
    if (!term || !term.trim()) {
      return [];
    }

    const regex = new RegExp(term.trim(), 'i');
    const medicines = await Medicine.find({
      isActive: true,
      $or: [
        { name: regex },
        { genericName: regex },
        { brandName: regex },
        { sku: regex },
        { barcode: regex },
      ],
    })
      .limit(10)
      .select('name genericName brandName category strength dosageForm unit sku requiresPrescription isActive');

    return medicines;
  }

  /**
   * Get single medicine details by ID
   */
  async getMedicineById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid medicine ID format.');
      error.statusCode = 400;
      throw error;
    }

    const medicine = await Medicine.findById(id).populate('createdBy', 'name email role');
    if (!medicine) {
      const error = new Error('Medicine not found.');
      error.statusCode = 404;
      throw error;
    }

    return medicine;
  }

  /**
   * Update an existing medicine
   */
  async updateMedicine(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid medicine ID format.');
      error.statusCode = 400;
      throw error;
    }

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      const error = new Error('Medicine not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check SKU conflicts if updated
    if (updateData.sku && updateData.sku.trim().toUpperCase() !== medicine.sku) {
      const newSku = updateData.sku.trim().toUpperCase();
      const existingSku = await Medicine.findOne({
        sku: newSku,
        _id: { $ne: id },
      });
      if (existingSku) {
        const error = new Error(`A medicine with SKU '${newSku}' already exists.`);
        error.statusCode = 400;
        throw error;
      }
      updateData.sku = newSku;
    }

    // Check Barcode conflicts if updated
    if (updateData.barcode !== undefined) {
      const newBarcode = updateData.barcode && updateData.barcode.trim() ? updateData.barcode.trim() : null;
      if (newBarcode && newBarcode !== medicine.barcode) {
        const existingBarcode = await Medicine.findOne({
          barcode: newBarcode,
          _id: { $ne: id },
        });
        if (existingBarcode) {
          const error = new Error(`A medicine with barcode '${newBarcode}' already exists.`);
          error.statusCode = 400;
          throw error;
        }
      }
      updateData.barcode = newBarcode;
    }

    // Apply allowed updates
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id' && key !== 'id' && key !== 'createdAt' && key !== 'createdBy') {
        medicine[key] = updateData[key];
      }
    });

    await medicine.save();
    await medicine.populate('createdBy', 'name email role');

    return medicine;
  }

  /**
   * Deactivate a medicine (Soft Delete)
   */
  async deactivateMedicine(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid medicine ID format.');
      error.statusCode = 400;
      throw error;
    }

    const medicine = await Medicine.findById(id);
    if (!medicine) {
      const error = new Error('Medicine not found.');
      error.statusCode = 404;
      throw error;
    }

    medicine.isActive = false;
    await medicine.save();

    return medicine;
  }

  /**
   * Get distinct categories & manufacturers for dynamic filter lists
   */
  async getFilterOptions() {
    const [categories, manufacturers, dosageForms] = await Promise.all([
      Medicine.distinct('category', { isActive: true }),
      Medicine.distinct('manufacturer', { isActive: true }),
      Medicine.distinct('dosageForm', { isActive: true }),
    ]);

    return {
      categories: categories.filter(Boolean).sort(),
      manufacturers: manufacturers.filter(Boolean).sort(),
      dosageForms: dosageForms.filter(Boolean).sort(),
    };
  }

  /**
   * Aggregate medicine metrics for Dashboard integration
   */
  async getMedicineStats() {
    const [totalActive, totalInactive, categoriesList, recentMedicines] = await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: false }),
      Medicine.distinct('category', { isActive: true }),
      Medicine.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name genericName category dosageForm strength sku createdAt'),
    ]);

    return {
      totalActive,
      totalInactive,
      totalMedicines: totalActive + totalInactive,
      totalCategories: categoriesList.length,
      recentMedicines,
    };
  }
}

module.exports = new MedicineService();
