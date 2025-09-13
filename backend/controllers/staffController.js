const StaffMember = require('../models/StaffMember');
const Hospital = require('../models/Hospital');

// @desc    Create new staff member (DOCTORS + RECEPTIONISTS)
// @route   POST /api/staff
// @access  Hospital Manager, Admin
const createStaffMember = async (req, res) => {
  try {
    const {
      hospital,
      role,
      firstName,
      lastName,
      email,
      phone,
      specialization,
      qualifications,
      experienceYears,
      licenseNumber,
      department,
      availability,
      workingHours,
      salary,
      consultationFee,
      languages
    } = req.body;

    // ✅ VALIDATE ALLOWED ROLES
    if (!['doctor', 'receptionist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Only doctors and receptionists can be added as staff. Doctors for patient consultations and receptionists for appointment management.'
      });
    }

    // ✅ ROLE-SPECIFIC VALIDATION
    if (role === 'doctor') {
      if (!specialization || !qualifications || !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'Specialization, qualifications, and license number are required for doctors'
        });
      }
    }

    if (role === 'receptionist') {
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department is required for receptionists'
        });
      }
    }

    // Validate required fields
    if (!hospital || !firstName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Hospital, firstName, email, and phone are required'
      });
    }

    // Check if hospital exists and user has permission
    const hospitalDoc = await Hospital.findById(hospital);
    if (!hospitalDoc) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // For hospital managers, ensure they can only add staff to their own hospital
    if (req.user.role === 'hospital_manager') {
      if (!hospitalDoc.manager || hospitalDoc.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: `You can only add ${role}s to your own hospital`
        });
      }
    }

    // Check if email already exists
    const existingStaff = await StaffMember.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} with this email already exists`
      });
    }

    // ✅ PREPARE STAFF DATA BASED ON ROLE
    const staffData = {
      hospital,
      role,
      firstName,
      lastName,
      email,
      phone,
      experienceYears: experienceYears || 0,
      department: department || (role === 'receptionist' ? 'Reception' : 'General Medicine'),
      salary,
      languages: languages || ['English', 'Hindi'],
      createdBy: req.user._id
    };

    // ✅ ADD ROLE-SPECIFIC FIELDS
    if (role === 'doctor') {
      staffData.specialization = specialization;
      staffData.qualifications = qualifications;
      staffData.licenseNumber = licenseNumber;
      staffData.consultationFee = consultationFee || 500;
      staffData.availability = availability || [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: true }
      ];
    }

    if (role === 'receptionist') {
      staffData.workingHours = workingHours || {
        startTime: '08:00',
        endTime: '18:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      };
    }

    // Create staff member
    const staffMember = await StaffMember.create(staffData);

    // Populate hospital details
    await staffMember.populate('hospital', 'hospitalName');

    const successMessage = role === 'doctor' 
      ? 'Doctor added successfully and is now available for patient consultations'
      : 'Receptionist added successfully and can now manage appointments';

    res.status(201).json({
      success: true,
      message: successMessage,
      staff: staffMember
    });

  } catch (error) {
    console.error(`Create ${req.body.role || 'staff'} error:`, error);
    res.status(500).json({
      success: false,
      message: `Server error creating ${req.body.role || 'staff member'}`,
      error: error.message
    });
  }
};

// @desc    Get all staff for a hospital (BOTH ROLES)
// @route   GET /api/staff/hospital/:hospitalId
// @access  Hospital Manager, Admin, Doctor
const getStaffByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { role, specialization, active = 'true' } = req.query;

    // ✅ QUERY BOTH DOCTORS AND RECEPTIONISTS
    const query = { 
      hospital: hospitalId,
      isActive: active === 'true'
    };

    // Filter by role if specified
    if (role && ['doctor', 'receptionist'].includes(role)) {
      query.role = role;
    }

    // Filter by specialization (for doctors)
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const staff = await StaffMember.find(query)
      .populate('hospital', 'hospitalName location')
      .sort({ role: 1, firstName: 1 });

    // ✅ GROUP BY ROLE AND SPECIALIZATION
    const groupedStaff = staff.reduce((acc, member) => {
      // Group by role first
      if (!acc[member.role]) {
        acc[member.role] = [];
      }
      acc[member.role].push(member);

      // For doctors, also group by specialization
      if (member.role === 'doctor' && member.specialization) {
        const specKey = `specialization_${member.specialization}`;
        if (!acc[specKey]) {
          acc[specKey] = [];
        }
        acc[specKey].push(member);
      }

      return acc;
    }, {});

    // ✅ GET ROLE STATISTICS
    const stats = {
      total: staff.length,
      doctors: staff.filter(s => s.role === 'doctor').length,
      receptionists: staff.filter(s => s.role === 'receptionist').length,
      bySpecialization: {}
    };

    // Count by specialization for doctors
    staff.filter(s => s.role === 'doctor').forEach(doctor => {
      const spec = doctor.specialization || 'General Medicine';
      stats.bySpecialization[spec] = (stats.bySpecialization[spec] || 0) + 1;
    });

    res.json({
      success: true,
      staff,
      groupedStaff,
      stats,
      count: staff.length,
      message: `Found ${stats.doctors} doctors and ${stats.receptionists} receptionists`
    });

  } catch (error) {
    console.error('Get staff by hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching staff',
      error: error.message
    });
  }
};

// @desc    Get staff member by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staffMember = await StaffMember.findOne({
      _id: id,
      role: { $in: ['doctor', 'receptionist'] } // ✅ Allow both roles
    })
      .populate('hospital', 'hospitalName location contactInfo')
      .populate('createdBy', 'name email');

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      staff: staffMember
    });

  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching staff member',
      error: error.message
    });
  }
};

// @desc    Update staff member
const updateStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const staffMember = await StaffMember.findOne({
      _id: id,
      role: { $in: ['doctor', 'receptionist'] } // ✅ Allow both roles
    });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // For hospital managers, ensure they can only update staff from their hospital
    if (req.user.role === 'hospital_manager') {
      const hospital = await Hospital.findById(staffMember.hospital);
      if (!hospital.manager || hospital.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update staff from your own hospital'
        });
      }
    }

    // ✅ PREVENT CRITICAL FIELD CHANGES
    delete updates.hospital;
    delete updates.email;
    delete updates.role; // Prevent role changes

    // Update staff member
    Object.assign(staffMember, updates);
    await staffMember.save();

    await staffMember.populate('hospital', 'hospitalName');

    res.json({
      success: true,
      message: `${staffMember.role.charAt(0).toUpperCase() + staffMember.role.slice(1)} updated successfully`,
      staff: staffMember
    });

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating staff member',
      error: error.message
    });
  }
};

// @desc    Delete (deactivate) staff member
const deleteStaffMember = async (req, res) => {
  try {
    const { id } = req.params;

    const staffMember = await StaffMember.findOne({
      _id: id,
      role: { $in: ['doctor', 'receptionist'] } // ✅ Allow both roles
    });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // For hospital managers, ensure they can only delete staff from their hospital
    if (req.user.role === 'hospital_manager') {
      const hospital = await Hospital.findById(staffMember.hospital);
      if (!hospital.manager || hospital.manager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only remove staff from your own hospital'
        });
      }
    }

    // Soft delete by setting isActive to false
    staffMember.isActive = false;
    await staffMember.save();

    const message = staffMember.role === 'doctor' 
      ? 'Doctor removed successfully. They are no longer available for patient consultations.'
      : 'Receptionist removed successfully. They can no longer manage appointments.';

    res.json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing staff member',
      error: error.message
    });
  }
};

// ✅ NEW: Get staff by role
const getStaffByRole = async (req, res) => {
  try {
    const { hospitalId, role } = req.params;

    if (!['doctor', 'receptionist'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either doctor or receptionist'
      });
    }

    const staff = await StaffMember.find({
      hospital: hospitalId,
      role: role,
      isActive: true,
      isAvailableForWork: true
    })
    .populate('hospital', 'hospitalName')
    .sort({ firstName: 1 });

    const message = role === 'doctor' 
      ? `Found ${staff.length} doctors available for consultation`
      : `Found ${staff.length} receptionists available for appointment management`;

    res.json({
      success: true,
      staff,
      count: staff.length,
      message: message
    });

  } catch (error) {
    console.error('Get staff by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching staff by role',
      error: error.message
    });
  }
};

// Keep availability update function
const updateStaffAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability, workingHours } = req.body;

    const staffMember = await StaffMember.findOne({
      _id: id,
      role: { $in: ['doctor', 'receptionist'] }
    });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // ✅ UPDATE AVAILABILITY BASED ON ROLE
    if (staffMember.role === 'doctor' && availability) {
      staffMember.availability = availability;
    } else if (staffMember.role === 'receptionist' && workingHours) {
      staffMember.workingHours = workingHours;
    }

    await staffMember.save();

    const message = staffMember.role === 'doctor' 
      ? 'Doctor availability updated successfully'
      : 'Receptionist working hours updated successfully';

    res.json({
      success: true,
      message: message,
      staff: staffMember
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating availability',
      error: error.message
    });
  }
};

module.exports = {
  createStaffMember,
  getStaffByHospital,
  getStaffById,
  updateStaffMember,
  deleteStaffMember,
  getStaffByRole,
  updateStaffAvailability
};
