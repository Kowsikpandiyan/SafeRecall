const express = require('express');
const router = express.Router();
const { createOrder, updateOrderStatus, getMyOrders, getShopOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Customer'), createOrder);
router.patch('/:id/status', authorize('Shop'), updateOrderStatus);
router.get('/my-orders', authorize('Customer'), getMyOrders);
router.get('/shop-orders', authorize('Shop'), getShopOrders);

module.exports = router;
