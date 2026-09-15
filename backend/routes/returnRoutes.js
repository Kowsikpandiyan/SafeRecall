const express = require('express');
const router = express.Router();
const {
  customerRequestReturn,
  shopRespondReturn,
  shopReturnToManager,
  managerReceiveReturn,
  getReturnRequests
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/customer', authorize('Customer'), customerRequestReturn);
router.patch('/shop/:returnId', authorize('Shop'), shopRespondReturn);
router.post('/shop-to-manager', authorize('Shop'), shopReturnToManager);
router.patch('/manager/:returnId', authorize('Manager'), managerReceiveReturn);
router.get('/', getReturnRequests);

module.exports = router;
