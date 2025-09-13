// ✅ Load environment variables FIRST
require('dotenv').config();

// ✅ Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ MISSING');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET (' + process.env.EMAIL_PASS.length + ' chars)' : '❌ MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ MISSING');
console.log('PORT:', process.env.PORT || '❌ MISSING');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ MISSING');

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const hospitalRoutes = require('./routes/hospital');
const staffRoutes = require('./routes/staff');

const app = express();

// ✅ Connect to database
connectDB();

// ✅ Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/staff', staffRoutes);

// ✅ Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    let emailStatus = 'Not configured';
    try {
      if (process.env.EMAIL_FROM && process.env.EMAIL_PASS) {
        const { testConnection } = require('./utils/emailService');
        const emailWorking = await testConnection();
        emailStatus = emailWorking ? 'Working' : 'Configuration error';
      }
    } catch (error) {
      emailStatus = 'Service unavailable';
    }

    res.json({ 
      message: 'Carespot API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        email: emailStatus,
        uploads: 'Available'
      },
      endpoints: {
        auth: '/api/auth',
        admin: '/api/admin',
        hospitals: '/api/hospitals',
        staff: '/api/staff',
        health: '/api/health'
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ✅ Email test endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASS) {
      return res.json({ 
        success: false,
        emailConfigured: false,
        message: 'Email credentials not found in environment variables'
      });
    }

    const { testConnection } = require('./utils/emailService');
    const isWorking = await testConnection();
    
    res.json({ 
      success: true,
      emailConfigured: isWorking,
      emailFrom: process.env.EMAIL_FROM,
      message: isWorking ? 'Email system is working!' : 'Email configuration needs attention'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      emailConfigured: false,
      error: error.message,
      message: 'Email service unavailable'
    });
  }
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log('🎉 ============================================');
  console.log('🚀 CARESPOT HEALTHCARE PLATFORM API');
  console.log('🎉 ============================================');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   🛡️  Admin: http://localhost:${PORT}/api/admin`);
  console.log(`   🏥 Hospitals: http://localhost:${PORT}/api/hospitals`);
  console.log(`   👥 Staff: http://localhost:${PORT}/api/staff`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🎯 Ready to serve requests!');
  console.log('🎉 ============================================');
});

module.exports = app;
