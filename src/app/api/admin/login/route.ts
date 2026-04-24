import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { logger } from '@/lib/logger';
import { handleProductionError } from '@/lib/errorHandler';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid username or password format' }, { status: 400 });
    }

    const { username, password } = result.data;

    const user = await User.findOne({ username });
    
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

    logger.info('User logged in', { username });

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
    return handleProductionError(error);
  }
}