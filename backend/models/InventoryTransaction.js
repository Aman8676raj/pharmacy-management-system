const mongoose = require('mongoose');

const transactionTypes = [
  'stock_in',
  'stock_out',
  'adjustment_in',
  'adjustment_out',
  'return_in',
  'quarantine',
  'release',
];

const inventoryTransactionSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required'],
      index: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineBatch',
      required: [true, 'Batch reference is required'],
      index: true,
    },
    transactionType: {
      type: String,
      enum: {
        values: transactionTypes,
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'Transaction type is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Transaction quantity is required'],
      min: [0.001, 'Transaction quantity must be greater than zero'],
    },
    previousQuantity: {
      type: Number,
      required: [true, 'Previous quantity is required'],
      min: [0, 'Previous quantity cannot be negative'],
    },
    newQuantity: {
      type: Number,
      required: [true, 'New resulting quantity is required'],
      min: [0, 'New quantity cannot be negative'],
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    reference: {
      type: String,
      trim: true,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User performing transaction is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and individual indexes
inventoryTransactionSchema.index({ medicine: 1, createdAt: -1 });
inventoryTransactionSchema.index({ batch: 1, createdAt: -1 });
inventoryTransactionSchema.index({ transactionType: 1, createdAt: -1 });

// JSON transform
inventoryTransactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = InventoryTransaction;
module.exports.transactionTypes = transactionTypes;
