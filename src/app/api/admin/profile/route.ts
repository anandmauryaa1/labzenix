import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { handleProductionError } from '@/lib/errorHandler';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').trim().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await dbConnect();
    const rawBody = await req.json();
    
    const result = profileUpdateSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { name, email, username, password } = result.data;
    
    const user = await User.findById(authUser.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if new username/email is already taken by someone else
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return NextResponse.json({ error: 'Email already taken' }, { status: 400 });
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = password; // Pre-save hook will hash this

    await user.save();

    logger.info('User profile updated by self', { userId: user._id, username: user.username });

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
