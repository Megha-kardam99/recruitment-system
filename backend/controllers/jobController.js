// backend/controllers/jobController.js
// Handles all job-related operations

const Job = require('../models/Job');
const Application = require('../models/Application');

// ─── @GET /api/jobs ───────────────────────────────────────────────────────────
// Get all jobs with filtering, searching, and pagination
exports.getJobs = async (req, res) => {
  try {
    let query = { status: 'active' };

    // Search by keyword (title, description, skills)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { company: searchRegex }
      ];
    }

    // Filter by location
    if (req.query.location) {
      query.location = new RegExp(req.query.location, 'i');
    }

    // Filter by job type (support comma-separated)
    if (req.query.jobType) {
      const types = req.query.jobType.split(',').map(t => t.trim());
      query.jobType = types.length > 1 ? { $in: types } : types[0];
    }

    // Filter by category (support comma-separated)
    if (req.query.category) {
      const cats = req.query.category.split(',').map(c => c.trim());
      query.category = cats.length > 1 ? { $in: cats } : cats[0];
    }

    // Filter by skills (comma-separated)
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(',').map(s => s.trim().toLowerCase());
      query.skills = { $in: skillsArray };
    }

    // Filter by experience
    if (req.query.minExp) {
      query['experience.min'] = { $lte: parseInt(req.query.minExp) };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sort
    const sort = req.query.sort || '-createdAt';

    const jobs = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      jobs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @GET /api/jobs/:id ───────────────────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email company');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @POST /api/jobs ──────────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    req.body.postedBy = req.user.id;

    // Set company name from HR's profile if not provided
    if (!req.body.company && req.user.company) {
      req.body.company = req.user.company.name;
    }

    // Parse skills to lowercase
    if (req.body.skills) {
      req.body.skills = req.body.skills.map(s => s.trim().toLowerCase());
    }

    const job = await Job.create(req.body);
    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @PUT /api/jobs/:id ───────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Make sure HR owns this job
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job.' });
    }

    if (req.body.skills) {
      req.body.skills = req.body.skills.map(s => s.trim().toLowerCase());
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @DELETE /api/jobs/:id ────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job.' });
    }

    await job.deleteOne();
    // Also delete all applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({ success: true, message: 'Job deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @GET /api/jobs/hr/myjobs ─────────────────────────────────────────────────
// Get jobs posted by the logged-in HR
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @GET /api/jobs/recommend ─────────────────────────────────────────────────
// AI Feature: Recommend jobs based on user's skills
exports.recommendJobs = async (req, res) => {
  try {
    const userSkills = req.user.skills || [];

    if (userSkills.length === 0) {
      return res.status(200).json({ success: true, jobs: [], message: 'Add skills to get recommendations.' });
    }

    // Find jobs that match user skills
    const jobs = await Job.find({
      status: 'active',
      skills: { $in: userSkills }
    }).populate('postedBy', 'name company').limit(10);

    // Calculate match score for each job
    const scoredJobs = jobs.map(job => {
      const jobSkills = job.skills || [];
      const matchedSkills = jobSkills.filter(skill => userSkills.includes(skill));
      const matchScore = jobSkills.length > 0
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0;
      return { ...job.toObject(), matchScore, matchedSkills };
    });

    // Sort by match score descending
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, count: scoredJobs.length, jobs: scoredJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
