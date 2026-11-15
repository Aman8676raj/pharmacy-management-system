const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

class SupplierService {
  /**
   * Create a new supplier
   */
  async createSupplier(data, userId) {
    let {
      supplierCode,
      name,
      contactPerson,
      email,
      phone,
      alternatePhone,
      address,
      city,
      state,
      postalCode,
      country,
      gstNumber,
      drugLicenseNumber,
      paymentTerms,
      notes,
    } = data;

    if (!name || !name.trim()) {
      const error = new Error('Supplier name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!phone || !phone.trim()) {
      const error = new Error('Phone number is required.');
      error.statusCode = 400;
      throw error;
    }

    // Auto-generate supplier code if not provided
    if (!supplierCode || !supplierCode.trim()) {
      const count = await Supplier.countDocuments();
      supplierCode = `SUP-${String(count + 1).padStart(4, '0')}`;
    } else {
      supplierCode = supplierCode.trim().toUpperCase();
    }

    // Check duplicate supplier code
    const existingCode = await Supplier.findOne({ supplierCode });
    if (existingCode) {
      const error = new Error(`Supplier code "${supplierCode}" is already in use.`);
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate GST number if provided
    if (gstNumber && gstNumber.trim()) {
      gstNumber = gstNumber.trim().toUpperCase();
      const existingGst = await Supplier.findOne({ gstNumber });
      if (existingGst) {
        const error = new Error(`GST number "${gstNumber}" is already registered to ${existingGst.name}.`);
        error.statusCode = 400;
        throw error;
      }
    } else {
      gstNumber = undefined;
    }

    const supplier = await Supplier.create({
      supplierCode,
      name: name.trim(),
      contactPerson: contactPerson ? contactPerson.trim() : '',
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone.trim(),
      alternatePhone: alternatePhone ? alternatePhone.trim() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      state: state ? state.trim() : '',
      postalCode: postalCode ? postalCode.trim() : '',
      country: country ? country.trim() : 'India',
      gstNumber,
      drugLicenseNumber: drugLicenseNumber ? drugLicenseNumber.trim() : '',
      paymentTerms: paymentTerms || 'net_30',
      notes: notes ? notes.trim() : '',
      isActive: true,
      createdBy: userId,
    });

    return supplier;
  }

  /**
   * Get paginated suppliers with search and filters
   */
  async getSuppliers(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Search query across name, code, phone, email
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { name: regex },
        { supplierCode: regex },
        { phone: regex },
        { email: regex },
        { contactPerson: regex },
      ];
    }

    // Status filter
    if (query.status === 'active') {
      filter.isActive = true;
    } else if (query.status === 'inactive') {
      filter.isActive = false;
    }

    // City filter
    if (query.city && query.city !== 'all') {
      filter.city = new RegExp(`^${query.city.trim()}$`, 'i');
    }

    // Sorting
    const sortBy = query.sortBy || 'name';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortOrder };

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter)
        .populate('createdBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats() {
    const [total, active, inactive, distinctCities] = await Promise.all([
      Supplier.countDocuments(),
      Supplier.countDocuments({ isActive: true }),
      Supplier.countDocuments({ isActive: false }),
      Supplier.distinct('city', { city: { $ne: '' } }),
    ]);

    return {
      total,
      active,
      inactive,
      totalCities: distinctCities.length,
      cities: distinctCities.sort(),
    };
  }

  /**
   * Get supplier details by ID with purchase history summary
   */
  async getSupplierById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid supplier ID format.');
      error.statusCode = 400;
      throw error;
    }

    const supplier = await Supplier.findById(id).populate('createdBy', 'name email role');
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }

    // Fetch purchase stats and recent orders
    const [totalOrders, purchaseValueRes, recentPurchases] = await Promise.all([
      PurchaseOrder.countDocuments({ supplier: supplier._id }),
      PurchaseOrder.aggregate([
        { $match: { supplier: supplier._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } },
      ]),
      PurchaseOrder.find({ supplier: supplier._id })
        .sort({ orderDate: -1 })
        .limit(5)
        .populate('createdBy', 'name')
        .lean(),
    ]);

    const totalSpend = purchaseValueRes.length > 0 ? purchaseValueRes[0].totalSpent : 0;

    return {
      supplier,
      stats: {
        totalOrders,
        totalSpend: Math.round(totalSpend * 100) / 100,
      },
      recentPurchases,
    };
  }

  /**
   * Update supplier
   */
  async updateSupplier(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid supplier ID format.');
      error.statusCode = 400;
      throw error;
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }

    // If supplierCode is changing, check uniqueness
    if (data.supplierCode && data.supplierCode.trim().toUpperCase() !== supplier.supplierCode) {
      const newCode = data.supplierCode.trim().toUpperCase();
      const duplicateCode = await Supplier.findOne({ supplierCode: newCode, _id: { $ne: id } });
      if (duplicateCode) {
        const error = new Error(`Supplier code "${newCode}" is already in use.`);
        error.statusCode = 400;
        throw error;
      }
      supplier.supplierCode = newCode;
    }

    // If gstNumber is changing, check uniqueness
    if (data.gstNumber !== undefined) {
      const newGst = data.gstNumber ? data.gstNumber.trim().toUpperCase() : undefined;
      if (newGst && newGst !== supplier.gstNumber) {
        const duplicateGst = await Supplier.findOne({ gstNumber: newGst, _id: { $ne: id } });
        if (duplicateGst) {
          const error = new Error(`GST number "${newGst}" is already registered to another supplier.`);
          error.statusCode = 400;
          throw error;
        }
        supplier.gstNumber = newGst;
      } else if (!newGst) {
        supplier.gstNumber = undefined;
      }
    }

    if (data.name !== undefined) supplier.name = data.name.trim();
    if (data.contactPerson !== undefined) supplier.contactPerson = data.contactPerson.trim();
    if (data.email !== undefined) supplier.email = data.email ? data.email.trim().toLowerCase() : undefined;
    if (data.phone !== undefined) supplier.phone = data.phone.trim();
    if (data.alternatePhone !== undefined) supplier.alternatePhone = data.alternatePhone.trim();
    if (data.address !== undefined) supplier.address = data.address.trim();
    if (data.city !== undefined) supplier.city = data.city.trim();
    if (data.state !== undefined) supplier.state = data.state.trim();
    if (data.postalCode !== undefined) supplier.postalCode = data.postalCode.trim();
    if (data.country !== undefined) supplier.country = data.country.trim();
    if (data.drugLicenseNumber !== undefined) supplier.drugLicenseNumber = data.drugLicenseNumber.trim();
    if (data.paymentTerms !== undefined) supplier.paymentTerms = data.paymentTerms;
    if (data.notes !== undefined) supplier.notes = data.notes.trim();

    await supplier.save();
    return supplier;
  }

  /**
   * Soft deactivation
   */
  async deactivateSupplier(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid supplier ID format.');
      error.statusCode = 400;
      throw error;
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }

    supplier.isActive = false;
    await supplier.save();
    return supplier;
  }

  /**
   * Reactivate supplier
   */
  async activateSupplier(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid supplier ID format.');
      error.statusCode = 400;
      throw error;
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const error = new Error('Supplier not found.');
      error.statusCode = 404;
      throw error;
    }

    supplier.isActive = true;
    await supplier.save();
    return supplier;
  }
}

module.exports = new SupplierService();
