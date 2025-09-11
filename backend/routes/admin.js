const express = require('express');
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

// Public admin routes
router.post('/login', loginAdmin);

// Protected admin routes
router.use(protect); // All routes below require authentication
router.use(authorize('admin')); // All routes below require admin role

// Dashboard
router.get('/dashboard', getDashboardStats);

// Hospital management
router.get('/hospitals/pending', getPendingHospitals);
router.get('/hospitals/:id/details', getHospitalDetailsForReview);
router.put('/hospitals/:id/verify', verifyHospital);
router.post('/create-hospital-manager', createHospitalManager);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Admin management (Super Admin only)
router.post('/create-admin', authorize('super_admin'), createAdminUser);
router.get('/my-admins', authorize('super_admin'), getMyAdmins);
router.put('/admins/:id/status', authorize('super_admin'), updateAdminStatus);
router.delete('/admins/:id', authorize('super_admin'), deleteAdminUser);
router.post('/generate-credentials', authorize('super_admin'), generateAdminCredentials);

module.exports = router;
