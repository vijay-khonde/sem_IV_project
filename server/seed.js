/**
 * seed.js — Run once to create an initial admin account.
 * Usage: node seed.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';

const ADMIN_NAME  = 'System Admin';
const ADMIN_EMAIL = 'admin@carenet.local';
const ADMIN_PASS  = 'Admin@12345';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASS, 12);
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: 'admin', trustScore: 100 });

    console.log('✅ Admin account created!');
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASS}`);
    console.log('   ⚠  Change the password after first login.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
