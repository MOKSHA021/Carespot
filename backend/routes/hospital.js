const express = require('express');
const {
  registerHospital,
  getHospitalDetails,
  updateHospital,
  uploadHospitalDocuments,
  searchHospitals,
  getHospitalDashboard,
  assignHospitalManager,
  getMyHospital,
  getAllHospitals
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ✅ Public routes (NO authentication required)
router.get('/search', searchHospitals);
router.post('/register', registerHospital);

// ✅ Protected routes (authentication required)
router.use(protect);

// ✅ Admin routes
router.get('/', authorize('admin'), getAllHospitals);

// ✅ Hospital manager routes
router.get('/my-hospital', authorize('hospital_manager'), getMyHospital);

// ✅ Hospital management routes (require authentication)
router.get('/:id', getHospitalDetails);
router.put('/:id', updateHospital);
router.post('/:id/documents', uploadHospitalDocuments);
router.get('/:id/dashboard', getHospitalDashboard);

// ✅ Admin only routes
router.put('/:id/assign-manager', authorize('admin'), assignHospitalManager);

module.exports = router;
