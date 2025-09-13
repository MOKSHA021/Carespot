const User = require('../models/User');
const Hospital = require('../models/Hospital');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

// ===================================================================
// ENHANCED LOGIN - Supports both admins and hospital managers
// ===================================================================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Login attempt for:', email);

    // ✅ VALIDATE: Check if email and password are provided
    if (!email || !password) {
      console.log('❌ Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ 
        success: false,
        message: 'Please provide both email and password' 
      });
    }

    // ✅ VALIDATE: Ensure password is a string
    if (typeof password !== 'string' || password.trim().length === 0) {
      console.log('❌ Invalid password type or empty:', typeof password);
      return res.status(400).json({ 
        success: false,
        message: 'Password must be a valid non-empty string' 
      });
    }

    // ✅ FIXED: Allow both admin and hospital_manager roles
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      role: { $in: ['admin', 'super_admin', 'hospital_manager'] },
      isActive: true
    }).select('+password').populate('hospitalId');
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials or account not authorized' 
      });
    }

    // ✅ CRITICAL FIX: Check if stored password exists
    if (!user.password || typeof user.password !== 'string') {
      console.log('❌ User has no valid password set:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Account configuration error. Please contact support.' 
      });
    }

    console.log('🔍 Password validation:', {
      providedPasswordType: typeof password,
      storedPasswordType: typeof user.password,
      providedPasswordLength: password.length,
      storedPasswordLength: user.password.length
    });

    // ✅ SAFE PASSWORD COMPARISON with try-catch
    let isPasswordCorrect = false;
    try {
      if (user.comparePassword && typeof user.comparePassword === 'function') {
        isPasswordCorrect = await user.comparePassword(password);
      } else {
        // Direct bcrypt comparison with validation
        if (!password || !user.password) {
          throw new Error('Missing password parameters for comparison');
        }
        isPasswordCorrect = await bcrypt.compare(password, user.password);
      }
    } catch (bcryptError) {
      console.error('❌ Bcrypt comparison error:', bcryptError);
      return res.status(500).json({ 
        success: false,
        message: 'Password verification error. Please try again.' 
      });
    }
    
    if (!isPasswordCorrect) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Login successful for:', email, 'Role:', user.role);

    // ✅ ENHANCED: Return appropriate response based on role
    const responseData = {
      success: true,
      message: `${user.role === 'hospital_manager' ? 'Hospital manager' : 'Admin'} login successful`,
      token
    };

    if (user.role === 'hospital_manager') {
      responseData.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospitalId: user.hospitalId?._id,
        hospitalName: user.hospitalId?.hospitalName,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      };
    } else {
      responseData.admin = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        adminLevel: user.adminLevel,
        permissions: user.permissions,
        lastLoginAt: user.lastLoginAt
      };
    }

    res.json(responseData);

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// @desc    Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalHospitals,
      pendingHospitals,
      approvedHospitals,
      totalPatients,
      totalDoctors,
      totalAdmins,
      totalHospitalManagers,
      recentApplications
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ verificationStatus: 'pending' }),
      Hospital.countDocuments({ verificationStatus: 'approved' }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
      User.countDocuments({ role: 'hospital_manager' }),
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
          admins: totalAdmins,
          hospitalManagers: totalHospitalManagers
        },
        recentApplications
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
};

// @desc    Get hospitals for verification
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
      success: false,
      message: 'Error fetching pending hospitals',
      error: error.message 
    });
  }
};

// ✅ ENHANCED: Complete automated approval workflow
const verifyHospital = async (req, res) => {
  try {
    const { status, verificationNotes, rejectionReason, isPartnered } = req.body;
    
    console.log('🏥 Hospital verification request:', { 
      hospitalId: req.params.id, 
      status,
      adminId: req.user._id 
    });
    
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        message: 'Hospital not found' 
      });
    }

    // Update hospital verification status
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

    // ✅ AUTOMATED WORKFLOW: If approved, create manager and send credentials
    if (status === 'approved') {
      try {
        console.log('🔄 Starting automated approval workflow...');
        
        // 1. Create hospital manager account automatically
        const managerCredentials = await createHospitalManagerAccount(hospital, req.user._id);
        
        console.log('✅ Manager account created:', managerCredentials.email);

        // 2. Send approval email (if email service exists)
        try {
          if (sendEmail && typeof sendEmail === 'function') {
            await sendEmail(
              hospital.contactInfo.email,
              'hospitalApproval',
              {
                hospitalName: hospital.hospitalName,
                verificationNotes: verificationNotes
              }
            );
            console.log('✅ Approval email sent');
          }
        } catch (emailError) {
          console.error('📧 Approval email failed:', emailError);
        }

        // 3. Send manager welcome email with credentials
        try {
          if (sendEmail && typeof sendEmail === 'function') {
            await sendEmail(
              hospital.contactInfo.email,
              'managerWelcome',
              {
                name: hospital.hospitalName + ' Manager',
                hospitalName: hospital.hospitalName,
                email: hospital.contactInfo.email,
                tempPassword: managerCredentials.tempPassword
              }
            );
            console.log('✅ Manager credentials email sent');
          }
        } catch (emailError) {
          console.error('📧 Manager credentials email failed:', emailError);
        }

        console.log(`✅ Hospital ${hospital.hospitalName} approved successfully`);

        res.json({
          success: true,
          message: `Hospital approved successfully! Manager credentials sent to ${hospital.contactInfo.email}`,
          hospital,
          managerCreated: true,
          managerEmail: hospital.contactInfo.email,
          // 🔧 DEBUG: Include credentials for testing (REMOVE IN PRODUCTION)
          debugCredentials: process.env.NODE_ENV === 'development' ? {
            email: managerCredentials.email,
            password: managerCredentials.tempPassword
          } : undefined
        });

      } catch (automationError) {
        console.error('❌ Approval automation error:', automationError);
        
        res.json({
          success: true,
          message: `Hospital approved, but there was an issue with automation: ${automationError.message}`,
          hospital,
          managerCreated: false,
          automationError: automationError.message
        });
      }

    } else if (status === 'rejected') {
      // Send rejection email
      try {
        if (sendEmail && typeof sendEmail === 'function') {
          await sendEmail(
            hospital.contactInfo.email,
            'hospitalRejection',
            {
              hospitalName: hospital.hospitalName,
              rejectionReason: rejectionReason
            }
          );
          console.log('✅ Rejection email sent');
        }
      } catch (emailError) {
        console.error('📧 Rejection email failed:', emailError);
      }

      res.json({
        success: true,
        message: `Hospital rejected successfully`,
        hospital
      });
    } else {
      res.json({
        success: true,
        message: `Hospital status updated to ${status}`,
        hospital
      });
    }

  } catch (error) {
    console.error('❌ Verify hospital error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating hospital verification status',
      error: error.message 
    });
  }
};

// ✅ ENHANCED: Safe hospital manager creation with password validation
const createHospitalManagerAccount = async (hospital, createdByAdminId) => {
  try {
    console.log('🔄 Creating hospital manager account for:', hospital.hospitalName);

    // Validate hospital object
    if (!hospital || !hospital.contactInfo || !hospital.contactInfo.email) {
      throw new Error('Invalid hospital data - missing contact email');
    }

    // Check if manager already exists
    const existingManager = await User.findOne({ 
      email: hospital.contactInfo.email,
      role: 'hospital_manager'
    });

    if (existingManager) {
      console.log('ℹ️ Manager account already exists, updating hospital reference');
      
      existingManager.hospitalId = hospital._id;
      await existingManager.save();
      
      await Hospital.findByIdAndUpdate(hospital._id, {
        manager: existingManager._id
      });

      return {
        managerId: existingManager._id,
        email: existingManager.email,
        tempPassword: 'EXISTING_ACCOUNT'
      };
    }

    // Generate secure temporary password
    const tempPassword = generateSecurePassword();

    // ✅ VALIDATE: Ensure password is generated correctly
    if (!tempPassword || typeof tempPassword !== 'string' || tempPassword.length < 8) {
      throw new Error('Failed to generate secure password');
    }

    console.log('🔐 Generated password details:', {
      type: typeof tempPassword,
      length: tempPassword.length,
      hasUppercase: /[A-Z]/.test(tempPassword),
      hasLowercase: /[a-z]/.test(tempPassword),
      hasNumbers: /\d/.test(tempPassword),
      hasSymbols: /[!@#$%^&*]/.test(tempPassword)
    });

    // ✅ SAFE: Hash password with validation
    let hashedPassword;
    try {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
      
      if (!hashedPassword) {
        throw new Error('Password hashing returned empty result');
      }
      
      console.log('✅ Password hashed successfully, length:', hashedPassword.length);
    } catch (hashError) {
      console.error('❌ Password hashing error:', hashError);
      throw new Error(`Password hashing failed: ${hashError.message}`);
    }

    // Create new hospital manager with validation
    const managerData = {
      name: `${hospital.hospitalName} Manager`,
      email: hospital.contactInfo.email,
      phone: hospital.contactInfo.phone || '0000000000',
      password: hashedPassword,
      role: 'hospital_manager',
      hospitalId: hospital._id,
      isActive: true,
      emailVerified: true,
      mustChangePassword: true,
      createdBy: createdByAdminId,
      lastLoginAt: null
    };

    // ✅ VALIDATE: Check all required fields
    const requiredFields = ['name', 'email', 'password', 'role', 'hospitalId'];
    for (const field of requiredFields) {
      if (!managerData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const manager = await User.create(managerData);

    // Update hospital with manager reference
    await Hospital.findByIdAndUpdate(hospital._id, {
      manager: manager._id
    });

    console.log(`✅ Manager account created: ${manager.email} for hospital: ${hospital.hospitalName}`);

    return {
      managerId: manager._id,
      email: manager.email,
      tempPassword: tempPassword
    };

  } catch (error) {
    console.error('❌ Create hospital manager account error:', error);
    throw new Error(`Failed to create manager account: ${error.message}`);
  }
};

// ✅ ENHANCED: More secure password generation
const generateSecurePassword = () => {
  try {
    const length = 12;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    let password = "";
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill remaining characters
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // ✅ VALIDATE: Ensure password meets requirements
    if (shuffled.length < 8 || 
        !/[A-Z]/.test(shuffled) || 
        !/[a-z]/.test(shuffled) || 
        !/\d/.test(shuffled) || 
        !/[!@#$%^&*]/.test(shuffled)) {
      console.warn('🔄 Generated password failed validation, retrying...');
      return generateSecurePassword(); // Retry if validation fails
    }
    
    return shuffled;
  } catch (error) {
    console.error('Password generation error:', error);
    // Fallback simple password
    return `TempPass${Date.now()}!`;
  }
};

// @desc    Create hospital manager account manually
const createHospitalManager = async (req, res) => {
  try {
    const { name, email, phone, hospitalId, hospitalName } = req.body;

    if (!name || !email || !hospitalId) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and hospital ID are required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    const tempPassword = generateSecurePassword();
    
    if (!tempPassword || typeof tempPassword !== 'string') {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to generate secure password' 
      });
    }

    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const manager = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'hospital_manager',
      hospitalId,
      isActive: true,
      emailVerified: true,
      mustChangePassword: true,
      createdBy: req.user._id
    });

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { manager: manager._id },
      { new: true }
    );

    if (!hospital) {
      await User.findByIdAndDelete(manager._id);
      return res.status(404).json({ 
        success: false,
        message: 'Hospital not found' 
      });
    }

    // Send welcome email if service exists
    try {
      if (sendEmail && typeof sendEmail === 'function') {
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
      }
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
        role: manager.role,
        hospitalId: manager.hospitalId
      },
      tempPassword: tempPassword
    });

  } catch (error) {
    console.error('Create hospital manager error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating hospital manager',
      error: error.message 
    });
  }
};

// Simplified versions of other functions (keep your existing implementations)
const getHospitalDetailsForReview = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('manager', 'name email phone')
      .populate('verificationDetails.verifiedBy', 'name email');

    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        message: 'Hospital not found' 
      });
    }

    res.json({
      success: true,
      hospital
    });

  } catch (error) {
    console.error('Get hospital details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching hospital details',
      error: error.message 
    });
  }
};

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
      .select('-password')
      .populate('hospitalId', 'hospitalName');

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
      success: false,
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
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot change your own account status' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user status',
      error: error.message 
    });
  }
};

// Placeholder functions for remaining exports
const createAdminUser = async (req, res) => {
  res.json({ success: false, message: 'Not implemented yet' });
};

const getMyAdmins = async (req, res) => {
  res.json({ success: false, message: 'Not implemented yet' });
};

const updateAdminStatus = async (req, res) => {
  res.json({ success: false, message: 'Not implemented yet' });
};

const deleteAdminUser = async (req, res) => {
  res.json({ success: false, message: 'Not implemented yet' });
};

const generateAdminCredentials = async (req, res) => {
  try {
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
      success: false,
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
