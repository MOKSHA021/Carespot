const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true
  },
  hospitalType: {
    type: String,
    enum: ['General Hospital', 'Multi-specialty Hospital', 'Specialized Hospital', 'Clinic', 'Laboratory', 'Diagnostic Center'],
    required: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: String,
    emergencyNumber: String
  },
  documents: [{
    filename: String,
    url: String,
    documentType: {
      type: String,
      enum: ['license', 'certificate', 'noc', 'other'],
      default: 'other'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  facilities: [{
    type: String,
    enum: [
      'Emergency Care',
      'ICU',
      'Operation Theater',
      'X-Ray',
      'CT Scan',
      'MRI',
      'Laboratory',
      'Pharmacy',
      'Blood Bank',
      'Dialysis',
      'Maternity Ward',
      'Pediatric Care'
    ]
  }],
  departments: [{
    type: String,
    enum: [
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Gynecology',
      'Dermatology',
      'Ophthalmology',
      'ENT',
      'Psychiatry',
      'General Surgery',
      'Internal Medicine',
      'Radiology',
      'Emergency Medicine'
    ],
    required: true
  }],
  bedCount: {
    total: {
      type: Number,
      min: 0
    },
    available: {
      type: Number,
      min: 0
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationDetails: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String,
    verificationNotes: String
  },
  isPartnered: {
    type: Boolean,
    default: false
  },
  partnershipLevel: {
    type: String,
    enum: ['basic', 'premium', 'exclusive'],
    default: 'basic'
  },
  // ✅ Manager is now optional for public registration
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  staff: {
    doctors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    receptionists: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  operatingHours: {
    monday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    tuesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    wednesday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    thursday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    friday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '18:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    saturday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '14:00' }, 
      isOpen: { type: Boolean, default: true } 
    },
    sunday: { 
      open: { type: String, default: '10:00' }, 
      close: { type: String, default: '14:00' }, 
      isOpen: { type: Boolean, default: false } 
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  partnershipAgreement: {
    accepted: {
      type: Boolean,
      required: true,
      default: false
    },
    acceptedAt: Date,
    termsVersion: String
  }
}, {
  timestamps: true
});

// Index for location-based searches
hospitalSchema.index({ 'location.coordinates': '2dsphere' });
hospitalSchema.index({ verificationStatus: 1 });
hospitalSchema.index({ isPartnered: 1 });
hospitalSchema.index({ 'location.city': 1 });
hospitalSchema.index({ departments: 1 });
hospitalSchema.index({ registrationNumber: 1 });
hospitalSchema.index({ 'contactInfo.email': 1 });

// Virtual for partnership status
hospitalSchema.virtual('isApprovedPartner').get(function() {
  return this.verificationStatus === 'approved' && this.isPartnered;
});

// Pre-save middleware to validate bed count
hospitalSchema.pre('save', function(next) {
  if (this.bedCount && this.bedCount.available > this.bedCount.total) {
    next(new Error('Available beds cannot exceed total beds'));
  }
  next();
});

module.exports = mongoose.model('Hospital', hospitalSchema);
