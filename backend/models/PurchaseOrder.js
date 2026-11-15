const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
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
      required: [true, 'Medicine SKU snapshot is required.'],
      trim: true,
      uppercase: true,
    },
    orderedQuantity: {
      type: Number,
      required: [true, 'Ordered quantity is required.'],
      min: [1, 'Ordered quantity must be at least 1.'],
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Received quantity cannot be negative.'],
    },
    unitCost: {
      type: Number,
      required: [true, 'Unit cost is required.'],
      min: [0, 'Unit cost cannot be negative.'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative.'],
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
  },
  { _id: true }
);

const receivingRecordSchema = new mongoose.Schema(
  {
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    supplierInvoiceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    items: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
        },
        medicineName: String,
        batchNumber: String,
        quantityReceived: Number,
        purchasePrice: Number,
        sellingPrice: Number,
        expiryDate: Date,
        manufacturingDate: Date,
        batchId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MedicineBatch',
        },
        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryTransaction',
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    purchaseOrderNumber: {
      type: String,
      required: [true, 'Purchase order number is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required.'],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'ordered', 'partially_received', 'received', 'cancelled'],
        message: 'Invalid purchase order status.',
      },
      default: 'draft',
    },
    items: {
      type: [purchaseItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'A purchase order must contain at least one medicine item.',
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
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters.'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receivedAt: {
      type: Date,
      default: null,
    },
    receivingHistory: {
      type: [receivingRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ createdAt: -1 });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
