const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      required: [true, 'Supplier code is required.'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [30, 'Supplier code cannot exceed 30 characters.'],
    },
    name: {
      type: String,
      required: [true, 'Supplier name is required.'],
      trim: true,
      maxlength: [150, 'Supplier name cannot exceed 150 characters.'],
    },
    contactPerson: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Contact person cannot exceed 100 characters.'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address.',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      maxlength: [25, 'Phone number cannot exceed 25 characters.'],
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [25, 'Alternate phone cannot exceed 25 characters.'],
    },
    address: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Address cannot exceed 300 characters.'],
    },
    city: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'City cannot exceed 80 characters.'],
    },
    state: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'State cannot exceed 80 characters.'],
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Postal code cannot exceed 20 characters.'],
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
      maxlength: [80, 'Country cannot exceed 80 characters.'],
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: undefined,
      maxlength: [25, 'GST number cannot exceed 25 characters.'],
    },
    drugLicenseNumber: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Drug license number cannot exceed 50 characters.'],
    },
    paymentTerms: {
      type: String,
      enum: {
        values: ['immediate', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60'],
        message: 'Invalid payment terms value.',
      },
      default: 'net_30',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters.'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
supplierSchema.index({ name: 1 });
supplierSchema.index({ city: 1 });
supplierSchema.index({ isActive: 1 });
// Sparse unique index for gstNumber (only non-null/non-empty strings indexed uniquely)
supplierSchema.index({ gstNumber: 1 }, { unique: true, sparse: true });

// Pre-save cleanup for optional sparse unique fields like gstNumber
supplierSchema.pre('save', function (next) {
  if (this.gstNumber === '' || this.gstNumber === null) {
    this.gstNumber = undefined;
  }
  if (this.email === '') {
    this.email = undefined;
  }
  next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
