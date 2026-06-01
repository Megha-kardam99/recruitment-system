// backend/routes/applications.js
const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
  getHRStats
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// Job seeker routes
router.post('/:jobId', protect, authorize('jobseeker'), applyForJob);
router.get('/my/applications', protect, authorize('jobseeker'), getMyApplications);
router.delete('/:id', protect, authorize('jobseeker'), withdrawApplication);

// HR routes
router.get('/job/:jobId', protect, authorize('hr', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('hr', 'admin'), updateApplicationStatus);
router.get('/hr/stats', protect, authorize('hr', 'admin'), getHRStats);

module.exports = router;
