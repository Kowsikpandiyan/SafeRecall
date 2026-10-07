const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    orderRefId: {
      type: String,
      required: true
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
      uppercase: true,
      index: true
    },
    purchaseDate: {
      type: Date,
      required: true
    },
    warrantyPeriod: {
      type: String,
      default: '1 Year'
    },
    warrantyExpiryDate: {
      type: Date,
      required: true
    },
    warrantyStatus: {
      type: String,
      enum: ['Active', 'Expired'],
      default: 'Active'
    },
    complaintType: {
      type: String,
      enum: [
        'Manufacturing Defect',
        'Damaged Product',
        'Product Not Working',
        'Safety Issue',
        'Expired Product',
        'Other'
      ],
      required: [true, 'Please select a complaint type']
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'SUBMITTED'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
