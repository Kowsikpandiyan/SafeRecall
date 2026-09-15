const express = require('express');
const router = express.Router();
const { getMarketplaceProducts } = require('../controllers/marketplaceController');

router.get('/products', getMarketplaceProducts);

module.exports = router;
