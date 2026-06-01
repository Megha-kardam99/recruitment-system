// backend/models/Job.js
// Mongoose schema for Job Listings

const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  company: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true
  },
  companyLogo: { type: String },

  description: {
    type: String,
    required: [true, 'Please provide job description'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },

  // Required skills (used for matching)
  skills: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  location: {
    type: String,
    required: [true, 'Please provide job location'],
    trim: true
  },

  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    required: true,
    default: 'full-time'
  },

  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' },
    period: { type: String, enum: ['monthly', 'yearly', 'hourly'], default: 'yearly' }
  },

  experience: {
    min: { type: Number, default: 0 }, // years
    max: { type: Number, default: 10 }
  },

  education: { type: String }, // e.g., "Bachelor's Degree"

  responsibilities: [String], // List of responsibilities
  benefits: [String],         // List of benefits

  // HR who posted the job
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Application deadline
  deadline: { type: Date },

  // Number of openings
  openings: { type: Number, default: 1 },

  // Job status
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },

  // Category/Department
  category: {
    type: String,
    enum: ['technology', 'marketing', 'finance', 'hr', 'operations', 'design', 'sales', 'other'],
    default: 'other'
  },

  // View count
  views: { type: Number, default: 0 },

  // Application count (cached)
  applicationCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
JobSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Text index for search
JobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });

module.exports = mongoose.model('Job', JobSchema);
