const mongoose = require('mongoose');

const recallSchema = new mongoose.Schema(
  {
    recallId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    batchNo: {
      type: String,
      required: true,
      uppercase: true,
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
    reason: {
      type: String,
      required: [true, 'Please state the recall reason']
    },
    message: {
      type: String,
      required: [true, 'Please provide instructions/message for affected users']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Recall', recallSchema);
