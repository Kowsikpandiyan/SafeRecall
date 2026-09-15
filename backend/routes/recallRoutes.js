const express = require('express');
const router = express.Router();
const { createRecall, getRecalls } = require('../controllers/recallController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Manager'), createRecall);
router.get('/', getRecalls);

module.exports = router;
