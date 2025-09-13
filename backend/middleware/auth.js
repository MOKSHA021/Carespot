const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token (using decoded.userId to match your token structure)
      req.user = await User.findById(decoded.userId).select('-password').populate('hospitalId');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'Account is deactivated' 
        });
      }

      // Add additional user info for convenience
      req.user.userId = req.user._id;
      req.user.hospitalName = req.user.hospitalId?.hospitalName;

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired' 
        });
      }
      
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

// ✅ Enhanced role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    // Convert roles to lowercase for consistent comparison
    const normalizedRoles = roles.map(role => role.toLowerCase());
    const userRole = req.user?.role?.toLowerCase();

    if (!req.user || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role || 'unknown'}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// ✅ Check if user can access hospital data (for hospital managers)
const authorizeHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    
    // Admins can access any hospital
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    // Hospital managers can only access their own hospital
    if (req.user.role === 'hospital_manager') {
      const Hospital = require('../models/Hospital');
      const hospital = await Hospital.findById(hospitalId);
      
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hospital not found'
        });
      }

      // Check if this hospital manager belongs to this hospital
      if (req.user.hospitalId && req.user.hospitalId.toString() !== hospitalId) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own hospital data'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Hospital authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = { protect, authorize, authorizeHospital };
