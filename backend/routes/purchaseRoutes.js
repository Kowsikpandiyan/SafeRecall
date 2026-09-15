const express = require('express');
const router = express.Router();
const { buyProduct, getShopInventory } = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All shop purchase routes require authentication
router.use(protect);

router.post('/buy', authorize('user', 'admin'), buyProduct);
router.get('/my-inventory', authorize('user', 'admin'), getShopInventory);

module.exports = router;
