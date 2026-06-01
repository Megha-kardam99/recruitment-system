// backend/models/Application.js
// Mongoose schema for Job Applications

const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // Which job was applied to
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  // Who applied
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Cover letter / message
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },

  // Resume (can be updated per application)
  resume: { type: String },

  // Application status
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'],
    default: 'pending'
  },

  // HR notes (internal, not visible to applicant)
  hrNotes: { type: String },

  // Skill match score (0–100, computed by backend)
  matchScore: { type: Number, default: 0 },

  // Interview details
  interview: {
    date: Date,
    type: { type: String, enum: ['phone', 'video', 'in-person'] },
    notes: String
  },

  // Timestamps
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate applications
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

ApplicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
