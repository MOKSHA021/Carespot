// ✅ Load environment variables FIRST - before any other imports
require('dotenv').config();

// ✅ CRITICAL: Debug environment variables immediately after dotenv loads
console.log('🔍 Environment Variables Debug:');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ MISSING');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET (' + process.env.EMAIL_PASS.length + ' chars)' : '❌ MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ MISSING');
console.log('PORT:', process.env.PORT || '❌ MISSING');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ MISSING');

// Now import other modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const hospitalRoutes = require('./routes/hospital');

// ✅ Connect to database
connectDB();

// ✅ Test email configuration on startup
const testEmailConfig = async () => {
  try {
    // Only test if email credentials are available
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email credentials missing - skipping email test');
      return;
    }

    const { testConnection } = require('./utils/emailService');
    const isWorking = await testConnection();
    
    if (isWorking) {
      console.log('✅ Email server ready to send messages');
      console.log(`📧 Email configured: ${process.env.EMAIL_FROM}`);
    } else {
      console.log('❌ Email configuration failed');
      console.log('🔧 Please check your SMTP settings in .env file');
    }
  } catch (error) {
    console.log('❌ Email service not available:', error.message);
    console.log('📧 Email functionality will be disabled');
  }
};

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);

// ✅ Email testing endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    // Check if email credentials are available
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASS) {
      return res.json({ 
        success: false,
        emailConfigured: false,
        emailFrom: 'Not configured',
        message: 'Email credentials not found in environment variables'
      });
    }

    const { testConnection } = require('./utils/emailService');
    const isWorking = await testConnection();
    
    res.json({ 
      success: true,
      emailConfigured: isWorking,
      emailFrom: process.env.EMAIL_FROM || 'Not configured',
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: process.env.SMTP_PORT || '587',
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

// ✅ Send test email endpoint (for debugging)
app.post('/api/send-test-email', async (req, res) => {
  try {
    // Check if email credentials are available
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASS) {
      return res.status(400).json({ 
        success: false,
        message: 'Email not configured - missing EMAIL_FROM or EMAIL_PASS in environment variables'
      });
    }

    const { sendEmail } = require('./utils/emailService');
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email recipient (to) is required' 
      });
    }

    const result = await sendEmail(
      to,
      'managerWelcome',
      {
        name: 'Test User',
        hospitalName: 'Test Hospital',
        email: to,
        tempPassword: 'Test123!@#'
      }
    );

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Failed to send test email',
      messageId: result.messageId,
      error: result.error
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// Health check route
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
        health: '/api/health',
        emailTest: '/api/test-email'
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

// ✅ Environment variables check endpoint (development only)
app.get('/api/env-check', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Environment check only available in development mode' });
  }

  res.json({
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    frontendUrl: process.env.FRONTEND_URL,
    mongoConnected: !!process.env.MONGODB_URI,
    emailConfigured: !!(process.env.EMAIL_FROM && process.env.EMAIL_PASS),
    jwtConfigured: !!process.env.JWT_SECRET,
    emailSettings: {
      from: process.env.EMAIL_FROM ? '✅ Configured' : '❌ Missing',
      pass: process.env.EMAIL_PASS ? '✅ Configured' : '❌ Missing',
      host: process.env.SMTP_HOST || 'Not set (defaults to smtp.gmail.com)',
      port: process.env.SMTP_PORT || 'Not set (defaults to 587)'
    },
    allEnvVariables: {
      EMAIL_FROM: process.env.EMAIL_FROM || 'UNDEFINED',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET (' + process.env.EMAIL_PASS.length + ' chars)' : 'UNDEFINED',
      NODE_ENV: process.env.NODE_ENV || 'UNDEFINED',
      PORT: process.env.PORT || 'UNDEFINED',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'UNDEFINED',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'UNDEFINED',
      FRONTEND_URL: process.env.FRONTEND_URL || 'UNDEFINED'
    }
  });
});

// ✅ Debug endpoint to check .env file loading
app.get('/api/debug-env', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Debug endpoint only available in development mode' });
  }

  // Try to reload dotenv to see if there are issues
  const result = require('dotenv').config();
  
  res.json({
    message: 'Environment debugging information',
    dotenvResult: result,
    processEnv: {
      EMAIL_FROM: process.env.EMAIL_FROM || 'MISSING',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'PRESENT' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'MISSING'
    },
    workingDirectory: process.cwd(),
    envFilePath: '.env',
    nodeVersion: process.version
  });
});

// Error handling middleware
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

// ✅ 404 handler - Using middleware without path
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'GET /api/test-email',
      'GET /api/env-check',
      'GET /api/debug-env',
      'POST /api/send-test-email',
      'POST /api/auth/*',
      'GET /api/admin/*',
      'GET /api/hospitals/*'
    ]
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
  console.log(`   ❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`   📧 Email Test: http://localhost:${PORT}/api/test-email`);
  console.log(`   🐛 Environment Check: http://localhost:${PORT}/api/env-check`);
  console.log(`   🔍 Debug Environment: http://localhost:${PORT}/api/debug-env`);
  console.log('');
  console.log('🔧 System Status:');
  console.log(`   📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   🗃️  Database: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   🔑 JWT: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Not configured'}`);
  
  // Test email configuration
  console.log('');
  console.log('📧 Email Configuration:');
  if (process.env.EMAIL_FROM && process.env.EMAIL_PASS) {
    console.log(`   📤 From: ${process.env.EMAIL_FROM}`);
    console.log(`   🔐 Pass: [${process.env.EMAIL_PASS.length} characters] ${process.env.EMAIL_PASS.substring(0, 4)}...`);
    console.log(`   🌐 SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com (default)'}`);
    console.log(`   🔌 SMTP Port: ${process.env.SMTP_PORT || '587 (default)'}`);
    console.log('   🧪 Testing email connection...');
    await testEmailConfig();
  } else {
    console.log('   ❌ Email not configured');
    console.log('   💡 Missing environment variables:');
    console.log(`       EMAIL_FROM: ${process.env.EMAIL_FROM ? '✅' : '❌'}`);
    console.log(`       EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅' : '❌'}`);
    console.log('   🔧 Add EMAIL_FROM and EMAIL_PASS to .env file');
  }
  
  console.log('');
  console.log('🎯 Ready to serve requests!');
  console.log('🎉 ============================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  console.log('🛑 Shutting down server due to unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.log('🛑 Shutting down server due to uncaught exception');
  process.exit(1);
});

module.exports = app;
