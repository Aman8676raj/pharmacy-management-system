const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: [true, 'Customer code is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required.'],
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters.'],
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required.'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters.'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters.'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', 'prefer_not_to_say'],
        message: 'Invalid gender option.',
      },
      default: 'prefer_not_to_say',
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
      maxlength: [100, 'City cannot exceed 100 characters.'],
    },
    state: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'State cannot exceed 100 characters.'],
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Postal code cannot exceed 20 characters.'],
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
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text', phone: 'text', email: 'text', customerCode: 'text' });
customerSchema.index({ isActive: 1 });
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

