import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'seo', 'marketing'], default: 'admin' },
  permissions: { type: [String], default: ['blogs'] },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const existingAdmin = await User.findOne({ 
      $or: [
        { username: ADMIN_USERNAME },
        { email: 'admin@labzenix.com' }
      ]
    });
    
    if (existingAdmin) {
      console.log(`Admin user "${existingAdmin.username}" already exists. Updating password and details...`);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.permissions = ['blogs', 'products', 'categories', 'inquiries', 'settings', 'seo'];
      await existingAdmin.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log(`Creating new admin user: ${ADMIN_USERNAME}`);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      const newAdmin = new User({
        name: 'LabZenix Admin',
        email: 'admin@labzenix.com',
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
        permissions: ['blogs', 'products', 'categories', 'inquiries', 'settings', 'seo'],
        active: true
      });
      await newAdmin.save();
      console.log('Admin user created successfully.');
    }

    console.log('--------------------------------------------------');
    console.log(`Login Credentials:`);
    console.log(`Username: ${ADMIN_USERNAME}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
