const mongoose = require('mongoose');

const batchStatuses = ['active', 'depleted', 'expired', 'quarantined'];

const medicineBatchSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required'],
      index: true,
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    manufacturingDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    quantityReceived: {
      type: Number,
      required: [true, 'Quantity received is required'],
      min: [0, 'Quantity received cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      index: true,
    },
    receivedDate: {
      type: Date,
      default: Date.now,
    },
    supplierName: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: batchStatuses,
        message: '{VALUE} is not a valid batch status',
      },
      default: 'active',
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

// Compound unique index: A medicine cannot have duplicate batch numbers
medicineBatchSchema.index({ medicine: 1, batchNumber: 1 }, { unique: true });

// Pre-save validation: Expiry date must not be earlier than manufacturing date
medicineBatchSchema.pre('save', function (next) {
  if (this.manufacturingDate && this.expiryDate) {
    if (new Date(this.expiryDate) <= new Date(this.manufacturingDate)) {
      return next(new Error('Expiry date must be later than manufacturing date.'));
    }
  }

  // Automatic status calculation (unless quarantined)
  if (this.status !== 'quarantined') {
    const isExpired = new Date(this.expiryDate) < new Date();
    if (isExpired) {
      this.status = 'expired';
    } else if (this.availableQuantity === 0) {
      this.status = 'depleted';
    } else {
      this.status = 'active';
    }
  }

  next();
});

// JSON transform to ensure clean id mapping
medicineBatchSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const MedicineBatch = mongoose.model('MedicineBatch', medicineBatchSchema);

module.exports = MedicineBatch;
module.exports.batchStatuses = batchStatuses;

