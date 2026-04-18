import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Force re-registration for HMR support
if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'seo', 'marketing'], 
    default: 'marketing',
    required: true 
  },
  permissions: {
    type: [String],
    default: ['blogs'],
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to verify password
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
