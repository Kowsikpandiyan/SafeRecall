const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add product name'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'
    },
    price: {
      type: Number,
      required: [true, 'Please add product price'],
      min: [0, 'Price must be non-negative']
    },
    batchNo: {
      type: String,
      required: [true, 'Please add batch number'],
      trim: true,
      uppercase: true,
      index: true // Indexed for fast batch traceability lookup
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Please specify total quantity'],
      min: [1, 'Total quantity must be at least 1']
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative']
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    averageRating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    warrantyMonths: {
      type: Number,
      default: 12
    }
  },
  {
    timestamps: true
  }
);

// Compound index on managerId and batchNo
productSchema.index({ managerId: 1, batchNo: 1 });

module.exports = mongoose.model('Product', productSchema);
