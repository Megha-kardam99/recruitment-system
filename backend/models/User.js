// backend/models/User.js
// Mongoose schema for User (both Job Seeker and HR)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['jobseeker', 'hr', 'admin'],
    default: 'jobseeker'
  },

  // Profile Info (for Job Seekers)
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  bio: { type: String, maxlength: 500 },
  
  // Skills (array of strings for matching)
  skills: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  // Experience (years)
  experience: { type: Number, default: 0 },

  // Education
  education: {
    degree: String,
    institution: String,
    year: Number
  },

  // Resume (file path or URL)
  resume: { type: String },

  // Saved Jobs (for Job Seekers)
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],

  // Company Info (for HR users)
  company: {
    name: String,
    website: String,
    description: String,
    logo: String
  },

  // Profile Picture
  avatar: { type: String },

  // Account Status
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now }
});

// ─── Hash password before saving ─────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Method to compare passwords ─────────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
