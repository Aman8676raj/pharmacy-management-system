const mongoose = require('mongoose');
const fs = require('fs');
const Prescription = require('../models/Prescription');
const Customer = require('../models/Customer');
const Medicine = require('../models/Medicine');

class PrescriptionService {
  /**
   * Generate sequential, unique prescription number: RX-YYYYMMDD-XXXX
   */
  async generatePrescriptionNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `RX-${year}${month}${day}`;

    const latest = await Prescription.findOne({
      prescriptionNumber: new RegExp(`^${prefix}`),
    })
      .sort({ prescriptionNumber: -1 })
      .select('prescriptionNumber')
      .lean();

    let sequence = 1;
    if (latest && latest.prescriptionNumber) {
      const parts = latest.prescriptionNumber.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          sequence = lastSeq + 1;
        }
      }
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Create prescription (starts as pending)
   */
  async createPrescription(data, userId) {
    if (!data.customer || !mongoose.Types.ObjectId.isValid(data.customer)) {
      const error = new Error('Valid customer ID is required.');
      error.statusCode = 400;
      throw error;
    }

    const customer = await Customer.findById(data.customer);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!data.doctorName || !data.doctorName.trim()) {
      const error = new Error('Doctor name is required.');
      error.statusCode = 400;
      throw error;
    }

    const prescriptionNumber = await this.generatePrescriptionNumber();

    // Process items snapshot
    const processedItems = [];
    if (data.prescriptionItems && Array.isArray(data.prescriptionItems)) {
      for (const item of data.prescriptionItems) {
        if (!item.medicine || !mongoose.Types.ObjectId.isValid(item.medicine)) {
          continue;
        }
        const med = await Medicine.findById(item.medicine);
        if (!med) continue;

        processedItems.push({
          medicine: med._id,
          medicineNameSnapshot: med.name,
          prescribedQuantity: Math.max(1, parseInt(item.prescribedQuantity, 10) || 1),
          dosageInstructions: item.dosageInstructions?.trim() || '',
          duration: item.duration?.trim() || '',
          notes: item.notes?.trim() || '',
        });
      }
    }

    const prescription = await Prescription.create({
      prescriptionNumber,
      customer: customer._id,
      doctorName: data.doctorName.trim(),
      doctorRegistrationNumber: data.doctorRegistrationNumber?.trim() || '',
      doctorContact: data.doctorContact?.trim() || '',
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      prescriptionItems: processedItems,
      status: 'pending', // Never automatically mark as verified!
      createdBy: userId,
    });

    await prescription.populate('customer', 'name phone customerCode');
    await prescription.populate('createdBy', 'name email role');

    return prescription;
  }

  /**
   * Paginated list of prescriptions with filters
   */
  async getPrescriptions(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.customer && mongoose.Types.ObjectId.isValid(query.customer)) {
      filter.customer = new mongoose.Types.ObjectId(query.customer);
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.doctor && query.doctor.trim()) {
      filter.doctorName = new RegExp(query.doctor.trim(), 'i');
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { prescriptionNumber: searchRegex },
        { doctorName: searchRegex },
        { doctorRegistrationNumber: searchRegex },
      ];
    }

    // Date range filter on issueDate
    if (query.startDate || query.endDate) {
      filter.issueDate = {};
      if (query.startDate) filter.issueDate.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.issueDate.$lte = end;
      }
    }

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name phone customerCode')
        .populate('verifiedBy', 'name email role')
        .populate('createdBy', 'name email role'),
      Prescription.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
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

  /**
   * Single prescription details by ID
   */
  async getPrescriptionById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid prescription ID format.');
      error.statusCode = 400;
      throw error;
    }

    const prescription = await Prescription.findById(id)
      .populate('customer', 'name phone email customerCode address')
      .populate('prescriptionItems.medicine', 'name genericName sku dosageForm strength category requiresPrescription')
      .populate('verifiedBy', 'name email role')
      .populate('createdBy', 'name email role');

    if (!prescription) {
      const error = new Error('Prescription not found.');
      error.statusCode = 404;
      throw error;
    }

    return prescription;
  }

  /**
   * Update pending prescription details
   */
  async updatePrescription(id, data, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid prescription ID format.');
      error.statusCode = 400;
      throw error;
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      const error = new Error('Prescription not found.');
      error.statusCode = 404;
      throw error;
    }

    if (prescription.status !== 'pending') {
      const error = new Error(`Cannot edit a prescription with status: ${prescription.status}. Only pending prescriptions can be modified.`);
      error.statusCode = 400;
      throw error;
    }

    if (data.doctorName) prescription.doctorName = data.doctorName.trim();
    if (data.doctorRegistrationNumber !== undefined) prescription.doctorRegistrationNumber = data.doctorRegistrationNumber.trim();
    if (data.doctorContact !== undefined) prescription.doctorContact = data.doctorContact.trim();
    if (data.issueDate) prescription.issueDate = new Date(data.issueDate);
    if (data.expiryDate !== undefined) prescription.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    if (data.prescriptionItems && Array.isArray(data.prescriptionItems)) {
      const updatedItems = [];
      for (const item of data.prescriptionItems) {
        if (!item.medicine || !mongoose.Types.ObjectId.isValid(item.medicine)) continue;
        const med = await Medicine.findById(item.medicine);
        if (!med) continue;

        updatedItems.push({
          medicine: med._id,
          medicineNameSnapshot: med.name,
          prescribedQuantity: Math.max(1, parseInt(item.prescribedQuantity, 10) || 1),
          dosageInstructions: item.dosageInstructions?.trim() || '',
          duration: item.duration?.trim() || '',
          notes: item.notes?.trim() || '',
        });
      }
      prescription.prescriptionItems = updatedItems;
    }

    await prescription.save();
    return prescription;
  }

  /**
   * Attach uploaded file to prescription
   */
  async uploadPrescriptionFile(id, file, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid prescription ID format.');
      error.statusCode = 400;
      throw error;
    }

    if (!file) {
      const error = new Error('No prescription file uploaded.');
      error.statusCode = 400;
      throw error;
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      const error = new Error('Prescription not found.');
      error.statusCode = 404;
      throw error;
    }

    prescription.prescriptionImage = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
    };

    await prescription.save();
    return prescription;
  }

  /**
   * Verify prescription (Pharmacist / Admin)
   */
  async verifyPrescription(id, { verificationNotes }, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid prescription ID format.');
      error.statusCode = 400;
      throw error;
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      const error = new Error('Prescription not found.');
      error.statusCode = 404;
      throw error;
    }

    if (prescription.status === 'verified') {
      const error = new Error('This prescription is already verified.');
      error.statusCode = 400;
      throw error;
    }

    prescription.status = 'verified';
    prescription.verificationNotes = verificationNotes?.trim() || 'Verified by pharmacist';
    prescription.verifiedBy = userId;
    prescription.verifiedAt = new Date();

    await prescription.save();
    await prescription.populate('verifiedBy', 'name email role');
    return prescription;
  }

  /**
   * Reject prescription (Pharmacist / Admin)
   */
  async rejectPrescription(id, { rejectionReason }, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid prescription ID format.');
      error.statusCode = 400;
      throw error;
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      const error = new Error('A rejection reason is required.');
      error.statusCode = 400;
      throw error;
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      const error = new Error('Prescription not found.');
      error.statusCode = 404;
      throw error;
    }

    prescription.status = 'rejected';
    prescription.verificationNotes = rejectionReason.trim();
    prescription.verifiedBy = userId;
    prescription.verifiedAt = new Date();

    await prescription.save();
    await prescription.populate('verifiedBy', 'name email role');
    return prescription;
  }

  /**
   * Secure prescription file retrieval
   */
  async getPrescriptionFile(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid prescription ID format.');
      error.statusCode = 400;
      throw error;
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      const error = new Error('Prescription not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!prescription.prescriptionImage || !prescription.prescriptionImage.path) {
      const error = new Error('No document file attached to this prescription.');
      error.statusCode = 404;
      throw error;
    }

    if (!fs.existsSync(prescription.prescriptionImage.path)) {
      const error = new Error('Prescription document file not found on server storage.');
      error.statusCode = 404;
      throw error;
    }

    return {
      filePath: prescription.prescriptionImage.path,
      mimeType: prescription.prescriptionImage.mimeType || 'application/octet-stream',
      originalName: prescription.prescriptionImage.originalName || 'prescription-document',
    };
  }
}

module.exports = new PrescriptionService();
