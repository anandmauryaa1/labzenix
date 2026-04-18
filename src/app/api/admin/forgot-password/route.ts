import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't confirm if user exists or not
      return NextResponse.json({ message: 'If an account exists with that email, a reset link will be sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiry (1 hour)
    const resetPasswordExpires = Date.now() + 3600000;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/reset-password/${resetToken}`;

    // MOCKED EMAIL SENDING
    console.log('-------------------------------------------');
    console.log('🔑 PASSWORD RESET REQUEST FOR:', email);
    console.log('🔗 RESET URL:', resetUrl);
    console.log('-------------------------------------------');

    return NextResponse.json({ 
      message: 'If an account exists with that email, a reset link will be sent.',
      // In dev mode, we can return the link for convenience
      devLink: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
