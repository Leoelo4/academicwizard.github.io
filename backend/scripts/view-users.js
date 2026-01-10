// View all users in the database
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const viewUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('-password'); // Exclude password
    
    console.log(`=== Total Users: ${users.length} ===\n`);
    
    if (users.length === 0) {
      console.log('No users found yet. Register someone to see them appear here!\n');
    } else {
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Phone: ${user.phone || 'Not provided'}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log('  ---');
      });
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Run the function
viewUsers();
