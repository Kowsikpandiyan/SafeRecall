const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Customer submits a review for a delivered order
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
  try {
    const { orderId, rating, reviewText } = req.body;

    const ratingNum = Number(rating);

    if (!orderId || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5 || !reviewText?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid orderId, rating (1-5 stars), and review text.'
      });
    }

    // 1. Find Order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order record not found.'
      });
    }

    // 2. Verify Customer ownership
    if (order.customerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products from your own purchases.'
      });
    }

    // 3. Verify Order status is DELIVERED or COMPLETED
    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Reviews can only be submitted after the order has been DELIVERED (Current status: ${order.status}).`
      });
    }

    // 4. Check for existing review on this order
    const existingReview = await Review.findOne({ orderId: order._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this purchase.'
      });
    }

    // 5. Create Review
    const review = await Review.create({
      customerId: req.user.id,
      productId: order.productId,
      orderId: order._id,
      shopId: order.shopId,
      batchNo: order.batchNo,
      rating: ratingNum,
      reviewText: reviewText.trim()
    });

    // 6. Recalculate Product average rating & numReviews
    const allReviews = await Review.find({ productId: order.productId });
    const totalRatingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRatingSum / allReviews.length) * 10) / 10;

    await Product.findByIdAndUpdate(order.productId, {
      averageRating: avgRating,
      numReviews: allReviews.length
    });

    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'name email')
      .populate('productId', 'name image batchNo')
      .populate('shopId', 'name');

    return res.status(201).json({
      success: true,
      message: 'Review and rating submitted successfully!',
      review: populatedReview
    });
  } catch (error) {
    console.error('[Create Review Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

// @desc    Get reviews submitted by logged-in Customer
// @route   GET /api/reviews/my-reviews
// @access  Private (Customer)
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user.id })
      .populate('productId', 'name image batchNo price')
      .populate('shopId', 'name email')
      .populate('orderId', 'orderId orderDate')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer reviews'
    });
  }
};

// @desc    Get reviews for a specific Product
// @route   GET /api/reviews/product/:productId
// @access  Public / Authenticated
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate('customerId', 'name')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });

    const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? Math.round((totalRatingSum / reviews.length) * 10) / 10 : 0;

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product reviews'
    });
  }
};

// @desc    Get reviews for products sold by logged-in Shop
// @route   GET /api/reviews/shop
// @access  Private (Shop)
const getShopReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ shopId: req.user.id })
      .populate('customerId', 'name email')
      .populate('productId', 'name image batchNo')
      .populate('orderId', 'orderId orderDate')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shop reviews'
    });
  }
};

// @desc    Get reviews for products manufactured by logged-in Manager
// @route   GET /api/reviews/manager
// @access  Private (Manager)
const getManagerReviews = async (req, res) => {
  try {
    const managerProducts = await Product.find({ managerId: req.user.id }).select('_id');
    const productIds = managerProducts.map((p) => p._id);

    const reviews = await Review.find({ productId: { $in: productIds } })
      .populate('customerId', 'name email')
      .populate('productId', 'name image batchNo')
      .populate('shopId', 'name email')
      .populate('orderId', 'orderId orderDate')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch manager reviews'
    });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getProductReviews,
  getShopReviews,
  getManagerReviews
};
