const ShopInventory = require('../models/ShopInventory');

// @desc    Get products available in Shop inventories for Customer Marketplace
// @route   GET /api/marketplace/products
// @access  Public / Private (Customer, Shop, Manager)
const getMarketplaceProducts = async (req, res) => {
  try {
    const { search, shopId, minPrice, maxPrice } = req.query;

    const query = { availableQuantity: { $gt: 0 } };

    if (shopId) {
      query.shopId = shopId;
    }

    let items = await ShopInventory.find(query)
      .populate('productId', 'name description image price batchNo category')
      .populate('shopId', 'name email phone address')
      .populate('managerId', 'name email')
      .sort({ updatedAt: -1 });

    // Client-side / In-memory query filtering for high performance
    if (search) {
      const term = search.toLowerCase();
      items = items.filter((item) => {
        const pName = item.productId?.name?.toLowerCase() || '';
        const bNo = item.batchNo?.toLowerCase() || '';
        const sName = item.shopId?.name?.toLowerCase() || '';
        return pName.includes(term) || bNo.includes(term) || sName.includes(term);
      });
    }

    if (minPrice) {
      items = items.filter((item) => item.unitPrice >= Number(minPrice));
    }
    if (maxPrice) {
      items = items.filter((item) => item.unitPrice <= Number(maxPrice));
    }

    return res.status(200).json({
      success: true,
      count: items.length,
      marketplaceItems: items
    });
  } catch (error) {
    console.error('[Marketplace Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load marketplace products',
      error: error.message
    });
  }
};

module.exports = {
  getMarketplaceProducts
};
