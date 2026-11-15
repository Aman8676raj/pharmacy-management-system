const mongoose = require('mongoose');

const dosageForms = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Cream',
  'Ointment',
  'Gel',
  'Drops',
  'Inhaler',
  'Powder',
  'Suppository',
  'Lotion',
  'Spray',
  'Patch',
  'Other',
];

const units = [
  'Strip',
  'Bottle',
  'Box',
  'Piece',
  'Tube',
  'Vial',
  'Ampoule',
  'Sachet',
  'Pack',
  'Other',
];

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [120, 'Medicine name cannot exceed 120 characters'],
      index: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Generic name cannot exceed 150 characters'],
      index: true,
    },
    brandName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Brand name cannot exceed 120 characters'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Medicine category is required'],
      trim: true,
      index: true,
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    composition: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Composition cannot exceed 300 characters'],
    },
    dosageForm: {
      type: String,
      trim: true,
      default: 'Tablet',
      enum: {
        values: dosageForms,
        message: '{VALUE} is not a supported dosage form',
      },
    },
    strength: {
      type: String,
      trim: true,
      default: '',
    },
    packSize: {
      type: String,
      trim: true,
      default: '',
    },
    unit: {
      type: String,
      trim: true,
      default: 'Strip',
      enum: {
        values: units,
        message: '{VALUE} is not a supported package unit',
      },
    },
    barcode: {
      type: String,
      trim: true,
      default: null,
      sparse: true, // Allows null / unset values without duplicate key error
    },
    sku: {
      type: String,
      required: [true, 'SKU identifier is required'],
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    minimumStock: {
      type: Number,
      default: 10,
      min: [0, 'Minimum stock threshold cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for powerful fuzzy / full search
medicineSchema.index({
  name: 'text',
  genericName: 'text',
  brandName: 'text',
  sku: 'text',
  category: 'text',
});

// JSON transform to ensure clean id mapping
medicineSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
module.exports.dosageForms = dosageForms;
module.exports.units = units;

