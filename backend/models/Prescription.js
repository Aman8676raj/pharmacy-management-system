const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required.'],
    },
    medicineNameSnapshot: {
      type: String,
      required: [true, 'Medicine name snapshot is required.'],
      trim: true,
    },
    prescribedQuantity: {
      type: Number,
      required: [true, 'Prescribed quantity is required.'],
      min: [1, 'Prescribed quantity must be at least 1.'],
    },
    dosageInstructions: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Dosage instructions cannot exceed 200 characters.'],
    },
    duration: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Duration cannot exceed 100 characters.'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Item notes cannot exceed 500 characters.'],
    },
  },
  { _id: true }
);

const prescriptionFileSchema = new mongoose.Schema(
  {
    filename: { type: String, trim: true },
    originalName: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number },
    path: { type: String, trim: true },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      required: [true, 'Prescription number is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required.'],
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required.'],
      trim: true,
      maxlength: [100, 'Doctor name cannot exceed 100 characters.'],
    },
    doctorRegistrationNumber: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Doctor registration number cannot exceed 100 characters.'],
    },
    doctorContact: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Doctor contact cannot exceed 50 characters.'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required.'],
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    prescriptionImage: {
      type: prescriptionFileSchema,
      default: null,
    },
    prescriptionItems: {
      type: [prescriptionItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected', 'expired'],
        message: 'Invalid prescription status.',
      },
      default: 'pending',
    },
    verificationNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Verification notes cannot exceed 1000 characters.'],
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff reference (createdBy) is required.'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
prescriptionSchema.index({ customer: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ issueDate: -1 });
prescriptionSchema.index({ createdAt: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;

