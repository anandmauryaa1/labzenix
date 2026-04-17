import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return NextResponse.json({
      id: decoded.id,
      role: decoded.role,
      username: decoded.username
    });
  } catch (error) {
    // If token is valid but ID is dummy, it's fine as long as we have role
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
