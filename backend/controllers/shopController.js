const Product = require('../models/Product');
const ShopInventory = require('../models/ShopInventory');
const ShopPurchase = require('../models/ShopPurchase');
const Notification = require('../models/Notification');

// @desc    Shop purchases stock from a Manager
// @route   POST /api/shop/purchases
// @access  Private (Shop)
const purchaseFromManager = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const qtyToBuy = Number(quantity);

    if (!productId || isNaN(qtyToBuy) || qtyToBuy <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select a product and valid positive quantity'
      });
    }

    // 1. Fetch product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in Manager catalog'
      });
    }

    // 2. Validate availability against Manager stock (prevent negative stock!)
    if (product.availableQuantity < qtyToBuy) {
      return res.status(400).json({
        success: false,
        message: `Purchase rejected! Requested quantity (${qtyToBuy}) exceeds Manager available stock (${product.availableQuantity}).`
      });
    }

    // 3. Atomically decrement Manager available stock
    product.availableQuantity -= qtyToBuy;
    await product.save();

    // 4. Create or update Shop Inventory item
    let inventoryItem = await ShopInventory.findOne({
      shopId: req.user.id,
      productId: product._id,
      batchNo: product.batchNo
    });

    if (inventoryItem) {
      inventoryItem.quantity += qtyToBuy;
      inventoryItem.availableQuantity += qtyToBuy;
      await inventoryItem.save();
    } else {
      inventoryItem = await ShopInventory.create({
        shopId: req.user.id,
        managerId: product.managerId,
        productId: product._id,
        batchNo: product.batchNo,
        quantity: qtyToBuy,
        availableQuantity: qtyToBuy,
        unitPrice: product.price
      });
    }

    // 5. Create ShopPurchase transaction record
    const purchaseRecord = await ShopPurchase.create({
      shopId: req.user.id,
      managerId: product.managerId,
      productId: product._id,
      batchNo: product.batchNo,
      quantity: qtyToBuy,
      unitPrice: product.price,
      totalPrice: qtyToBuy * product.price,
      purchaseDate: new Date()
    });

    // 6. Send notification to Manager
    await Notification.create({
      userId: product.managerId,
      role: 'Manager',
      title: 'Shop Purchase Alert',
      message: `Shop '${req.user.name}' purchased ${qtyToBuy} units of '${product.name}' (Batch: ${product.batchNo}).`,
      type: 'ORDER',
      relatedId: purchaseRecord._id.toString()
    });

    return res.status(201).json({
      success: true,
      message: `Successfully purchased ${qtyToBuy} units of ${product.name} (Batch: ${product.batchNo})!`,
      purchase: purchaseRecord,
      inventory: inventoryItem,
      managerRemainingStock: product.availableQuantity
    });
  } catch (error) {
    console.error('[Shop Purchase Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete purchase',
      error: error.message
    });
  }
};

// @desc    Get logged in Shop's independent inventory
// @route   GET /api/shop/inventory
// @access  Private (Shop)
const getShopInventory = async (req, res) => {
  try {
    const inventory = await ShopInventory.find({ shopId: req.user.id })
      .populate('productId', 'name description image price batchNo')
      .populate('managerId', 'name email')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load shop inventory',
      error: error.message
    });
  }
};

// @desc    Get Shop's purchase history from Managers
// @route   GET /api/shop/purchases
// @access  Private (Shop)
const getShopPurchases = async (req, res) => {
  try {
    const purchases = await ShopPurchase.find({ shopId: req.user.id })
      .populate('productId', 'name image batchNo')
      .populate('managerId', 'name email')
      .sort({ purchaseDate: -1 });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load purchase history'
    });
  }
};

// @desc    Get Shops that purchased from Manager
// @route   GET /api/shop/manager-purchasers
// @access  Private (Manager)
const getShopsSuppliedByManager = async (req, res) => {
  try {
    const purchases = await ShopPurchase.find({ managerId: req.user.id })
      .populate('shopId', 'name email phone address')
      .populate('productId', 'name batchNo')
      .sort({ purchaseDate: -1 });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load shop purchasers'
    });
  }
};

module.exports = {
  purchaseFromManager,
  getShopInventory,
  getShopPurchases,
  getShopsSuppliedByManager
};
