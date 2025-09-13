const express = require('express');
const bcrypt = require('bcryptjs');
const {
  loginAdmin,
  getDashboardStats,
  getPendingHospitals,
  verifyHospital,
  createHospitalManager,
  getHospitalDetailsForReview,
  getAllUsers,
  toggleUserStatus,
  createAdminUser,
  getMyAdmins,
  updateAdminStatus,
  deleteAdminUser,
  generateAdminCredentials
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ===================================================================
// PUBLIC ROUTES
// ===================================================================
router.post('/login', loginAdmin);

// ✅ ENHANCED DEBUG ROUTES with safe bcrypt handling
router.get('/debug/hospital-managers', async (req, res) => {
  try {
    const User = require('../models/User');
    const managers = await User.find({ role: 'hospital_manager' })
      .populate('hospitalId', 'hospitalName')
      .select('-password');

    res.json({
      success: true,
      count: managers.length,
      managers: managers.map(m => ({
        id: m._id,
        name: m.name,
        email: m.email,
        role: m.role,
        hospitalId: m.hospitalId?._id,
        hospitalName: m.hospitalId?.hospitalName,
        isActive: m.isActive,
        hasPassword: !!m.password,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ SAFE TEST LOGIN with proper error handling
router.post('/debug/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = require('../models/User');
    
    // Validate input
    if (!email || !password) {
      return res.json({ 
        success: false, 
        message: 'Email and password are required for testing',
        inputValidation: {
          emailProvided: !!email,
          passwordProvided: !!password,
          emailType: typeof email,
          passwordType: typeof password
        }
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).populate('hospitalId').select('+password');
    
    if (!user) {
      return res.json({ 
        success: false, 
        message: `No user found with email: ${email}`,
        userExists: false,
        searchedEmail: email.toLowerCase().trim()
      });
    }

    // ✅ SAFE: Check password existence before bcrypt comparison
    let passwordMatch = false;
    let passwordError = null;
    
    if (!user.password) {
      passwordError = 'User has no password set in database';
    } else if (typeof password !== 'string' || password.length === 0) {
      passwordError = 'Provided password is invalid';
    } else if (typeof user.password !== 'string') {
      passwordError = 'Stored password format is invalid';
    } else {
      try {
        passwordMatch = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        passwordError = `Bcrypt error: ${bcryptError.message}`;
        console.error('Bcrypt comparison error:', bcryptError);
      }
    }
    
    res.json({
      success: true,
      userExists: true,
      userRole: user.role,
      userActive: user.isActive,
      passwordMatch: passwordMatch,
      passwordError: passwordError,
      hospitalInfo: user.hospitalId ? {
        id: user.hospitalId._id,
        name: user.hospitalId.hospitalName
      } : null,
      debug: {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        hasStoredPassword: !!user.password,
        storedPasswordLength: user.password?.length,
        storedPasswordType: typeof user.password,
        providedPasswordLength: password?.length,
        providedPasswordType: typeof password,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Debug test error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===================================================================
// PROTECTED ROUTES
// ===================================================================
router.use(protect); // All routes below require authentication
router.use(authorize('admin', 'super_admin', 'hospital_manager')); // Allow hospital managers too

// Dashboard
router.get('/dashboard', getDashboardStats);

// Hospital management
router.get('/hospitals/pending', authorize('admin', 'super_admin'), getPendingHospitals);
router.get('/hospitals/:id/details', authorize('admin', 'super_admin'), getHospitalDetailsForReview);
router.put('/hospitals/:id/verify', authorize('admin', 'super_admin'), verifyHospital);
router.post('/create-hospital-manager', authorize('admin', 'super_admin'), createHospitalManager);

// User management
router.get('/users', authorize('admin', 'super_admin'), getAllUsers);
router.put('/users/:id/toggle-status', authorize('admin', 'super_admin'), toggleUserStatus);

// Admin management (Super Admin only)
router.post('/create-admin', authorize('super_admin'), createAdminUser);
router.get('/my-admins', authorize('super_admin'), getMyAdmins);
router.put('/admins/:id/status', authorize('super_admin'), updateAdminStatus);
router.delete('/admins/:id', authorize('super_admin'), deleteAdminUser);
router.post('/generate-credentials', authorize('super_admin'), generateAdminCredentials);

module.exports = router;
