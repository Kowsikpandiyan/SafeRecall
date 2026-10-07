const User = require('../models/User');
const Product = require('../models/Product');
const ShopPurchase = require('../models/ShopPurchase');
const Order = require('../models/Order');
const Recall = require('../models/Recall');
const Notification = require('../models/Notification');
const { sendProductRecallEmail } = require('../services/emailService');

// @desc    Manager creates a Product Recall by Batch Number
// @route   POST /api/recalls
// @access  Private (Manager)
const createRecall = async (req, res) => {
  try {
    let { batchNo, productId, reason, message, returnInstructions, supportContact } = req.body;

    if ((!batchNo && !productId) || !reason || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batchNo or productId, recall reason, and instructions message'
      });
    }

    let formattedBatch = batchNo ? batchNo.trim().toUpperCase() : '';
    let product;

    // 1. Find Product by batchNo or productId under this manager/admin
    if (formattedBatch) {
      product = await Product.findOne({
        managerId: req.user.id,
        batchNo: formattedBatch
      });
    } else if (productId) {
      product = await Product.findOne({
        _id: productId,
        managerId: req.user.id
      });
      if (product) formattedBatch = product.batchNo;
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ${formattedBatch ? `batch '${formattedBatch}'` : ''} not found under your manager account`
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

    // 2. AUTOMATIC TRACEABILITY: Find all affected Shops & Customer Orders matching the exact recalled Product ID
    const affectedShopPurchases = await ShopPurchase.find({ batchNo: formattedBatch }).distinct('shopId');
    const affectedCustomerOrders = await Order.find({ productId: product._id })
      .populate('customerId', 'name email phone role')
      .populate('shopId', 'name email');

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

    // 4. Dispatch Internal Notifications to Affected Customers
    const customerNotificationPromises = affectedCustomerOrders.map((order) => {
      return Notification.create({
        userId: order.customerId?._id || order.customerId,
        role: 'Customer',
        title: '⚠️ RECALL NOTICE FOR YOUR PURCHASED PRODUCT',
        message: `Recall issued for '${product.name}' (Batch: ${formattedBatch}). Reason: ${reason}. Please request a return to your original purchase shop.`,
        type: 'RECALL',
        relatedId: recall._id.toString()
      });
    });

    await Promise.all([...shopNotificationPromises, ...customerNotificationPromises]);

    // 5. Send Product Recall Email DIRECTLY to Customer's Registered Email Address
    // Extract customer details from orders and deduplicate by customer registered email
    const uniqueCustomerMap = new Map();

    for (const order of affectedCustomerOrders) {
      let customer = order.customerId;

      // If customer was not populated as an object, fetch directly from User collection
      if (customer && (!customer.email || typeof customer === 'string')) {
        const customerIdVal = customer._id || customer;
        try {
          customer = await User.findById(customerIdVal).select('name email phone role');
        } catch (findErr) {
          console.error(`[User lookup error for ID ${customerIdVal}]:`, findErr.message);
        }
      }

      if (!customer || !customer.email) {
        continue;
      }

      const customerEmail = customer.email.trim().toLowerCase();

      // Ensure each affected customer receives only ONE recall email
      if (!uniqueCustomerMap.has(customerEmail)) {
        const senderShopName = order.shopId?.name || req.user.name || 'Shop / Manufacturer';
        const senderShopEmail = order.shopId?.email || req.user.email || '';

        uniqueCustomerMap.set(customerEmail, {
          email: customer.email.trim(),
          name: customer.name || 'Customer',
          orderId: order.orderId,
          shopName: senderShopName,
          shopEmail: senderShopEmail
        });
      }
    }

    // Dispatch email to each affected customer's registered email with per-customer error isolation
    const emailPromises = Array.from(uniqueCustomerMap.values()).map(async (custData) => {
      try {
        console.log(`[Recall Dispatch]: Sending recall alert to customer registered email: ${custData.email} for order #${custData.orderId}`);
        await sendProductRecallEmail({
          to: custData.email,
          customerName: custData.name,
          productName: product.name,
          orderId: custData.orderId,
          shopName: custData.shopName,
          shopEmail: custData.shopEmail,
          recallReason: reason
        });
      } catch (emailErr) {
        console.error(`[Recall Email Error for Customer ${custData.email}]:`, emailErr.message);
      }
    });

    // Run email deliveries with error isolation; failures will not crash or block response
    await Promise.allSettled(emailPromises);

    return res.status(201).json({
      success: true,
      message: `Product Recall #${recallId} initiated successfully for Batch '${formattedBatch}'!`,
      recall,
      affectedMetrics: {
        affectedShopsCount: affectedShopPurchases.length,
        affectedCustomerOrdersCount: affectedCustomerOrders.length,
        uniqueAffectedCustomersCount: uniqueCustomerMap.size,
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
