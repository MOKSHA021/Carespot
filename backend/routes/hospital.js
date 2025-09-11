const express = require('express');
const {
  registerHospital,
  getHospitalDetails,
  updateHospital,
  uploadHospitalDocuments,
  searchHospitals,
  getHospitalDashboard,
  assignHospitalManager
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ✅ Public routes (NO authentication required)
router.get('/search', searchHospitals);
router.post('/register', registerHospital);  // ✅ Public hospital registration

// ✅ Protected routes (authentication required)
router.use(protect);

// Hospital management routes (requires authentication)
router.get('/:id', getHospitalDetails);
router.put('/:id', updateHospital);
router.post('/:id/documents', uploadHospitalDocuments);
router.get('/:id/dashboard', getHospitalDashboard);

// Admin only routes
router.put('/:id/assign-manager', authorize('admin', 'super_admin'), assignHospitalManager);

module.exports = router;
