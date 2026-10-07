const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ReturnRequest = require('../models/ReturnRequest');
const Recall = require('../models/Recall');
const Notification = require('../models/Notification');

// Helper to calculate warranty expiry (default 1 Year = 12 months)
const calculateWarrantyExpiry = (purchaseDate, warrantyMonths = 12) => {
  const date = new Date(purchaseDate);
  date.setMonth(date.getMonth() + warrantyMonths);
  return date;
};

// @desc    Customer submits a complaint with warranty validation
// @route   POST /api/complaints
// @access  Private (Customer)
const createComplaint = async (req, res) => {
  try {
    const { orderId, complaintType, description } = req.body;

    if (!orderId || !complaintType) {
      return res.status(400).json({
        success: false,
        message: 'Please select an order and a complaint type'
      });
    }

    // 1. Fetch Order details
    const order = await Order.findById(orderId).populate('productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order record not found'
      });
    }

    if (order.customerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit complaints for your own orders'
      });
    }

    // 2. Validate Warranty Period
    const purchaseDate = new Date(order.orderDate || order.createdAt);
    const warrantyMonths = order.productId?.warrantyMonths || 12; // Default 1 Year (12 months)
    const warrantyExpiryDate = calculateWarrantyExpiry(purchaseDate, warrantyMonths);
    const now = new Date();

    const isWarrantyActive = now <= warrantyExpiryDate;
    const warrantyStatus = isWarrantyActive ? 'Active' : 'Expired';

    if (!isWarrantyActive) {
      return res.status(400).json({
        success: false,
        message: `Warranty Expired! Warranty for this product ended on ${warrantyExpiryDate.toLocaleDateString()}. Normal warranty complaints cannot be submitted after expiry.`
      });
    }

    // 3. Generate unique complaint reference
    const complaintId = `CMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const complaint = await Complaint.create({
      complaintId,
      orderId: order._id,
      orderRefId: order.orderId,
      customerId: req.user.id,
      shopId: order.shopId,
      managerId: order.managerId,
      productId: order.productId?._id || order.productId,
      productName: order.productName,
      batchNo: order.batchNo,
      purchaseDate,
      warrantyPeriod: `${warrantyMonths / 12 >= 1 ? warrantyMonths / 12 + ' Year' : warrantyMonths + ' Months'}`,
      warrantyExpiryDate,
      warrantyStatus,
      complaintType,
      description: description || '',
      status: 'SUBMITTED'
    });

    // 4. Notify Manager about the complaint
    await Notification.create({
      userId: order.managerId,
      role: 'Manager',
      title: '⚠️ New Customer Complaint Filed',
      message: `Customer '${req.user.name}' filed a '${complaintType}' complaint for Batch ${order.batchNo} (Order #${order.orderId}).`,
      type: 'SYSTEM',
      relatedId: complaint._id.toString()
    });

    return res.status(201).json({
      success: true,
      message: `Complaint #${complaintId} submitted successfully under Active Warranty!`,
      complaint
    });
  } catch (error) {
    console.error('[Create Complaint Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error.message
    });
  }
};

// @desc    Get customer's submitted complaints
// @route   GET /api/complaints/my-complaints
// @access  Private (Customer)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ customerId: req.user.id })
      .populate('shopId', 'name email')
      .populate('managerId', 'name email')
      .populate('productId', 'name image')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer complaints',
      error: error.message
    });
  }
};

// @desc    Get manager's product complaints
// @route   GET /api/complaints/manager
// @access  Private (Manager)
const getManagerComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ managerId: req.user.id })
      .populate('customerId', 'name email phone')
      .populate('shopId', 'name email')
      .populate('productId', 'name image')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch manager complaints',
      error: error.message
    });
  }
};

// @desc    Smart Recall Detection Endpoint for Manager
// @route   GET /api/complaints/smart-recall-analysis
// @access  Private (Manager)
const getSmartRecallAnalysis = async (req, res) => {
  try {
    const managerId = req.user.id;

    // Fetch all products created by Manager
    const products = await Product.find({ managerId });

    // Fetch all orders, complaints, returns, and existing recalls under this manager
    const [orders, complaints, returns, existingRecalls] = await Promise.all([
      Order.find({ managerId }),
      Complaint.find({ managerId }).populate('customerId', 'name email'),
      ReturnRequest.find({ managerId }),
      Recall.find({ managerId })
    ]);

    // Collect all unique batch numbers
    const batchSet = new Set();
    products.forEach((p) => batchSet.add(p.batchNo.toUpperCase()));
    orders.forEach((o) => batchSet.add(o.batchNo.toUpperCase()));
    complaints.forEach((c) => batchSet.add(c.batchNo.toUpperCase()));

    const activeRecallsMap = new Map();
    existingRecalls.forEach((r) => activeRecallsMap.set(r.batchNo.toUpperCase(), r));

    const analysis = Array.from(batchSet).map((batchNo) => {
      // Find matching product
      const product = products.find((p) => p.batchNo.toUpperCase() === batchNo);
      const productName = product ? product.name : (orders.find((o) => o.batchNo.toUpperCase() === batchNo)?.productName || batchNo);

      // Batch Orders
      const batchOrders = orders.filter((o) => o.batchNo.toUpperCase() === batchNo);
      const totalSold = batchOrders.reduce((sum, o) => sum + o.quantity, 0);

      // Batch Complaints
      const batchComplaints = complaints.filter((c) => c.batchNo.toUpperCase() === batchNo);
      const totalComplaints = batchComplaints.length;

      // Batch Returns
      const batchReturns = returns.filter((r) => r.batchNo.toUpperCase() === batchNo);
      const totalReturns = batchReturns.reduce((sum, r) => sum + r.quantity, 0);

      // Rates calculation
      const complaintRate = totalSold > 0 ? Number(((totalComplaints / totalSold) * 100).toFixed(1)) : 0;
      const returnRate = totalSold > 0 ? Number(((totalReturns / totalSold) * 100).toFixed(1)) : 0;

      // Group complaints by complaintType
      const complaintTypeCounts = {};
      batchComplaints.forEach((c) => {
        complaintTypeCounts[c.complaintType] = (complaintTypeCounts[c.complaintType] || 0) + 1;
      });

      // Find main issue (most repeated complaint type)
      let mainIssue = 'None';
      let maxCount = 0;
      Object.entries(complaintTypeCounts).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mainIssue = type;
        }
      });

      // Distinct affected customers
      const affectedCustomerIds = new Set();
      batchComplaints.forEach((c) => affectedCustomerIds.add(c.customerId?._id?.toString() || c.customerId?.toString()));
      batchReturns.forEach((r) => affectedCustomerIds.add(r.customerId?.toString()));
      const affectedCustomersCount = affectedCustomerIds.size;

      // Risk Level Calculation
      const hasSafetyOrExpiredIssue = complaintTypeCounts['Safety Issue'] > 0 || complaintTypeCounts['Expired Product'] > 0;
      let riskLevel = 'LOW';

      if (totalComplaints >= 10 || complaintRate >= 25 || (hasSafetyOrExpiredIssue && totalComplaints >= 3)) {
        riskLevel = 'CRITICAL';
      } else if (totalComplaints >= 5 || complaintRate >= 15 || hasSafetyOrExpiredIssue) {
        riskLevel = 'HIGH';
      } else if (totalComplaints >= 2 || complaintRate >= 5) {
        riskLevel = 'MEDIUM';
      } else {
        riskLevel = 'LOW';
      }

      const existingRecall = activeRecallsMap.get(batchNo);

      return {
        batchNo,
        productName,
        productId: product?._id,
        totalSold,
        totalComplaints,
        complaintRate,
        totalReturns,
        returnRate,
        complaintTypeCounts,
        mainIssue,
        affectedCustomersCount,
        riskLevel,
        isRecalled: !!existingRecall,
        recallId: existingRecall?.recallId || null
      };
    });

    // Sort by risk priority: CRITICAL > HIGH > MEDIUM > LOW
    const riskPriority = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    analysis.sort((a, b) => riskPriority[b.riskLevel] - riskPriority[a.riskLevel] || b.totalComplaints - a.totalComplaints);

    return res.status(200).json({
      success: true,
      count: analysis.length,
      analysis
    });
  } catch (error) {
    console.error('[Smart Recall Analysis Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to run smart recall analysis',
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getManagerComplaints,
  getSmartRecallAnalysis
};
