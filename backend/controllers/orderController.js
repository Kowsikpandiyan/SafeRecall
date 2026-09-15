const ShopInventory = require('../models/ShopInventory');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Customer places an order from a Shop
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res) => {
  try {
    const { shopInventoryId, quantity } = req.body;

    const qty = Number(quantity);

    if (!shopInventoryId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid shopInventoryId and positive quantity'
      });
    }

    // 1. Fetch shop inventory entry
    const shopItem = await ShopInventory.findById(shopInventoryId)
      .populate('productId', 'name price batchNo')
      .populate('shopId', 'name email');

    if (!shopItem) {
      return res.status(404).json({
        success: false,
        message: 'Product item not found in Shop inventory'
      });
    }

    // 2. Validate availability against Shop stock (prevent negative stock!)
    if (shopItem.availableQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Purchase rejected! Requested quantity (${qty}) exceeds Shop available stock (${shopItem.availableQuantity}).`
      });
    }

    // 3. Atomically decrement Shop available quantity
    shopItem.availableQuantity -= qty;
    await shopItem.save();

    // 4. Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const price = shopItem.unitPrice;
    const totalAmount = qty * price;

    // 5. Create Order preserving complete multi-tier lineage
    const order = await Order.create({
      orderId,
      customerId: req.user.id,
      shopId: shopItem.shopId._id,
      managerId: shopItem.managerId,
      productId: shopItem.productId._id,
      productName: shopItem.productId.name,
      batchNo: shopItem.batchNo,
      quantity: qty,
      price,
      totalAmount,
      orderDate: new Date(),
      status: 'COMPLETED'
    });

    // 6. Notify Shop owner
    await Notification.create({
      userId: shopItem.shopId._id,
      role: 'Shop',
      title: 'New Customer Order',
      message: `Customer '${req.user.name}' placed Order #${orderId} (${qty} units of ${shopItem.productId.name}).`,
      type: 'ORDER',
      relatedId: order._id.toString()
    });

    return res.status(201).json({
      success: true,
      message: `Order #${orderId} placed successfully!`,
      order,
      shopRemainingStock: shopItem.availableQuantity
    });
  } catch (error) {
    console.error('[Create Order Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
};

// @desc    Get order history for logged-in Customer
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate('shopId', 'name email phone address')
      .populate('managerId', 'name email')
      .populate('productId', 'name image description')
      .sort({ orderDate: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders'
    });
  }
};

// @desc    Get orders received by logged-in Shop
// @route   GET /api/orders/shop-orders
// @access  Private (Shop)
const getShopOrders = async (req, res) => {
  try {
    const orders = await Order.find({ shopId: req.user.id })
      .populate('customerId', 'name email phone address')
      .populate('productId', 'name image')
      .sort({ orderDate: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shop customer orders'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getShopOrders
};
