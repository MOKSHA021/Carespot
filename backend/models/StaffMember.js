const mongoose = require('mongoose');

const staffMemberSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  role: {
    type: String,
    enum: ['doctor', 'receptionist'], // ✅ ALLOW BOTH ROLES
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  
  // ✅ DOCTOR-SPECIFIC FIELDS (conditional)
  specialization: {
    type: String,
    trim: true,
    enum: [
      'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
      'Gynecology', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology',
      'Surgery', 'Oncology', 'Gastroenterology', 'Pulmonology', 'Nephrology',
      'Endocrinology', 'Ophthalmology', 'ENT', 'Urology'
    ]
  },
  qualifications: {
    type: String,
    trim: true
  },
  licenseNumber: {
    type: String,
    trim: true,
    sparse: true // Allow multiple null values, but unique non-null values
  },
  consultationFee: {
    type: Number,
    min: [0, 'Consultation fee cannot be negative'],
    default: 0
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],

  // ✅ RECEPTIONIST-SPECIFIC FIELDS
  workingHours: {
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '18:00'
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },
  
  // ✅ COMMON FIELDS
  experienceYears: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years'],
    default: 0
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    enum: [
      'Reception', 'Emergency', 'Internal Medicine', 'Surgery', 'Pediatrics',
      'Obstetrics & Gynecology', 'Orthopedics', 'Cardiology', 'Neurology',
      'Radiology', 'Pathology', 'Anesthesiology', 'Oncology', 'Dermatology',
      'Psychiatry', 'Ophthalmology', 'ENT', 'Urology', 'General Medicine',
      'Administration'
    ]
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  profileImage: {
    type: String,
    default: null
  },
  languages: [{
    type: String,
    trim: true
  }],
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailableForWork: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// ✅ CONDITIONAL VALIDATION MIDDLEWARE
staffMemberSchema.pre('save', function(next) {
  // Doctor-specific validations
  if (this.role === 'doctor') {
    if (!this.specialization) {
      return next(new Error('Specialization is required for doctors'));
    }
    if (!this.qualifications) {
      return next(new Error('Medical qualifications are required for doctors'));
    }
    if (!this.licenseNumber) {
      return next(new Error('Medical license number is required for doctors'));
    }
  }
  
  // Receptionist-specific validations
  if (this.role === 'receptionist') {
    if (this.department !== 'Reception' && this.department !== 'Administration') {
      // Allow receptionists in Reception or Administration departments
      this.department = 'Reception';
    }
    // Set default working hours if not provided
    if (!this.workingHours.workingDays || this.workingHours.workingDays.length === 0) {
      this.workingHours.workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }
  }
  
  next();
});

// ✅ INDEXES FOR PERFORMANCE
staffMemberSchema.index({ hospital: 1, role: 1 });
staffMemberSchema.index({ hospital: 1, isActive: 1 });
staffMemberSchema.index({ email: 1 });
staffMemberSchema.index({ licenseNumber: 1 }, { sparse: true });

// ✅ VIRTUAL FIELDS
staffMemberSchema.virtual('fullName').get(function() {
  const title = this.role === 'doctor' ? 'Dr.' : '';
  return `${title} ${this.firstName} ${this.lastName || ''}`.trim();
});

staffMemberSchema.virtual('displayTitle').get(function() {
  if (this.role === 'doctor') {
    return `Dr. ${this.firstName} ${this.lastName || ''} - ${this.specialization}`;
  } else {
    return `${this.firstName} ${this.lastName || ''} - ${this.role.charAt(0).toUpperCase() + this.role.slice(1)}`;
  }
});

// ✅ STATIC METHODS
staffMemberSchema.statics.findByRole = function(hospitalId, role) {
  return this.find({
    hospital: hospitalId,
    role: role,
    isActive: true,
    isAvailableForWork: true
  }).sort({ firstName: 1 });
};

staffMemberSchema.statics.findDoctorsBySpecialization = function(hospitalId, specialization) {
  return this.find({
    hospital: hospitalId,
    role: 'doctor',
    specialization: { $regex: specialization, $options: 'i' },
    isActive: true,
    isAvailableForWork: true
  }).sort({ firstName: 1 });
};

// ✅ INSTANCE METHODS
staffMemberSchema.methods.isAvailableOnDay = function(day) {
  if (this.role === 'doctor') {
    const dayAvailability = this.availability.find(a => a.day === day);
    return dayAvailability && dayAvailability.isAvailable;
  } else if (this.role === 'receptionist') {
    return this.workingHours.workingDays.includes(day);
  }
  return false;
};

// Ensure virtuals are included in JSON
staffMemberSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StaffMember', staffMemberSchema);
