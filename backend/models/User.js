const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  role: {
    type: String,
    enum: ['patient', 'hospital_manager', 'receptionist', 'doctor', 'admin'],
    default: 'patient'
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Admin-specific fields
  adminLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: function() {
      return this.role === 'admin' ? 'admin' : undefined;
    }
  },
  permissions: [{
    type: String,
    enum: [
      'verify_hospitals',
      'manage_users', 
      'view_analytics',
      'system_settings',
      'content_management'
    ]
  }],
  // Additional fields for different roles
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  specialization: String, // for doctors
  experience: Number, // for doctors
  employeeId: String, // for hospital staff
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  // Admin activity tracking
  lastLoginAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Set default admin permissions
userSchema.pre('save', function(next) {
  if (this.role === 'admin' && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = ['verify_hospitals', 'manage_users', 'view_analytics'];
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Admin-specific methods
userSchema.methods.hasPermission = function(permission) {
  return this.role === 'admin' && this.permissions.includes(permission);
};

userSchema.methods.isSuperAdmin = function() {
  return this.role === 'admin' && this.adminLevel === 'super_admin';
};

module.exports = mongoose.model('User', userSchema);
