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
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'seo', 'marketing'], default: 'admin' },
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

    const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
    
    if (existingAdmin) {
      console.log(`Admin user "${ADMIN_USERNAME}" already exists. Updating password...`);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Password updated successfully.');
    } else {
      console.log(`Creating new admin user: ${ADMIN_USERNAME}`);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const newAdmin = new User({
        username: ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin'
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
