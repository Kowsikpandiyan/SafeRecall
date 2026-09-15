const Product = require('../models/Product');
const Purchase = require('../models/Purchase');

// @desc    Purchase products from Inventory (e.g. Shop buys 20)
// @route   POST /api/shop/buy
// @access  Private (User / Shop & Admin)
const buyProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const qtyToBuy = Number(quantity);

    if (!productId || isNaN(qtyToBuy) || qtyToBuy <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid productId and positive quantity'
      });
    }

    // 1. Check if product exists in inventory
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in inventory'
      });
    }

    // 2. Verify stock availability
    if (product.stockQuantity < qtyToBuy) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Requested: ${qtyToBuy}, Available: ${product.stockQuantity}`
      });
    }

    // 3. Atomically decrement product stock
    product.stockQuantity -= qtyToBuy;
    await product.save();

    // 4. Create purchase transaction record
    const totalPrice = qtyToBuy * product.price;

    const purchase = await Purchase.create({
      shopUser: req.user.id,
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity: qtyToBuy,
      unitPrice: product.price,
      totalPrice
    });

    return res.status(201).json({
      success: true,
      message: `Successfully purchased ${qtyToBuy} unit(s) of ${product.name}!`,
      purchase,
      remainingStock: product.stockQuantity
    });
  } catch (error) {
    console.error('[Buy Product Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete purchase',
      error: error.message
    });
  }
};

// @desc    Get current Shop owned inventory and purchase history
// @route   GET /api/shop/my-inventory
// @access  Private (User / Shop & Admin)
const getShopInventory = async (req, res) => {
  try {
    // Find all purchases for logged in user/shop
    const purchases = await Purchase.find({ shopUser: req.user.id }).sort({ createdAt: -1 });

    // Aggregate total owned quantities per product SKU
    const ownedSummary = {};
    let totalItemsOwned = 0;
    let totalSpend = 0;

    purchases.forEach((p) => {
      totalItemsOwned += p.quantity;
      totalSpend += p.totalPrice;

      if (!ownedSummary[p.sku]) {
        ownedSummary[p.sku] = {
          productId: p.product,
          sku: p.sku,
          productName: p.productName,
          unitPrice: p.unitPrice,
          totalQuantityOwned: 0,
          totalSpent: 0,
          lastPurchasedAt: p.createdAt
        };
      }

      ownedSummary[p.sku].totalQuantityOwned += p.quantity;
      ownedSummary[p.sku].totalSpent += p.totalPrice;
    });

    const ownedList = Object.values(ownedSummary);

    return res.status(200).json({
      success: true,
      summary: {
        totalItemsOwned,
        totalSpend,
        uniqueProductsCount: ownedList.length
      },
      ownedProducts: ownedList,
      purchaseHistory: purchases
    });
  } catch (error) {
    console.error('[Get Shop Inventory Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve shop inventory',
      error: error.message
    });
  }
};

module.exports = {
  buyProduct,
  getShopInventory
};
