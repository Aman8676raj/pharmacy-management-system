const mongoose = require('mongoose');

const batchAllocationSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineBatch',
      required: [true, 'Batch reference is required.'],
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required.'],
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Batch expiry date is required.'],
    },
    quantity: {
      type: Number,
      required: [true, 'Allocated quantity is required.'],
      min: [1, 'Allocated quantity must be at least 1.'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Batch unit selling price is required.'],
      min: [0, 'Unit price cannot be negative.'],
    },
    unitCost: {
      type: Number,
      default: 0,
      min: [0, 'Unit cost cannot be negative.'],
    },
  },
  { _id: true }
);

const saleItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required.'],
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name snapshot is required.'],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    unit: {
      type: String,
      trim: true,
      default: 'Strip',
    },
    dosageForm: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required.'],
      min: [1, 'Item quantity must be at least 1.'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required.'],
      min: [0, 'Unit price cannot be negative.'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative.'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative.'],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative.'],
    },
    lineTotal: {
      type: Number,
      required: [true, 'Line total is required.'],
      min: [0, 'Line total cannot be negative.'],
    },
    batchAllocations: {
      type: [batchAllocationSchema],
      default: [],
    },
  },
  { _id: true }
);

const customerSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Walk-in Customer',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    prescriptionRef: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customerSnapshot: {
      type: customerSnapshotSchema,
      default: () => ({ name: 'Walk-in Customer' }),
    },
    items: {
      type: [saleItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'A sale must contain at least one item.',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rounding: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['paid', 'partially_paid', 'unpaid'],
        message: 'Invalid payment status.',
      },
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
        message: 'Invalid payment method.',
      },
      default: 'cash',
    },
    saleStatus: {
      type: String,
      enum: {
        values: ['completed', 'cancelled'],
        message: 'Invalid sale status.',
      },
      default: 'completed',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters.'],
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff reference (soldBy) is required.'],
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelReason: {
      type: String,
      trim: true,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
saleSchema.index({ soldBy: 1 });
saleSchema.index({ saleStatus: 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ createdAt: -1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
