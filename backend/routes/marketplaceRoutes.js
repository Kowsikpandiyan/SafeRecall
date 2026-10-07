const express = require('express');
const router = express.Router();
const { getMarketplaceProducts, getMarketplaceShops } = require('../controllers/marketplaceController');

router.get('/products', getMarketplaceProducts);
router.get('/shops', getMarketplaceShops);

module.exports = router;
