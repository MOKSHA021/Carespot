const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Registration number cannot exceed 50 characters']
  },
  hospitalType: {
    type: String,
    enum: {
      values: ['general', 'specialty', 'clinic', 'emergency', 'teaching', 'multispecialty'],
      message: 'Hospital type must be one of: general, specialty, clinic, emergency, teaching, multispecialty'
    },
    required: [true, 'Hospital type is required'],
    default: 'general'
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    pinCode: {
      type: String,
      required: [true, 'Pin code is required'],
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pin code'],
      default: '000000'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    website: {
      type: String,
      trim: true
    }
  },
  managementInfo: {
    licenseNumber: {
      type: String,
      trim: true
    },
    accreditation: [{
      type: String,
      trim: true
    }],
    establishedYear: {
      type: Number,
      min: [1800, 'Established year cannot be before 1800'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future'],
      default: new Date().getFullYear()
    }
  },
  services: [{
    type: String,
    trim: true
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  departments: [{
    type: String,
    trim: true,
    required: true
  }],
  operatingHours: {
    weekdays: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' }
    },
    weekends: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '16:00' }
    },
    emergency24x7: { 
      type: Boolean, 
      default: false 
    }
  },
  verificationStatus: {
    type: String,
    enum: {
      values: ['pending', 'under_review', 'approved', 'rejected'],
      message: 'Verification status must be one of: pending, under_review, approved, rejected'
    },
    default: 'pending'
  },
  verificationDetails: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,
    rejectionReason: String
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  documents: [{
    filename: String,
    url: String,
    documentType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPartnered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Create indexes for better performance
hospitalSchema.index({ 'location.coordinates': '2dsphere' });
hospitalSchema.index({ verificationStatus: 1, createdAt: -1 });
hospitalSchema.index({ 'location.city': 1, hospitalType: 1 });
hospitalSchema.index({ isPartnered: 1, isActive: 1 });

// ✅ Create sparse unique index for licenseNumber to allow multiple null/undefined values
hospitalSchema.index(
  { 'managementInfo.licenseNumber': 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { 
      'managementInfo.licenseNumber': { 
        $exists: true, 
        $ne: null, 
        $ne: '' 
      } 
    },
    name: 'managementInfo_licenseNumber_partial_unique'
  }
);

// ✅ Pre-save validation for unique fields
hospitalSchema.pre('save', async function(next) {
  // Only check for duplicates if this is a new document or registrationNumber is modified
  if (this.isNew || this.isModified('registrationNumber')) {
    try {
      const existing = await this.constructor.findOne({ 
        registrationNumber: this.registrationNumber,
        _id: { $ne: this._id }
      });
      
      if (existing) {
        const error = new Error(`Hospital with registration number "${this.registrationNumber}" already exists`);
        error.name = 'ValidationError';
        error.errors = {
          registrationNumber: {
            message: `Registration number "${this.registrationNumber}" is already in use`,
            kind: 'unique',
            path: 'registrationNumber',
            value: this.registrationNumber
          }
        };
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
  }
  
  // Check email uniqueness
  if (this.isNew || this.isModified('contactInfo.email')) {
    try {
      const existing = await this.constructor.findOne({ 
        'contactInfo.email': this.contactInfo.email,
        _id: { $ne: this._id }
      });
      
      if (existing) {
        const error = new Error(`Hospital with email "${this.contactInfo.email}" already exists`);
        error.name = 'ValidationError';
        error.errors = {
          'contactInfo.email': {
            message: `Email "${this.contactInfo.email}" is already in use`,
            kind: 'unique', 
            path: 'contactInfo.email',
            value: this.contactInfo.email
          }
        };
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
  }
  
  next();
});

// Update timestamp on save
hospitalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Hospital', hospitalSchema);
