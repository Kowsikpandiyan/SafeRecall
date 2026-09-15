const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getShopOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Customer'), createOrder);
router.get('/my-orders', authorize('Customer'), getMyOrders);
router.get('/shop-orders', authorize('Shop'), getShopOrders);

module.exports = router;
