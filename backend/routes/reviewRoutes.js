const express = require('express');
const router = express.Router();
const {
  createReview,
  getMyReviews,
  getProductReviews,
  getShopReviews,
  getManagerReviews
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/product/:productId', getProductReviews);

router.use(protect);

router.post('/', authorize('Customer'), createReview);
router.get('/my-reviews', authorize('Customer'), getMyReviews);
router.get('/shop', authorize('Shop'), getShopReviews);
router.get('/manager', authorize('Manager'), getManagerReviews);

module.exports = router;
