const Hospital = require('../models/Hospital');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/hospital_docs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Register hospital partnership
// @route   POST /api/hospitals/register
// @access  Public
const registerHospital = async (req, res) => {
  try {
    console.log('🏥 Hospital registration attempt');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

    const {
      hospitalName,
      registrationNumber,
      hospitalType,
      location,
      contactInfo,
      facilities,
      departments,
      services,
      operatingHours,
      licenseNumber,
      accreditation,
      establishedYear
    } = req.body;

    // ✅ Validate required fields
    if (!hospitalName || !hospitalName.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Hospital name is required',
        field: 'hospitalName'
      });
    }

    if (!registrationNumber || !registrationNumber.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Registration number is required',
        field: 'registrationNumber'
      });
    }

    if (!location?.address || !location?.city || !location?.state) {
      return res.status(400).json({ 
        success: false,
        message: 'Complete address (address, city, state) is required',
        field: 'location'
      });
    }

    if (!contactInfo?.phone || !contactInfo?.email) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number and email are required',
        field: 'contactInfo'
      });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        field: 'email'
      });
    }

    // ✅ Validate phone format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contactInfo.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number',
        field: 'phone'
      });
    }

    // ✅ Check for existing hospitals
    const existingHospital = await Hospital.findOne({ 
      $or: [
        { registrationNumber: registrationNumber.trim() },
        { 'contactInfo.email': contactInfo.email.toLowerCase() }
      ]
    });

    if (existingHospital) {
      return res.status(400).json({ 
        success: false,
        message: existingHospital.registrationNumber === registrationNumber.trim()
          ? `Hospital with registration number "${registrationNumber.trim()}" already exists`
          : `Hospital with email "${contactInfo.email}" already exists`,
        field: existingHospital.registrationNumber === registrationNumber.trim() ? 'registrationNumber' : 'email'
      });
    }

    // ✅ Build managementInfo carefully
    const managementInfo = {
      accreditation: accreditation || [],
      establishedYear: establishedYear || new Date().getFullYear()
    };

    // ✅ ONLY add licenseNumber if it has a meaningful value
    if (licenseNumber && typeof licenseNumber === 'string' && licenseNumber.trim() !== '') {
      managementInfo.licenseNumber = licenseNumber.trim();
    }

    // ✅ Prepare hospital data
    const hospitalData = {
      hospitalName: hospitalName.trim(),
      registrationNumber: registrationNumber.trim(),
      hospitalType: hospitalType || 'general',
      location: {
        address: location.address.trim(),
        city: location.city.trim(),
        state: location.state.trim(),
        pinCode: location.pinCode || location.pincode || '000000',
        coordinates: {
          type: 'Point',
          coordinates: [0, 0]
        }
      },
      contactInfo: {
        phone: contactInfo.phone.trim(),
        email: contactInfo.email.toLowerCase().trim(),
        website: contactInfo.website?.trim() || ''
      },
      managementInfo,
      services: services || [],
      facilities: facilities || [],
      departments: departments && departments.length > 0 ? departments : ['general'],
      operatingHours: operatingHours || {
        weekdays: { open: '08:00', close: '18:00' },
        weekends: { open: '09:00', close: '16:00' },
        emergency24x7: false
      },
      verificationStatus: 'pending',
      isActive: true,
      isPartnered: false
    };

    console.log('🏗️ Creating hospital with data:', JSON.stringify(hospitalData, null, 2));

    // ✅ Create hospital
    const hospital = await Hospital.create(hospitalData);

    console.log('✅ Hospital created successfully:', hospital._id);

    res.status(201).json({
      success: true,
      message: 'Hospital partnership application submitted successfully! You will receive an email notification once reviewed.',
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        registrationNumber: hospital.registrationNumber,
        verificationStatus: hospital.verificationStatus,
        createdAt: hospital.createdAt
      }
    });

  } catch (error) {
    console.error('🚨 Hospital registration error:', error);
    
    // ✅ Enhanced error handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // ✅ Handle duplicate key errors with specific messages
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[duplicateField];
      
      console.log('🔍 Duplicate key details:', { 
        duplicateField, 
        duplicateValue, 
        errorKeyValue: error.keyValue 
      });
      
      if (duplicateField === 'registrationNumber') {
        return res.status(400).json({ 
          success: false,
          message: `Hospital with registration number "${duplicateValue}" already exists. Please use a different registration number.`,
          field: 'registrationNumber',
          duplicateValue: duplicateValue
        });
      }
      
      if (duplicateField === 'contactInfo.email') {
        return res.status(400).json({ 
          success: false,
          message: `Hospital with email "${duplicateValue}" already exists. Please use a different email address.`,
          field: 'email',
          duplicateValue: duplicateValue
        });
      }
      
      if (duplicateField === 'managementInfo.licenseNumber') {
        return res.status(400).json({ 
          success: false,
          message: `Hospital with license number "${duplicateValue}" already exists. Please use a different license number or leave it blank.`,
          field: 'licenseNumber',
          duplicateValue: duplicateValue
        });
      }
      
      return res.status(400).json({ 
        success: false,
        message: `Duplicate value detected for ${duplicateField}: "${duplicateValue}"`,
        field: duplicateField,
        duplicateValue: duplicateValue
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error during hospital registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get hospital details
// @route   GET /api/hospitals/:id
// @access  Private
const getHospitalDetails = async (req, res) => {
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

// @desc    Update hospital information
// @route   PUT /api/hospitals/:id
// @access  Private (Hospital Manager or Admin)
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        message: 'Hospital not found' 
      });
    }

    // Check permissions
    const isManager = hospital.manager && req.user && hospital.manager.toString() === req.user._id.toString();
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

    if (!isManager && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only hospital manager or admin can update details.' 
      });
    }

    // Update hospital details
    Object.assign(hospital, req.body);
    await hospital.save();

    res.json({
      success: true,
      message: 'Hospital information updated successfully',
      hospital
    });

  } catch (error) {
    console.error('Update hospital error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating hospital information',
      error: error.message 
    });
  }
};

// @desc    Upload hospital documents
// @route   POST /api/hospitals/:id/documents
// @access  Private (Hospital Manager or Admin)
const uploadHospitalDocuments = [
  upload.array('documents', 10),
  async (req, res) => {
    try {
      const hospital = await Hospital.findById(req.params.id);

      if (!hospital) {
        return res.status(404).json({ 
          success: false,
          message: 'Hospital not found' 
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'No files uploaded' 
        });
      }

      const uploadedDocs = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/hospital_docs/${file.filename}`,
        documentType: req.body.documentType || 'other',
        uploadedAt: new Date()
      }));

      if (!hospital.documents) {
        hospital.documents = [];
      }
      hospital.documents.push(...uploadedDocs);
      await hospital.save();

      res.json({
        success: true,
        message: 'Documents uploaded successfully',
        documents: uploadedDocs
      });

    } catch (error) {
      console.error('Upload documents error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error uploading documents',
        error: error.message 
      });
    }
  }
];

// @desc    Get hospitals by city/location
// @route   GET /api/hospitals/search
// @access  Public
const searchHospitals = async (req, res) => {
  try {
    const { city, department, type, latitude, longitude, radius = 10 } = req.query;
    
    let filter = { 
      verificationStatus: 'approved',
      isPartnered: true,
      isActive: true 
    };

    // Filter by city
    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    // Filter by department
    if (department) {
      filter.departments = { $in: [department] };
    }

    // Filter by hospital type
    if (type) {
      filter.hospitalType = type;
    }

    let hospitals;

    // Location-based search
    if (latitude && longitude) {
      hospitals = await Hospital.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: 'distance',
            maxDistance: radius * 1000, // Convert km to meters
            spherical: true,
            query: filter
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'manager',
            foreignField: '_id',
            as: 'manager'
          }
        },
        {
          $project: {
            hospitalName: 1,
            hospitalType: 1,
            'location.address': 1,
            'location.city': 1,
            'contactInfo.phone': 1,
            departments: 1,
            facilities: 1,
            ratings: 1,
            distance: { $round: [{ $divide: ['$distance', 1000] }, 2] },
            operatingHours: 1
          }
        }
      ]);
    } else {
      hospitals = await Hospital.find(filter)
        .select('hospitalName hospitalType location.address location.city contactInfo.phone departments facilities operatingHours')
        .populate('manager', 'name email')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });

  } catch (error) {
    console.error('Search hospitals error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching hospitals',
      error: error.message 
    });
  }
};

// @desc    Get hospital dashboard stats
// @route   GET /api/hospitals/:id/dashboard
// @access  Private (Hospital Manager or Admin)
const getHospitalDashboard = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('manager', 'name email phone');

    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        message: 'Hospital not found' 
      });
    }

    // Check permissions
    const isManager = hospital.manager && req.user && hospital.manager._id.toString() === req.user._id.toString();
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

    if (!isManager && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    // Get basic stats
    const stats = {
      verificationStatus: hospital.verificationStatus,
      isPartnered: hospital.isPartnered,
      departments: hospital.departments?.length || 0,
      facilities: hospital.facilities?.length || 0,
      services: hospital.services?.length || 0,
      documentsCount: hospital.documents?.length || 0,
      lastUpdated: hospital.updatedAt
    };

    res.json({
      success: true,
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        hospitalType: hospital.hospitalType,
        verificationStatus: hospital.verificationStatus,
        isPartnered: hospital.isPartnered,
        location: hospital.location,
        contactInfo: hospital.contactInfo,
        operatingHours: hospital.operatingHours,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt
      },
      stats
    });

  } catch (error) {
    console.error('Hospital dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message 
    });
  }
};

// @desc    Assign manager to hospital (Admin only)
// @route   PUT /api/hospitals/:id/assign-manager
// @access  Private (Admin only)
const assignHospitalManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    
    if (!managerId) {
      return res.status(400).json({ 
        success: false,
        message: 'Manager ID is required' 
      });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        message: 'Hospital not found' 
      });
    }

    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ 
        success: false,
        message: 'Manager not found' 
      });
    }

    if (manager.role !== 'hospital_manager') {
      return res.status(400).json({ 
        success: false,
        message: 'User must have hospital_manager role' 
      });
    }

    // Update hospital with manager
    hospital.manager = managerId;
    await hospital.save();

    // Update manager with hospital reference
    manager.hospitalId = hospital._id;
    await manager.save();

    res.json({
      success: true,
      message: 'Hospital manager assigned successfully',
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        manager: {
          _id: manager._id,
          name: manager.name,
          email: manager.email,
          phone: manager.phone
        }
      }
    });

  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error assigning hospital manager',
      error: error.message 
    });
  }
};

// @desc    Get my hospital (for hospital managers)
// @route   GET /api/hospitals/my-hospital
// @access  Private (Hospital Manager only)
const getMyHospital = async (req, res) => {
  try {
    if (req.user.role !== 'hospital_manager') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only hospital managers can access this route.' 
      });
    }

    const hospital = await Hospital.findOne({ manager: req.user._id })
      .populate('manager', 'name email phone')
      .populate('verificationDetails.verifiedBy', 'name email');

    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        message: 'No hospital assigned to your account. Please contact admin.' 
      });
    }

    res.json({
      success: true,
      hospital
    });

  } catch (error) {
    console.error('Get my hospital error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching hospital information',
      error: error.message 
    });
  }
};

// @desc    Get all hospitals (Admin only)
// @route   GET /api/hospitals
// @access  Private (Admin only)
const getAllHospitals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status && status !== 'all') {
      filter.verificationStatus = status;
    }

    const hospitals = await Hospital.find(filter)
      .populate('manager', 'name email phone')
      .populate('verificationDetails.verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Hospital.countDocuments(filter);

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
    console.error('Get all hospitals error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching hospitals',
      error: error.message 
    });
  }
};

module.exports = {
  registerHospital,
  getHospitalDetails,
  updateHospital,
  uploadHospitalDocuments,
  searchHospitals,
  getHospitalDashboard,
  assignHospitalManager,
  getMyHospital,
  getAllHospitals
};
