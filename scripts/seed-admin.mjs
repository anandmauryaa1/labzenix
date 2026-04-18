import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment');
  process.exit(1);
}

// Define Schema here to avoid TS import issues
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to hash password - simplified for Mongoose 6+ ESM
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const username = process.env.ADMIN_USERNAME || 'labzenix_admin';
    const password = process.env.ADMIN_PASSWORD || 'SecurePass123!';
    
    // Check if admin already exists
    let admin = await User.findOne({ username });

    if (admin) {
      console.log('Admin already exists. Updating credentials and schema...');
      admin.password = password;
      admin.name = 'LabZenix Administrator';
      admin.email = 'admin@labzenix.com';
      admin.role = 'admin';
      await admin.save();
      console.log('Admin updated successfully.');
    } else {
      console.log('Creating fresh admin user...');
      await User.create({
        name: 'LabZenix Administrator',
        email: 'admin@labzenix.com',
        username: username,
        password: password,
        role: 'admin'
      });
      console.log('Admin created successfully.');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedAdmin();
