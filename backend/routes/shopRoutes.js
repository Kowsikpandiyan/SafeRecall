const express = require('express');
const router = express.Router();
const {
  purchaseFromManager,
  getShopInventory,
  getShopPurchases,
  getShopsSuppliedByManager
} = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/purchases', authorize('Shop'), purchaseFromManager);
router.get('/inventory', authorize('Shop'), getShopInventory);
router.get('/purchases', authorize('Shop'), getShopPurchases);
router.get('/manager-purchasers', authorize('Manager'), getShopsSuppliedByManager);

module.exports = router;
