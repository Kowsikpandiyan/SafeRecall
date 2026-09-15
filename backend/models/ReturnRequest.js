const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema(
  {
    returnId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    recallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recall',
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    batchNo: {
      type: String,
      required: true,
      uppercase: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    reason: {
      type: String,
      default: 'Product recall return request'
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ACCEPTED_BY_SHOP',
        'REJECTED_BY_SHOP',
        'RETURNED_TO_MANAGER',
        'RECEIVED_BY_MANAGER'
      ],
      default: 'PENDING'
    },
    shopNotes: {
      type: String,
      default: ''
    },
    managerNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
