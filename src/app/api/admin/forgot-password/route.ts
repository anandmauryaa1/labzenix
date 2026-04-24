import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { handleProductionError } from '@/lib/errorHandler';

// Email validation regex
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    // Validate email format
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // For security, don't confirm if user exists or not
      return NextResponse.json({ 
        message: 'If an account exists with that email, a reset link will be sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiry (1 hour)
    const resetPasswordExpires = new Date(Date.now() + 3600000);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/reset-password/${resetToken}`;

    // Log reset link to logger
    logger.info('Password reset link generated', {
      email: user.email,
      name: user.name,
      resetUrl,
      expires: '1 hour'
    });

    return NextResponse.json({ 
      message: 'If an account exists with that email, a reset link will be sent.'
    });
  } catch (error: any) {
    return handleProductionError(error);
  }
}
