const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getManagerComplaints,
  getSmartRecallAnalysis
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('Customer'), createComplaint);
router.get('/my-complaints', authorize('Customer'), getMyComplaints);
router.get('/manager', authorize('Manager'), getManagerComplaints);
router.get('/smart-recall-analysis', authorize('Manager'), getSmartRecallAnalysis);

module.exports = router;
