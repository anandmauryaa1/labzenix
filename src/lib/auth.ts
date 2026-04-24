import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from './dbConnect';
import { logger } from './logger';

export interface AuthUser {
  id: string;
  role: 'admin' | 'seo' | 'marketing';
  username: string;
  name: string;
  email: string;
  permissions: string[];
}

interface JWTPayload {
  id: string;
  role: 'admin' | 'seo' | 'marketing';
  username: string;
  name: string;
  email: string;
  permissions: string[];
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('CRITICAL: JWT_SECRET is not defined');
      return null;
    }

    const decoded = jwt.verify(token, secret) as unknown as JWTPayload;
    
    // Validate decoded structure
    if (!decoded || !decoded.id || !decoded.role) return null;

    return {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
      name: decoded.name || '',
      email: decoded.email || '',
      permissions: decoded.permissions || []
    };
  } catch (err) {
    return null;
  }
}

export async function isAdmin(req: NextRequest): Promise<boolean> {
  const user = await getAuthUser(req);
  return user?.role === 'admin';
}

export async function hasPermission(req: NextRequest, permission: string): Promise<boolean> {
  const user = await getAuthUser(req);
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.permissions.includes(permission);
}
