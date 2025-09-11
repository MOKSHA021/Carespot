const User = require('../models/User');
const Hospital = require('../models/Hospital');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await User.findOne({ 
      email, 
      role: 'admin' 
    }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account is deactivated' });
    }

    const isPasswordCorrect = await admin.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        adminLevel: admin.adminLevel,
        permissions: admin.permissions,
        lastLoginAt: admin.lastLoginAt
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: 'Server error during admin login',
      error: error.message 
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin only
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalHospitals,
      pendingHospitals,
      approvedHospitals,
      totalPatients,
      totalDoctors,
      totalAdmins,
      recentApplications
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ verificationStatus: 'pending' }),
      Hospital.countDocuments({ verificationStatus: 'approved' }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'admin' }),
      Hospital.find({ verificationStatus: 'pending' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('hospitalName location.city createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        hospitals: {
          total: totalHospitals,
          pending: pendingHospitals,
          approved: approvedHospitals,
          rejected: totalHospitals - approvedHospitals - pendingHospitals
        },
        users: {
          patients: totalPatients,
          doctors: totalDoctors,
          admins: totalAdmins
        },
        recentApplications
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
};

// @desc    Get hospitals for verification
// @route   GET /api/admin/hospitals/pending
// @access  Admin only
const getPendingHospitals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const hospitals = await Hospital.find({ 
      verificationStatus: { $in: ['pending', 'under_review'] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('manager', 'name email phone');

    const total = await Hospital.countDocuments({ 
      verificationStatus: { $in: ['pending', 'under_review'] }
    });

    res.json({
      success: true,
      hospitals,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get pending hospitals error:', error);
    res.status(500).json({ 
      message: 'Error fetching pending hospitals',
      error: error.message 
    });
  }
};

// @desc    Enhanced hospital verification with email notifications
// @route   PUT /api/admin/hospitals/:id/verify
// @access  Admin only
const verifyHospital = async (req, res) => {
  try {
    const { status, verificationNotes, rejectionReason, isPartnered } = req.body;
    
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.verificationStatus = status;
    hospital.verificationDetails = {
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      verificationNotes: verificationNotes || '',
      rejectionReason: rejectionReason || ''
    };

    if (status === 'approved') {
      hospital.isPartnered = isPartnered !== undefined ? isPartnered : true;
    }

    await hospital.save();

    // ✅ Send notification emails
    try {
      if (status === 'approved') {
        await sendEmail(
          hospital.contactInfo.email,
          'hospitalApproval',
          {
            hospitalName: hospital.hospitalName,
            verificationNotes: verificationNotes
          }
        );
      } else if (status === 'rejected') {
        await sendEmail(
          hospital.contactInfo.email,
          'hospitalRejection',
          {
            hospitalName: hospital.hospitalName,
            rejectionReason: rejectionReason
          }
        );
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    res.json({
      success: true,
      message: `Hospital ${status} successfully`,
      hospital
    });

  } catch (error) {
    console.error('Verify hospital error:', error);
    res.status(500).json({ 
      message: 'Error updating hospital verification status',
      error: error.message 
    });
  }
};

// @desc    Create hospital manager account with email notification
// @route   POST /api/admin/create-hospital-manager
// @access  Admin only
const createHospitalManager = async (req, res) => {
  try {
    const { name, email, phone, hospitalId, hospitalName } = req.body;

    if (!name || !email || !hospitalId) {
      return res.status(400).json({ 
        message: 'Name, email, and hospital ID are required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Generate secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).slice(-8) + 
                        '!1A';

    const manager = await User.create({
      name,
      email,
      phone,
      password: tempPassword,
      role: 'hospital_manager',
      isActive: true,
      emailVerified: true
    });

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { manager: manager._id },
      { new: true }
    );

    if (!hospital) {
      await User.findByIdAndDelete(manager._id);
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // ✅ Send welcome email to manager
    try {
      await sendEmail(
        manager.email,
        'managerWelcome',
        {
          name: manager.name,
          hospitalName: hospitalName || hospital.hospitalName,
          email: manager.email,
          tempPassword: tempPassword
        }
      );
    } catch (emailError) {
      console.error('Manager welcome email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Hospital manager account created successfully',
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role
      },
      tempPassword: tempPassword
    });

  } catch (error) {
    console.error('Create hospital manager error:', error);
    res.status(500).json({ 
      message: 'Server error creating hospital manager',
      error: error.message 
    });
  }
};

// @desc    Get detailed hospital information for review
// @route   GET /api/admin/hospitals/:id/details
// @access  Admin only
const getHospitalDetailsForReview = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('manager', 'name email phone')
      .populate('verificationDetails.verifiedBy', 'name email');

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({
      success: true,
      hospital
    });

  } catch (error) {
    console.error('Get hospital details error:', error);
    res.status(500).json({ 
      message: 'Error fetching hospital details',
      error: error.message 
    });
  }
};

// Continue with all other existing functions...
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.query.role;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot change your own account status' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      message: 'Error updating user status',
      error: error.message 
    });
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, phone, adminLevel, permissions, dateOfBirth, gender } = req.body;

    if (req.user.adminLevel !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only Super Admins can create admin users.' 
      });
    }

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        message: 'Name, email, password, and phone are required' 
      });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 
          'Admin with this email already exists' : 
          'Admin with this phone number already exists' 
      });
    }

    const validAdminLevels = ['admin', 'moderator'];
    const selectedAdminLevel = adminLevel || 'admin';
    
    if (!validAdminLevels.includes(selectedAdminLevel)) {
      return res.status(400).json({ 
        message: 'Invalid admin level. Must be admin or moderator' 
      });
    }

    const permissionSets = {
      'admin': ['verify_hospitals', 'manage_users', 'view_analytics'],
      'moderator': ['verify_hospitals', 'view_analytics']
    };

    const newAdmin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      adminLevel: selectedAdminLevel,
      permissions: permissions || permissionSets[selectedAdminLevel],
      createdBy: req.user._id,
      dateOfBirth,
      gender,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        adminLevel: newAdmin.adminLevel,
        permissions: newAdmin.permissions,
        createdBy: req.user.name,
        tempPassword: password
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      message: 'Server error creating admin user',
      error: error.message 
    });
  }
};

const getMyAdmins = async (req, res) => {
  try {
    if (req.user.adminLevel !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only Super Admins can view admin users.' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const admins = await User.find({ 
      role: 'admin',
      createdBy: req.user._id
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password')
    .populate('createdBy', 'name email');

    const total = await User.countDocuments({ 
      role: 'admin',
      createdBy: req.user._id
    });

    res.json({
      success: true,
      admins,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get my admins error:', error);
    res.status(500).json({ 
      message: 'Error fetching admin users',
      error: error.message 
    });
  }
};

const updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (req.user.adminLevel !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only Super Admins can update admin status.' 
      });
    }

    const admin = await User.findOne({
      _id: id,
      role: 'admin',
      createdBy: req.user._id
    });

    if (!admin) {
      return res.status(404).json({ 
        message: 'Admin user not found or you do not have permission to modify this user' 
      });
    }

    admin.isActive = isActive;
    await admin.save();

    res.json({
      success: true,
      message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ 
      message: 'Error updating admin status',
      error: error.message 
    });
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.adminLevel !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only Super Admins can delete admin users.' 
      });
    }

    const admin = await User.findOne({
      _id: id,
      role: 'admin',
      createdBy: req.user._id
    });

    if (!admin) {
      return res.status(404).json({ 
        message: 'Admin user not found or you do not have permission to delete this user' 
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ 
      message: 'Error deleting admin user',
      error: error.message 
    });
  }
};

const generateAdminCredentials = async (req, res) => {
  try {
    if (req.user.adminLevel !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Access denied.' 
      });
    }

    const generateRandomString = (length) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const credentials = {
      email: `admin${Date.now()}@carespot.com`,
      password: `Admin${generateRandomString(8)}!`,
      tempUsername: `admin_${generateRandomString(6)}`
    };

    res.json({
      success: true,
      credentials
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating credentials',
      error: error.message 
    });
  }
};

module.exports = {
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
};
