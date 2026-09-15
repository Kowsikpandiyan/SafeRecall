const mongoose = require('mongoose');

const shopInventorySchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    batchNo: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    recalledQuantity: {
      type: Number,
      default: 0
    },
    unitPrice: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

shopInventorySchema.index({ shopId: 1, productId: 1, batchNo: 1 }, { unique: true });

module.exports = mongoose.model('ShopInventory', shopInventorySchema);
