import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { logger } from '@/lib/logger';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // CSRF Protection for mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // In production, we strictly check origin
    if (process.env.NODE_ENV === 'production') {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!origin || (siteUrl && !origin.startsWith(siteUrl)) || (!siteUrl && !origin.includes(host as string))) {
        logger.warn('CSRF Potential Violation', { origin, host, path });
        return new NextResponse(
          JSON.stringify({ error: 'CSRF security violation' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Define protected routes
  if (path.startsWith('/admin')) {
    // Exclude login page from middleware
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // jwtVerify requires a Uint8Array for the secret
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('CRITICAL: JWT_SECRET is not defined');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      const secret = new TextEncoder().encode(jwtSecret);
      
      const { payload } = await jwtVerify(token, secret);
      const permissions = (payload.permissions as string[]) || [];
      const userRole = payload.role as string;

      // Allow access to unauthorized page itself
      if (path === '/admin/unauthorized') return NextResponse.next();

      // Admins bypass all checks
      if (userRole === 'admin') return NextResponse.next();

      // Granular Permission Checks
      const checkPermission = (prefix: string, permission: string) => {
        if (path.startsWith(prefix) && !permissions.includes(permission)) {
          logger.warn('Access denied: Missing permission', { path, permission, user: payload.username });
          return true;
        }
        return false;
      };

      if (checkPermission('/admin/products', 'products')) return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      if (checkPermission('/admin/blogs', 'blogs')) return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      if (checkPermission('/admin/seo', 'seo')) return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      if (checkPermission('/admin/inquiries', 'inquiries')) return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      if (checkPermission('/admin/users', 'users')) return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      if (checkPermission('/admin/settings', 'settings')) return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      if (checkPermission('/admin/analytics', 'analytics')) return NextResponse.redirect(new URL('/admin/unauthorized', request.url));

      return NextResponse.next();
    } catch (err) {
      logger.error('Middleware JWT Error', { err, path });
      // If token is invalid or expired, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};