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
// @access  Public (No authentication required)
const registerHospital = async (req, res) => {
  try {
    const {
      hospitalName,
      registrationNumber,
      hospitalType,
      location,
      contactInfo,
      facilities,
      departments,
      bedCount,
      operatingHours,
      partnershipAgreement
    } = req.body;

    // Validate required fields
    if (!hospitalName || !registrationNumber || !hospitalType) {
      return res.status(400).json({ 
        message: 'Hospital name, registration number, and type are required' 
      });
    }

    // Validate required location fields
    if (!location?.address || !location?.city || !location?.state || !location?.pincode) {
      return res.status(400).json({ 
        message: 'Complete address information is required' 
      });
    }

    // Validate required contact fields
    if (!contactInfo?.phone || !contactInfo?.email) {
      return res.status(400).json({ 
        message: 'Phone number and email are required' 
      });
    }

    // Validate departments
    if (!departments || departments.length === 0) {
      return res.status(400).json({ 
        message: 'At least one department must be selected' 
      });
    }

    // Validate partnership agreement
    if (!partnershipAgreement?.accepted) {
      return res.status(400).json({ 
        message: 'Partnership agreement must be accepted' 
      });
    }

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ 
      $or: [
        { registrationNumber },
        { 'contactInfo.email': contactInfo.email }
      ]
    });

    if (existingHospital) {
      return res.status(400).json({ 
        message: 'Hospital with this registration number or email already exists' 
      });
    }

    // ✅ Create hospital without requiring authentication
    const hospital = await Hospital.create({
      hospitalName,
      registrationNumber,
      hospitalType,
      location,
      contactInfo,
      facilities: facilities || [],
      departments: departments || [],
      bedCount,
      operatingHours,
      // ✅ No manager required for public registration
      verificationStatus: 'pending',
      isPartnered: false,
      partnershipAgreement: {
        accepted: partnershipAgreement.accepted,
        acceptedAt: partnershipAgreement.accepted ? new Date() : null,
        termsVersion: '1.0'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Hospital partnership application submitted successfully',
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        registrationNumber: hospital.registrationNumber,
        verificationStatus: hospital.verificationStatus,
        createdAt: hospital.createdAt
      }
    });

  } catch (error) {
    console.error('Hospital registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Hospital with this registration number already exists'
      });
    }

    res.status(500).json({ 
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
      .populate('staff.doctors', 'name email specialization')
      .populate('staff.receptionists', 'name email phone')
      .populate('verificationDetails.verifiedBy', 'name email');

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // ✅ Updated permission check to handle hospitals without managers
    const isManager = hospital.manager && req.user && hospital.manager._id.toString() === req.user._id.toString();
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
    
    if (!isManager && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
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

// @desc    Update hospital information
// @route   PUT /api/hospitals/:id
// @access  Private (Hospital Manager or Admin)
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // ✅ Updated permission check
    const isManager = hospital.manager && req.user && hospital.manager.toString() === req.user._id.toString();
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

    if (!isManager && !isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only hospital manager or admin can update details.' });
    }

    // Don't allow updating certain fields if hospital is already approved (unless admin)
    if (hospital.verificationStatus === 'approved' && !isAdmin) {
      const restrictedFields = ['registrationNumber', 'hospitalName', 'hospitalType'];
      const hasRestrictedUpdates = restrictedFields.some(field => req.body[field]);
      
      if (hasRestrictedUpdates) {
        return res.status(400).json({ 
          message: 'Cannot update core details for approved hospitals. Contact admin for changes.' 
        });
      }
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
        return res.status(404).json({ message: 'Hospital not found' });
      }

      // ✅ Updated permission check
      const isManager = hospital.manager && req.user && hospital.manager.toString() === req.user._id.toString();
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

      if (!isManager && !isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Process uploaded files
      const uploadedDocs = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/hospital_docs/${file.filename}`,
        documentType: req.body.documentType || 'other',
        uploadedAt: new Date()
      }));

      // Add documents to hospital
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
        .select('hospitalName hospitalType location.address location.city contactInfo.phone departments facilities ratings operatingHours')
        .populate('manager', 'name email')
        .sort({ 'ratings.average': -1 })
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
      .populate('staff.doctors', 'name email specialization')
      .populate('staff.receptionists', 'name email');

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // ✅ Updated permission check
    const isManager = hospital.manager && req.user && hospital.manager.toString() === req.user._id.toString();
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

    if (!isManager && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get basic stats
    const stats = {
      verificationStatus: hospital.verificationStatus,
      totalDoctors: hospital.staff?.doctors?.length || 0,
      totalReceptionists: hospital.staff?.receptionists?.length || 0,
      totalBeds: hospital.bedCount?.total || 0,
      availableBeds: hospital.bedCount?.available || 0,
      rating: hospital.ratings?.average || 0,
      totalReviews: hospital.ratings?.count || 0,
      departments: hospital.departments?.length || 0,
      facilities: hospital.facilities?.length || 0
    };

    res.json({
      success: true,
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        verificationStatus: hospital.verificationStatus,
        isPartnered: hospital.isPartnered,
        createdAt: hospital.createdAt
      },
      stats
    });

  } catch (error) {
    console.error('Hospital dashboard error:', error);
    res.status(500).json({ 
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
      return res.status(400).json({ message: 'Manager ID is required' });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Update hospital with manager
    hospital.manager = managerId;
    await hospital.save();

    res.json({
      success: true,
      message: 'Hospital manager assigned successfully',
      hospital
    });

  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({ 
      message: 'Error assigning hospital manager',
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
  assignHospitalManager
};
