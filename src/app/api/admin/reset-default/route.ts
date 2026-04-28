import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const username = process.env.ADMIN_USERNAME || 'Labz';
    const password = process.env.ADMIN_PASSWORD || 'Labzenix@2026';
    
    // The User model has a pre-save hook that handles hashing, 
    // so we MUST pass the plain password to .save() or .create() 
    // to avoid double-hashing.
    
    // Find existing admin or create new one
    let user = await User.findOne({ role: 'admin' });
    
    if (user) {
      user.password = password;
      await user.save();
      logger.info('Admin credentials reset to defaults', { username });
    } else {
      await User.create({
        name: 'System Administrator',
        email: 'info@labzenix.com',
        username,
        password: password,
        role: 'admin',
        permissions: ['blogs', 'products', 'categories', 'seo', 'inquiries', 'users', 'settings'],
        active: true,
      });
      logger.info('Default admin created via reset route', { username });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin credentials have been reset/created successfully.',
      username: username,
      password: password
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
