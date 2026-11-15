const mongoose = require('mongoose');

const salePaymentSchema = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Sale reference is required.'],
    },
    paymentReference: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required.'],
      min: [0.01, 'Payment amount must be greater than zero.'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
        message: 'Invalid payment method.',
      },
      required: [true, 'Payment method is required.'],
      default: 'cash',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters.'],
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff reference (receivedBy) is required.'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
salePaymentSchema.index({ sale: 1 });
salePaymentSchema.index({ paymentDate: -1 });
salePaymentSchema.index({ receivedBy: 1 });

const SalePayment = mongoose.model('SalePayment', salePaymentSchema);

module.exports = SalePayment;
