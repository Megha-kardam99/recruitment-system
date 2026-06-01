// backend/routes/jobs.js
const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  recommendJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes
router.get('/hr/myjobs', protect, authorize('hr', 'admin'), getMyJobs);
router.get('/user/recommend', protect, authorize('jobseeker'), recommendJobs);
router.post('/', protect, authorize('hr', 'admin'), createJob);
router.put('/:id', protect, authorize('hr', 'admin'), updateJob);
router.delete('/:id', protect, authorize('hr', 'admin'), deleteJob);

module.exports = router;
