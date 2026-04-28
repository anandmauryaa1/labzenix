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
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Find existing admin or create new one
    let user = await User.findOne({ role: 'admin' });
    
    if (user) {
      user.username = username;
      user.password = hashedPassword;
      await user.save();
      logger.info('Admin credentials reset to defaults', { username });
    } else {
      await User.create({
        name: 'System Administrator',
        email: 'info@labzenix.com',
        username,
        password: hashedPassword,
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
