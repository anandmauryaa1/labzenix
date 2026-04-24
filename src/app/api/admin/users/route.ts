import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { handleProductionError } from '@/lib/errorHandler';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  username: z.string().min(3, 'Username must be at least 3 characters').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'seo', 'marketing']).default('marketing'),
  permissions: z.array(z.string()).default(['blogs']),
});

const userStatusSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  active: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await getAuthUser(req);
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (adminUser.role !== 'admin') return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = userSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const body = result.data;

    // Check for existing user
    const existing = await User.findOne({ 
      $or: [{ username: body.username }, { email: body.email }] 
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Username or Email already exists' }, { status: 400 });
    }

    const newUser = await User.create(body);

    const userResponse = newUser.toObject();
    delete userResponse.password;

    logger.info('New user created', { username: body.username, role: body.role, createdBy: adminUser.username });
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    return handleProductionError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await getAuthUser(req);
    if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (adminUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = userStatusSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { userId, active } = result.data;

    const targetUser = await User.findByIdAndUpdate(
      userId,
      { 
        active,
        lastLogin: active ? new Date() : null
      },
      { new: true }
    ).select('-password').lean();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    logger.info('User status updated', { targetUserId: userId, active, updatedBy: adminUser.username });
    return NextResponse.json(targetUser);
  } catch (error: any) {
    return handleProductionError(error);
  }
}
