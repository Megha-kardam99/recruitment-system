// backend/server.js
// Main Express server entry point

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    database: databaseReady ? 'connected' : 'disconnected',
    message: databaseReady ? 'Recruitment API is running!' : 'Recruitment API is running, but MongoDB is unavailable.',
    timestamp: new Date()
  });
});

// Avoid long Mongoose buffer waits when the database is unavailable.
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Start MongoDB and try again.'
    });
  }
  next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

// ─── Serve Frontend (catch-all for SPA / HTML page routing) ───────────────────
const fs = require('fs');
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const pagePath = path.join(__dirname, '../frontend', `${req.path}.html`);
    if (fs.existsSync(pagePath)) {
      return res.sendFile(pagePath);
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
});
