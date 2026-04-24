import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { logger } from './logger';

let isSeeded = false;

export async function seedDefaultAdmin() {
  if (isSeeded) return;
  
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount === 0) {
      logger.info('No admin users found. Seeding default admin...');
      
      const username = process.env.ADMIN_USERNAME || 'Labz';
      const password = process.env.ADMIN_PASSWORD || 'Labzenix@2026';
      const email = 'info@labzenix.com';
      
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await User.create({
        name: 'System Administrator',
        email,
        username,
        password: hashedPassword,
        role: 'admin',
        permissions: ['blogs', 'products', 'categories', 'seo', 'inquiries', 'users', 'settings'],
        active: true,
        createdAt: new Date()
      });
      
      logger.info('Default admin user created successfully', { username, email });
    }
    
    isSeeded = true;
  } catch (error: any) {
    logger.error('Failed to seed default admin', { error: error.message });
  }
}
