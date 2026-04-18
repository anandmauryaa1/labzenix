import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await dbConnect();
    const user = await User.findById(decoded.id, '-password');
    
    if (!user) {
      // Fallback for dummy admin if needed
      if (decoded.id === 'dummy-id') {
        return NextResponse.json({ 
          username: 'admin', 
          role: 'admin', 
          name: 'Super Admin', 
          email: 'admin@labzenix.com',
          permissions: ['blogs', 'products', 'categories', 'seo', 'inquiries', 'users', 'settings']
        });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
