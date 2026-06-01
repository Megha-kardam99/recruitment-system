// backend/controllers/applicationController.js
// Handles job applications

const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// ─── Skill Match Score Calculator ─────────────────────────────────────────────
const calculateMatchScore = (userSkills, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) return 50;
  if (!userSkills || userSkills.length === 0) return 0;

  const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
  const normalizedJob = jobSkills.map(s => s.toLowerCase().trim());

  const matched = normalizedJob.filter(skill => normalizedUser.includes(skill));
  return Math.round((matched.length / normalizedJob.length) * 100);
};

// ─── @POST /api/applications/:jobId ──────────────────────────────────────────
exports.applyForJob = async (req, res) => {
  try {
    const { coverLetter, resume } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications.' });
    }

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, applicant: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
    }

    // Get user skills for match score
    const user = await User.findById(req.user.id);
    const matchScore = calculateMatchScore(user.skills, job.skills);

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      resume: resume || user.resume,
      matchScore
    });

    // Update job's application count
    job.applicationCount += 1;
    await job.save();

    await application.populate('job', 'title company location');
    res.status(201).json({ success: true, application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @GET /api/applications/my ───────────────────────────────────────────────
// Job seeker: get my applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location jobType salary status')
      .sort('-appliedAt');

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @GET /api/applications/job/:jobId ───────────────────────────────────────
// HR: get all applicants for a specific job
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Make sure this HR owns the job
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Filter by skill (query param)
    let query = { job: req.params.jobId };

    const applications = await Application.find(query)
      .populate('applicant', 'name email phone location skills experience education bio resume')
      .sort('-matchScore -appliedAt');

    // Apply skill filter if provided
    let results = applications;
    if (req.query.skill) {
      const filterSkill = req.query.skill.toLowerCase();
      results = applications.filter(app =>
        app.applicant.skills && app.applicant.skills.includes(filterSkill)
      );
    }

    // Apply status filter
    if (req.query.status) {
      results = results.filter(app => app.status === req.query.status);
    }

    res.status(200).json({ success: true, count: results.length, applications: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @PUT /api/applications/:id/status ───────────────────────────────────────
// HR: update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, hrNotes, interview } = req.body;

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Verify HR owns the related job
    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    application.status = status || application.status;
    if (hrNotes) application.hrNotes = hrNotes;
    if (interview) application.interview = interview;

    await application.save();

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @DELETE /api/applications/:id ───────────────────────────────────────────
// Job seeker: withdraw application
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await application.deleteOne();

    // Decrement job's application count
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });

    res.status(200).json({ success: true, message: 'Application withdrawn.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @GET /api/applications/stats ────────────────────────────────────────────
// HR: get application statistics
exports.getHRStats = async (req, res) => {
  try {
    const myJobs = await Job.find({ postedBy: req.user.id });
    const jobIds = myJobs.map(j => j._id);

    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const pending = await Application.countDocuments({ job: { $in: jobIds }, status: 'pending' });
    const shortlisted = await Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' });
    const offered = await Application.countDocuments({ job: { $in: jobIds }, status: 'offered' });
    const rejected = await Application.countDocuments({ job: { $in: jobIds }, status: 'rejected' });

    res.status(200).json({
      success: true,
      stats: {
        totalJobs: myJobs.length,
        activeJobs: myJobs.filter(j => j.status === 'active').length,
        totalApplications,
        pending,
        shortlisted,
        offered,
        rejected
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
