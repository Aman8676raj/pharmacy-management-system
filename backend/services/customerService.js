const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Prescription = require('../models/Prescription');

class CustomerService {
  /**
   * Generate sequential, unique customer code: CUST-YYYY-XXXXXX
   */
  async generateCustomerCode() {
    const year = new Date().getFullYear();
    const prefix = `CUST-${year}`;

    const latestCustomer = await Customer.findOne({
      customerCode: new RegExp(`^${prefix}`),
    })
      .sort({ customerCode: -1 })
      .select('customerCode')
      .lean();

    let sequence = 1;
    if (latestCustomer && latestCustomer.customerCode) {
      const parts = latestCustomer.customerCode.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          sequence = lastSeq + 1;
        }
      }
    }

    return `${prefix}-${String(sequence).padStart(6, '0')}`;
  }

  /**
   * Create new customer
   */
  async createCustomer(data, userId) {
    const phone = data.phone?.trim();
    if (!phone) {
      const error = new Error('Customer phone number is required.');
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate phone for active customers
    const existing = await Customer.findOne({
      phone,
      isActive: true,
    });

    if (existing) {
      const error = new Error(`An active customer already exists with phone number: ${phone}`);
      error.statusCode = 409;
      throw error;
    }

    const customerCode = data.customerCode?.trim().toUpperCase() || (await this.generateCustomerCode());

    const customer = await Customer.create({
      customerCode,
      name: data.name?.trim(),
      phone,
      email: data.email?.trim().toLowerCase() || '',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender || 'prefer_not_to_say',
      address: data.address?.trim() || '',
      city: data.city?.trim() || '',
      state: data.state?.trim() || '',
      postalCode: data.postalCode?.trim() || '',
      notes: data.notes?.trim() || '',
      isActive: true,
      createdBy: userId,
    });

    return customer;
  }

  /**
   * Paginated list of customers with search and filters
   */
  async getCustomers(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.status === 'active') {
      filter.isActive = true;
    } else if (query.status === 'inactive') {
      filter.isActive = false;
    }

    if (query.city && query.city.trim()) {
      filter.city = new RegExp(`^${query.city.trim()}$`, 'i');
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { customerCode: searchRegex },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role'),
      Customer.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      customers,
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
   * Fast autocomplete customer search for POS
   */
  async searchCustomers(searchTerm) {
    if (!searchTerm || !searchTerm.trim()) {
      return [];
    }

    const searchRegex = new RegExp(searchTerm.trim(), 'i');
    const customers = await Customer.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { phone: searchRegex },
        { customerCode: searchRegex },
        { email: searchRegex },
      ],
    })
      .limit(15)
      .select('customerCode name phone email address city notes')
      .lean();

    return customers;
  }

  /**
   * Aggregated customer statistics
   */
  async getCustomerStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [total, active, newThisMonth] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      newThisMonth,
    };
  }

  /**
   * Single customer details with lifetime metrics
   */
  async getCustomerById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid customer ID format.');
      error.statusCode = 400;
      throw error;
    }

    const customer = await Customer.findById(id).populate('createdBy', 'name email role');
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    // Aggregate lifetime sales spend and prescriptions count
    const [sales, prescriptionsCount] = await Promise.all([
      Sale.find({
        $or: [{ customer: customer._id }, { 'customerSnapshot.phone': customer.phone }],
        saleStatus: 'completed',
      }).select('totalAmount amountPaid balanceAmount invoiceNumber createdAt paymentStatus'),
      Prescription.countDocuments({ customer: customer._id }),
    ]);

    const totalSpend = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalBalance = sales.reduce((acc, s) => acc + s.balanceAmount, 0);

    return {
      customer,
      metrics: {
        totalOrders: sales.length,
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalPrescriptions: prescriptionsCount,
        recentOrders: sales.slice(-5).reverse(),
      },
    };
  }

  /**
   * Update customer profile
   */
  async updateCustomer(id, data, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid customer ID format.');
      error.statusCode = 400;
      throw error;
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    const newPhone = data.phone?.trim();
    if (newPhone && newPhone !== customer.phone) {
      const existing = await Customer.findOne({
        phone: newPhone,
        _id: { $ne: customer._id },
        isActive: true,
      });
      if (existing) {
        const error = new Error(`An active customer already exists with phone number: ${newPhone}`);
        error.statusCode = 409;
        throw error;
      }
      customer.phone = newPhone;
    }

    if (data.name) customer.name = data.name.trim();
    if (data.email !== undefined) customer.email = data.email.trim().toLowerCase();
    if (data.dateOfBirth !== undefined) customer.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    if (data.gender) customer.gender = data.gender;
    if (data.address !== undefined) customer.address = data.address.trim();
    if (data.city !== undefined) customer.city = data.city.trim();
    if (data.state !== undefined) customer.state = data.state.trim();
    if (data.postalCode !== undefined) customer.postalCode = data.postalCode.trim();
    if (data.notes !== undefined) customer.notes = data.notes.trim();

    await customer.save();
    return customer;
  }

  /**
   * Activate customer
   */
  async activateCustomer(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid customer ID format.');
      error.statusCode = 400;
      throw error;
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    customer.isActive = true;
    await customer.save();
    return customer;
  }

  /**
   * Deactivate customer (Soft delete)
   */
  async deactivateCustomer(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid customer ID format.');
      error.statusCode = 400;
      throw error;
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    customer.isActive = false;
    await customer.save();
    return customer;
  }

  /**
   * Get customer's sales history
   */
  async getCustomerSales(id, query = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid customer ID format.');
      error.statusCode = 400;
      throw error;
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ customer: customer._id }, { 'customerSnapshot.phone': customer.phone }],
    };

    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('soldBy', 'name email role'),
      Sale.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      customer,
      sales,
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
   * Get customer's prescriptions history
   */
  async getCustomerPrescriptions(id, query = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid customer ID format.');
      error.statusCode = 400;
      throw error;
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { customer: customer._id };
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('verifiedBy', 'name email role')
        .populate('createdBy', 'name email role'),
      Prescription.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      customer,
      prescriptions,
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
}

module.exports = new CustomerService();
