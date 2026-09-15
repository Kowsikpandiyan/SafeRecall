const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Manager creates a new product with Batch Number
// @route   POST /api/products
// @access  Private (Manager)
const createProduct = async (req, res) => {
  try {
    const { name, description, image, price, batchNo, totalQuantity } = req.body;

    if (!name || !price || !batchNo || !totalQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, batchNo, and totalQuantity'
      });
    }

    const qty = Number(totalQuantity);
    const cost = Number(price);

    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total quantity must be greater than 0'
      });
    }

    const formattedBatch = batchNo.trim().toUpperCase();

    // Check if batch number already exists for this manager
    const existing = await Product.findOne({
      managerId: req.user.id,
      batchNo: formattedBatch
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Product with Batch Number '${formattedBatch}' already exists under your catalog.`
      });
    }

    const product = await Product.create({
      name,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
      price: cost,
      batchNo: formattedBatch,
      totalQuantity: qty,
      availableQuantity: qty,
      managerId: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: `Product '${product.name}' created with Batch Number '${product.batchNo}'!`,
      product
    });
  } catch (error) {
    console.error('[Create Product Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// @desc    Get products created by logged in Manager
// @route   GET /api/products/my-products
// @access  Private (Manager)
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ managerId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch manager products',
      error: error.message
    });
  }
};

// @desc    Get list of registered Managers (for Shop selection)
// @route   GET /api/products/managers
// @access  Private (Shop, Customer, Manager)
const getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'Manager' }).select('name email phone address createdAt');

    return res.status(200).json({
      success: true,
      count: managers.length,
      managers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch managers list'
    });
  }
};

// @desc    Get products supplied by a specific Manager
// @route   GET /api/products/manager/:managerId
// @access  Private (Shop, Customer, Manager)
const getProductsByManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const products = await Product.find({ managerId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products for this manager'
    });
  }
};

// @desc    Delete manager product
// @route   DELETE /api/products/:id
// @access  Private (Manager)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.managerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete another manager\'s product'
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Product removed from catalog'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  getAllManagers,
  getProductsByManager,
  deleteProduct
};
