const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      role: 'admin',
      adminLevel: 'super_admin'
    });

    if (existingSuperAdmin) {
      console.log('Super admin already exists!');
      console.log('Email:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@carespot.com',
      password: 'admin123456', // Will be hashed automatically
      phone: '9999999999',
      role: 'admin',
      adminLevel: 'super_admin',
      permissions: [
        'verify_hospitals',
        'manage_users',
        'view_analytics',
        'system_settings',
        'content_management'
      ]
    });

    console.log('✅ Super Admin created successfully!');
    console.log('Email: admin@carespot.com');
    console.log('Password: admin123456');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
