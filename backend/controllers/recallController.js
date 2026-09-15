const Product = require('../models/Product');
const ShopPurchase = require('../models/ShopPurchase');
const Order = require('../models/Order');
const Recall = require('../models/Recall');
const Notification = require('../models/Notification');

// @desc    Manager creates a Product Recall by Batch Number
// @route   POST /api/recalls
// @access  Private (Manager)
const createRecall = async (req, res) => {
  try {
    const { batchNo, reason, message } = req.body;

    if (!batchNo || !reason || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batchNo, reason, and message for the product recall'
      });
    }

    const formattedBatch = batchNo.trim().toUpperCase();

    // 1. Find Product
    const product = await Product.findOne({
      managerId: req.user.id,
      batchNo: formattedBatch
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product batch '${formattedBatch}' not found under your manager account`
      });
    }

    const recallId = `RCL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const recall = await Recall.create({
      recallId,
      batchNo: formattedBatch,
      managerId: req.user.id,
      productId: product._id,
      productName: product.name,
      reason,
      message,
      status: 'ACTIVE'
    });

    // 2. AUTOMATIC TRACEABILITY: Find all affected Shops & Customers from transaction records
    const affectedShopPurchases = await ShopPurchase.find({ batchNo: formattedBatch }).distinct('shopId');
    const affectedCustomerOrders = await Order.find({ batchNo: formattedBatch });

    // 3. Dispatch Notifications to Affected Shops
    const shopNotificationPromises = affectedShopPurchases.map((shopId) => {
      return Notification.create({
        userId: shopId,
        role: 'Shop',
        title: '⚠️ URGENT: PRODUCT RECALL ALERT',
        message: `Product '${product.name}' (Batch: ${formattedBatch}) has been recalled by Manager '${req.user.name}'. Reason: ${reason}. Action: Stop sales & accept customer returns.`,
        type: 'RECALL',
        relatedId: recall._id.toString()
      });
    });

    // 4. Dispatch Notifications to Affected Customers (including original purchase shop reference!)
    const customerNotificationPromises = affectedCustomerOrders.map((order) => {
      return Notification.create({
        userId: order.customerId,
        role: 'Customer',
        title: '⚠️ RECALL NOTICE FOR YOUR PURCHASED PRODUCT',
        message: `Recall issued for '${product.name}' (Batch: ${formattedBatch}). Reason: ${reason}. Please request a return to your original purchase shop.`,
        type: 'RECALL',
        relatedId: recall._id.toString()
      });
    });

    await Promise.all([...shopNotificationPromises, ...customerNotificationPromises]);

    return res.status(201).json({
      success: true,
      message: `Product Recall #${recallId} initiated successfully for Batch '${formattedBatch}'!`,
      recall,
      affectedMetrics: {
        affectedShopsCount: affectedShopPurchases.length,
        affectedCustomerOrdersCount: affectedCustomerOrders.length,
        totalNotificationsDispatched: affectedShopPurchases.length + affectedCustomerOrders.length
      }
    });
  } catch (error) {
    console.error('[Create Recall Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product recall',
      error: error.message
    });
  }
};

// @desc    Get recalls (Filtered by role: Manager, Shop, Customer)
// @route   GET /api/recalls
// @access  Private (Authenticated users)
const getRecalls = async (req, res) => {
  try {
    let recalls = [];

    if (req.user.role === 'Manager') {
      recalls = await Recall.find({ managerId: req.user.id })
        .populate('productId', 'name image price batchNo')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'Shop') {
      // Find batches purchased by this shop
      const shopBatches = await ShopPurchase.find({ shopId: req.user.id }).distinct('batchNo');
      recalls = await Recall.find({ batchNo: { $in: shopBatches } })
        .populate('managerId', 'name email phone')
        .populate('productId', 'name image price batchNo')
        .sort({ createdAt: -1 });
    } else {
      // Customer: Find batches purchased in orders
      const customerBatches = await Order.find({ customerId: req.user.id }).distinct('batchNo');
      recalls = await Recall.find({ batchNo: { $in: customerBatches } })
        .populate('managerId', 'name email')
        .populate('productId', 'name image price batchNo')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: recalls.length,
      recalls
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load recalls',
      error: error.message
    });
  }
};

module.exports = {
  createRecall,
  getRecalls
};
