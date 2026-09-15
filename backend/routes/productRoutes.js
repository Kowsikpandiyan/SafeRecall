const express = require('express');
const router = express.Router();
const {
  createProduct,
  getMyProducts,
  getAllManagers,
  getProductsByManager,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Manager'), createProduct);
router.get('/my-products', authorize('Manager'), getMyProducts);
router.get('/managers', getAllManagers);
router.get('/manager/:managerId', getProductsByManager);
router.delete('/:id', authorize('Manager'), deleteProduct);

module.exports = router;
