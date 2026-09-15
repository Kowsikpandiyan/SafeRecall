const express = require('express');
const router = express.Router();
const { getBatchTraceability } = require('../controllers/traceabilityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:batchNo', getBatchTraceability);

module.exports = router;
