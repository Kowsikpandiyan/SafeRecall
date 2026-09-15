const Product = require('../models/Product');
const ShopPurchase = require('../models/ShopPurchase');
const ShopInventory = require('../models/ShopInventory');
const Order = require('../models/Order');
const Recall = require('../models/Recall');
const ReturnRequest = require('../models/ReturnRequest');

// @desc    Search and build full multi-tier batch traceability
// @route   GET /api/traceability/:batchNo
// @access  Private (Manager, Shop, Customer)
const getBatchTraceability = async (req, res) => {
  try {
    const batchNo = req.params.batchNo.trim().toUpperCase();

    // 1. Product & Manager Info
    const product = await Product.findOne({ batchNo }).populate('managerId', 'name email phone address');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `No product batch found matching '${batchNo}'`
      });
    }

    // 2. Shops supplied
    const shopPurchases = await ShopPurchase.find({ batchNo })
      .populate('shopId', 'name email phone address')
      .sort({ purchaseDate: -1 });

    const shopInventories = await ShopInventory.find({ batchNo })
      .populate('shopId', 'name email');

    // 3. Customer Orders
    const customerOrders = await Order.find({ batchNo })
      .populate('customerId', 'name email phone address')
      .populate('shopId', 'name email')
      .sort({ orderDate: -1 });

    // 4. Recall information
    const recalls = await Recall.find({ batchNo }).sort({ createdAt: -1 });

    // 5. Return requests
    const returnRequests = await ReturnRequest.find({ batchNo })
      .populate('customerId', 'name email')
      .populate('shopId', 'name email')
      .sort({ createdAt: -1 });

    // Grouping Customers under their respective purchase Shops
    const shopsMap = {};

    shopPurchases.forEach((sp) => {
      const sId = sp.shopId?._id?.toString() || 'unknown';
      if (!shopsMap[sId]) {
        const inv = shopInventories.find((si) => si.shopId?._id?.toString() === sId);
        shopsMap[sId] = {
          shopId: sp.shopId?._id,
          shopName: sp.shopId?.name || 'Shop Member',
          shopEmail: sp.shopId?.email || '',
          totalQuantityReceived: 0,
          currentShopStock: inv ? inv.availableQuantity : 0,
          customerOrders: []
        };
      }
      shopsMap[sId].totalQuantityReceived += sp.quantity;
    });

    customerOrders.forEach((ord) => {
      const sId = ord.shopId?._id?.toString() || ord.shopId?.toString();
      if (shopsMap[sId]) {
        shopsMap[sId].customerOrders.push({
          orderId: ord.orderId,
          customerId: ord.customerId?._id,
          customerName: ord.customerId?.name || 'Customer Member',
          customerEmail: ord.customerId?.email || '',
          quantityPurchased: ord.quantity,
          unitPrice: ord.price,
          totalAmount: ord.totalAmount,
          orderDate: ord.orderDate,
          status: ord.status
        });
      }
    });

    const totalDistributedToShops = shopPurchases.reduce((sum, sp) => sum + sp.quantity, 0);
    const totalPurchasedByCustomers = customerOrders.reduce((sum, ord) => sum + ord.quantity, 0);
    const totalReturnsSubmitted = returnRequests.length;
    const totalReturnsCompleted = returnRequests.filter((r) => r.status === 'RECEIVED_BY_MANAGER').length;

    return res.status(200).json({
      success: true,
      traceability: {
        batchNo,
        product: {
          id: product._id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          totalQuantity: product.totalQuantity,
          availableQuantity: product.availableQuantity,
          createdAt: product.createdAt
        },
        manager: {
          id: product.managerId?._id,
          name: product.managerId?.name,
          email: product.managerId?.email,
          phone: product.managerId?.phone,
          address: product.managerId?.address
        },
        summary: {
          totalManufactured: product.totalQuantity,
          totalDistributedToShops,
          totalPurchasedByCustomers,
          uniqueShopsCount: Object.keys(shopsMap).length,
          uniqueCustomersCount: customerOrders.length,
          activeRecallsCount: recalls.filter((r) => r.status === 'ACTIVE').length,
          totalReturnsSubmitted,
          totalReturnsCompleted
        },
        shops: Object.values(shopsMap),
        recalls,
        returns: returnRequests
      }
    });
  } catch (error) {
    console.error('[Traceability Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate batch traceability report',
      error: error.message
    });
  }
};

module.exports = {
  getBatchTraceability
};
