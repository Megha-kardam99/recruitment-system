// backend/controllers/authController.js
// Handles registration, login, and profile operations

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ─── Helper: Send token response ─────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj
  });
};

// ─── @POST /api/auth/register ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create user
    const userData = { name, email, password, role };
    if (role === 'hr' && company) {
      userData.company = company;
    }

    const user = await User.create(userData);
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @POST /api/auth/login ────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @GET /api/auth/me ────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @PUT /api/auth/profile ───────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      bio: req.body.bio,
      skills: req.body.skills,
      experience: req.body.experience,
      education: req.body.education,
      company: req.body.company
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @PUT /api/auth/password ──────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @POST /api/auth/save-job/:jobId ─────────────────────────────────────────
exports.saveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.jobId;

    const alreadySaved = user.savedJobs.includes(jobId);
    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
      await user.save();
      return res.status(200).json({ success: true, message: 'Job removed from saved.', saved: false });
    }

    user.savedJobs.push(jobId);
    await user.save();
    res.status(200).json({ success: true, message: 'Job saved!', saved: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
