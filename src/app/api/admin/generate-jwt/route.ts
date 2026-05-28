import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

/**
 * DEBUG ENDPOINT - Generate a test JWT token
 * This endpoint is for development/debugging only
 * 
 * Usage: GET /api/admin/generate-jwt?username=admin&role=admin&expiresIn=12h
 * 
 * ⚠️ Remove this endpoint before production deployment
 */

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get('username') || 'admin';
    const role = searchParams.get('role') || 'admin';
    const expiresIn = searchParams.get('expiresIn') || '12h';

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'JWT_SECRET not configured' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id: 'test_id_' + Date.now(),
        role,
        username,
        name: 'Test User',
        email: 'test@example.com',
        permissions: role === 'admin' ? [] : ['products'],
      },
      process.env.JWT_SECRET,
      { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );

    // Log the generated token
    logger.info('DEBUG: JWT Token Generated', {
      username,
      role,
      expiresIn,
      token,
    });

    // Also decode and show the payload
    const decoded = jwt.decode(token);

    return NextResponse.json(
      {
        success: true,
        token,
        payload: decoded,
        expiresIn,
        usage: 'Add this token to your Cookie as "admin_token" or Authorization header as "Bearer <token>"',
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('JWT generation error', { message: error.message });
    return NextResponse.json(
      { error: 'Failed to generate JWT: ' + error.message },
      { status: 500 }
    );
  }
}
