const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const staffController = require('../controllers/staffController');

// ✅ ENHANCED VALIDATION MIDDLEWARE
const validateStaffCreation = [
  // Validate role
  body('role')
    .isIn(['doctor', 'receptionist'])
    .withMessage('Role must be either doctor or receptionist'),

  // Common validations
  body('hospital').notEmpty().withMessage('Hospital is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'),
  body('department').notEmpty().withMessage('Department is required'),

  // ✅ CONDITIONAL VALIDATION FOR DOCTORS
  body('specialization')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Specialization is required for doctors'),
  
  body('qualifications')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Medical qualifications are required for doctors'),
  
  body('licenseNumber')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Medical license number is required for doctors'),

  // ✅ CONDITIONAL VALIDATION FOR RECEPTIONISTS
  body('department')
    .if(body('role').equals('receptionist'))
    .isIn(['Reception', 'Administration'])
    .withMessage('Receptionists must be in Reception or Administration department'),

  // Process validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Apply authentication middleware to all routes
router.use(protect);

// ✅ CREATE STAFF (DOCTORS + RECEPTIONISTS)
router.post(
  '/', 
  authorize('hospital_manager', 'admin'),
  validateStaffCreation,
  staffController.createStaffMember
);

// Get all staff for a hospital
router.get('/hospital/:hospitalId', staffController.getStaffByHospital);

// Get staff by role
router.get('/hospital/:hospitalId/role/:role', staffController.getStaffByRole);

// Get staff member by ID
router.get('/:id', staffController.getStaffById);

// Update staff member
router.put(
  '/:id', 
  authorize('hospital_manager', 'admin'),
  staffController.updateStaffMember
);

// Delete (deactivate) staff member
router.delete(
  '/:id', 
  authorize('hospital_manager', 'admin'),
  staffController.deleteStaffMember
);

// Update staff availability/working hours
router.put('/:id/availability', staffController.updateStaffAvailability);

module.exports = router;
