import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Authorization check
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Authorization check
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 });

    const body = await req.json();
    const { name, email, username, password, role, permissions } = body;

    if (!name || !email || !username || !password || !role || !permissions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing user
    const existing = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Username or Email already exists' }, { status: 400 });
    }

    const newUser = await User.create({
      name,
      email,
      username,
      password, // Pre-save hook will hash this
      role,
      permissions
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
