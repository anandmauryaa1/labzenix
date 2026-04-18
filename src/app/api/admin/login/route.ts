import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

    const user = await User.findOne({ username });
    
    // DUMMY LOGIN BYPASS (For development only)
    if (!user && username === 'admin' && password === 'admin') {
      const dummyToken = jwt.sign(
        { 
          id: 'dummy-id', 
          role: 'admin', 
          username: 'admin', 
          name: 'Super Admin', 
          email: 'admin@labzenix.com',
          permissions: ['blogs', 'products', 'categories', 'seo', 'inquiries', 'users', 'settings']
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '12h' }
      );

      const cookie = serialize('admin_token', dummyToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 12,
      });

      return new NextResponse(JSON.stringify({ 
        success: true, 
        role: 'admin',
        username: 'admin',
        name: 'Super Admin',
        email: 'admin@labzenix.com',
        permissions: ['blogs', 'products', 'categories', 'seo', 'inquiries', 'users', 'settings']
      }), {
        status: 200,
        headers: { 'Set-Cookie': cookie },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        username: user.username, 
        name: user.name, 
        email: user.email,
        permissions: user.permissions || []
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '12h' }
    );

    const cookie = serialize('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return new NextResponse(JSON.stringify({ 
      success: true, 
      role: user.role,
      username: user.username,
      name: user.name,
      email: user.email,
      permissions: user.permissions || []
    }), {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}