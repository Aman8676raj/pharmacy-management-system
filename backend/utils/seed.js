const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../models/User');

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@pharmacy.com',
    password: 'Password@123',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Dr. Sarah Jenkins (Pharmacist)',
    email: 'pharmacist@pharmacy.com',
    password: 'Password@123',
    role: 'pharmacist',
    isActive: true,
  },
  {
    name: 'Michael Chang (Cashier)',
    email: 'cashier@pharmacy.com',
    password: 'Password@123',
    role: 'cashier',
    isActive: true,
  },
  {
    name: 'Robert Davis (Inventory Mgr)',
    email: 'inventory@pharmacy.com',
    password: 'Password@123',
    role: 'inventory_manager',
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmacy_management';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Check existing users
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed] Database already contains ${existingCount} users. Cleaning up demo accounts...`);
      await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });
    }

    console.log('[Seed] Seeding demo accounts...');
    for (const userData of demoUsers) {
      // Use create so pre('save') hashes the password
      await User.create(userData);
      console.log(`  -> Created ${userData.role.toUpperCase()}: ${userData.email}`);
    }

    console.log('[Seed] Seeding completed successfully!');
    console.log('Default credentials for all demo users:');
    console.log('  Password: Password@123');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
