const express = require('express');
const router = express.Router();
const { getBatchTraceability } = require('../controllers/traceabilityController');

router.get('/:batchNo', getBatchTraceability);

module.exports = router;
