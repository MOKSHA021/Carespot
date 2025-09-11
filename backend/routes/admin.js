const express = require('express');
const {
  registerAdmin,
  loginAdmin,
  getDashboardStats,
  getPendingHospitals,
  verifyHospital,
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

// Public admin routes
router.post('/login', loginAdmin);

// Protected admin routes
router.use(protect); // All routes below require authentication
router.use(authorize('admin')); // All routes below require admin role

// Dashboard
router.get('/dashboard', getDashboardStats);

// Hospital management
router.get('/hospitals/pending', getPendingHospitals);
router.put('/hospitals/:id/verify', verifyHospital);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Admin management (Super Admin only) - ADD THESE ROUTES
router.post('/create-admin', createAdminUser);
router.get('/my-admins', getMyAdmins);
router.put('/admins/:id/status', updateAdminStatus);
router.delete('/admins/:id', deleteAdminUser);
router.post('/generate-credentials', generateAdminCredentials);

module.exports = router;
