import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    // Validate JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    await dbConnect();
    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (username.trim().length === 0 || password.trim().length === 0) {
      return NextResponse.json({ error: 'Username and password cannot be empty' }, { status: 400 });
    }

    const user = await User.findOne({ username: username.trim() });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
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
      process.env.JWT_SECRET, 
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
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}