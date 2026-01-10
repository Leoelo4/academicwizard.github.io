// Create default admin user
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@academicwizard.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      existingAdmin.password = 'leokade1';
      await existingAdmin.save();
      console.log('✅ Admin password updated!');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@academicwizard.com',
        password: 'leokade1',
        role: 'admin'
      });
      console.log('✅ Admin user created!');
    }

    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@academicwizard.com');
    console.log('Password: leokade1');
    console.log('Role: Admin');
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Run the function
createAdmin();
