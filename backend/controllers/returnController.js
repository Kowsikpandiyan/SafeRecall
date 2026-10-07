const Order = require('../models/Order');
const ReturnRequest = require('../models/ReturnRequest');
const ShopInventory = require('../models/ShopInventory');
const Recall = require('../models/Recall');
const Notification = require('../models/Notification');
const { sendReturnRequestEmail } = require('../services/emailService');

// @desc    Customer submits a return request for a recalled order to original Shop
// @route   POST /api/returns/customer
// @access  Private (Customer)
const customerRequestReturn = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId for the return request'
      });
    }

    // 1. Fetch original Order with associated Shop details
    const order = await Order.findById(orderId).populate('shopId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Original order record not found'
      });
    }

    if (order.customerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only request returns for your own orders'
      });
    }

    // 2. Check if a return request already exists for this order
    const existingReturn = await ReturnRequest.findOne({ orderId: order._id });
    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: `Return request already submitted for this order (Status: ${existingReturn.status}).`
      });
    }

    // 3. Find associated Recall by batchNo
    const recall = await Recall.findOne({ batchNo: order.batchNo });

    const returnId = `RET-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const returnReq = await ReturnRequest.create({
      returnId,
      recallId: recall ? recall._id : order._id,
      orderId: order._id,
      customerId: req.user.id,
      shopId: order.shopId?._id || order.shopId, // Strictly linked to Original Purchase Shop!
      managerId: order.managerId,
      productId: order.productId,
      productName: order.productName,
      batchNo: order.batchNo,
      quantity: order.quantity,
      reason: reason || 'Product recall return request',
      status: 'PENDING'
    });

    // 4. Send notification to the Original Purchase Shop
    await Notification.create({
      userId: order.shopId?._id || order.shopId,
      role: 'Shop',
      title: 'New Customer Return Request',
      message: `Customer '${req.user.name}' requested return of ${order.quantity} units for Order #${order.orderId} (Batch: ${order.batchNo}).`,
      type: 'RETURN',
      relatedId: returnReq._id.toString()
    });

    // 5. Send product return/recall confirmation email to customer (non-blocking)
    try {
      sendReturnRequestEmail({
        to: req.user.email,
        customerName: req.user.name,
        shopName: order.shopId?.name,
        shopEmail: order.shopId?.email,
        productName: order.productName,
        orderId: order.orderId,
        returnReason: reason || 'Product recall return request'
      }).catch((emailErr) => console.error('[Return Email Error]:', emailErr.message));
    } catch (emailErr) {
      console.error('[Return Email Error]:', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `Return Request #${returnId} submitted to original purchase Shop!`,
      returnRequest: returnReq
    });
  } catch (error) {
    console.error('[Customer Return Request Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit return request',
      error: error.message
    });
  }
};

// @desc    Shop accepts or rejects Customer return request
// @route   PATCH /api/returns/shop/:returnId
// @access  Private (Shop)
const shopRespondReturn = async (req, res) => {
  try {
    const { status, shopNotes } = req.body;

    if (!['ACCEPTED_BY_SHOP', 'REJECTED_BY_SHOP'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be ACCEPTED_BY_SHOP or REJECTED_BY_SHOP'
      });
    }

    const returnReq = await ReturnRequest.findById(req.params.returnId);

    if (!returnReq) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }

    if (returnReq.shopId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process returns for another shop'
      });
    }

    returnReq.status = status;
    if (shopNotes) returnReq.shopNotes = shopNotes;
    await returnReq.save();

    // If accepted, record in Shop Inventory under recalledQuantity
    if (status === 'ACCEPTED_BY_SHOP') {
      const invItem = await ShopInventory.findOne({
        shopId: req.user.id,
        batchNo: returnReq.batchNo
      });

      if (invItem) {
        invItem.recalledQuantity += returnReq.quantity;
        await invItem.save();
      }

      // Update Order status
      await Order.findByIdAndUpdate(returnReq.orderId, { status: 'RECALLED' });
    }

    // Notify Customer
    await Notification.create({
      userId: returnReq.customerId,
      role: 'Customer',
      title: status === 'ACCEPTED_BY_SHOP' ? 'Return Approved by Shop' : 'Return Request Update',
      message: `Shop '${req.user.name}' has ${status === 'ACCEPTED_BY_SHOP' ? 'accepted' : 'rejected'} your return request for Batch ${returnReq.batchNo}.`,
      type: 'RETURN',
      relatedId: returnReq._id.toString()
    });

    return res.status(200).json({
      success: true,
      message: `Return request status updated to '${status}'`,
      returnRequest: returnReq
    });
  } catch (error) {
    console.error('[Shop Respond Return Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update return status',
      error: error.message
    });
  }
};

// @desc    Shop returns collected recalled products to Manager
// @route   POST /api/returns/shop-to-manager
// @access  Private (Shop)
const shopReturnToManager = async (req, res) => {
  try {
    const { returnRequestId } = req.body;

    const returnReq = await ReturnRequest.findById(returnRequestId);

    if (!returnReq) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }

    if (returnReq.shopId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this return request'
      });
    }

    returnReq.status = 'RETURNED_TO_MANAGER';
    await returnReq.save();

    // Send notification to Manager
    await Notification.create({
      userId: returnReq.managerId,
      role: 'Manager',
      title: 'Recalled Products Returned by Shop',
      message: `Shop '${req.user.name}' has returned ${returnReq.quantity} recalled units of '${returnReq.productName}' (Batch: ${returnReq.batchNo}).`,
      type: 'RETURN',
      relatedId: returnReq._id.toString()
    });

    return res.status(200).json({
      success: true,
      message: 'Recalled items successfully returned to the Manager!',
      returnRequest: returnReq
    });
  } catch (error) {
    console.error('[Shop Return To Manager Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to return items to manager'
    });
  }
};

// @desc    Manager receives returned recalled products from Shop
// @route   PATCH /api/returns/manager/:returnId
// @access  Private (Manager)
const managerReceiveReturn = async (req, res) => {
  try {
    const returnReq = await ReturnRequest.findById(req.params.returnId);

    if (!returnReq) {
      return res.status(404).json({
        success: false,
        message: 'Return request record not found'
      });
    }

    if (returnReq.managerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process returns for another manager'
      });
    }

    returnReq.status = 'RECEIVED_BY_MANAGER';
    await returnReq.save();

    // Update order status to RETURNED
    await Order.findByIdAndUpdate(returnReq.orderId, { status: 'RETURNED' });

    // Notify Shop & Customer
    await Notification.create({
      userId: returnReq.shopId,
      role: 'Shop',
      title: 'Recalled Stock Received by Manager',
      message: `Manager confirmed receipt of ${returnReq.quantity} recalled units for Batch ${returnReq.batchNo}.`,
      type: 'RETURN',
      relatedId: returnReq._id.toString()
    });

    return res.status(200).json({
      success: true,
      message: 'Manager confirmed receipt of returned recalled stock!',
      returnRequest: returnReq
    });
  } catch (error) {
    console.error('[Manager Receive Return Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update receipt status'
    });
  }
};

// @desc    Get return requests list by role
// @route   GET /api/returns
// @access  Private (Authenticated users)
const getReturnRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Customer') {
      query.customerId = req.user.id;
    } else if (req.user.role === 'Shop') {
      query.shopId = req.user.id;
    } else if (req.user.role === 'Manager') {
      query.managerId = req.user.id;
    }

    const returns = await ReturnRequest.find(query)
      .populate('customerId', 'name email phone')
      .populate('shopId', 'name email phone')
      .populate('managerId', 'name email')
      .populate('productId', 'name image price batchNo')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: returns.length,
      returnRequests: returns
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch return requests'
    });
  }
};

module.exports = {
  customerRequestReturn,
  shopRespondReturn,
  shopReturnToManager,
  managerReceiveReturn,
  getReturnRequests
};
