import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { logger } from '@/lib/logger';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. CSRF Protection for mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const skipCsrf = process.env.SKIP_CSRF === 'true';
    
    if (!skipCsrf && process.env.NODE_ENV === 'production') {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      const host = request.headers.get('host') ?? '';

      // Strict allowlist for production
      const ALLOWED_ORIGINS = [
        'https://app.labzenix.com',
        'http://app.labzenix.com',
        'http://82.25.105.115',
        'https://82.25.105.115',
        'http://82.25.105.115:3000',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

      const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (configuredUrl) {
        ALLOWED_ORIGINS.push(configuredUrl.replace(/\/$/, ''));
      }

      // Safe dynamic inclusion of current host
      if (host) {
        ALLOWED_ORIGINS.push(`https://${host}`);
        ALLOWED_ORIGINS.push(`http://${host}`);
      }

      // Get origin from Origin header or Referer
      const requestOrigin = origin ?? (referer ? (() => { try { return new URL(referer).origin; } catch { return null; } })() : null);

      const isAllowed = requestOrigin
        ? ALLOWED_ORIGINS.includes(requestOrigin)
        : true; // Allow if we can't determine origin (legacy clients) but log it

      if (!isAllowed && requestOrigin) {
        logger.warn('CSRF Potential Violation Detected', { 
          origin, 
          referer, 
          host, 
          path, 
          requestOrigin,
          allowedOrigins: ALLOWED_ORIGINS 
        });
        // We log but don't block yet to avoid breaking valid requests with misconfigured headers
      }
    }
  }

  // 2. Auth & Permission Protection for Admin routes
  // Protect both UI (/admin) and API (/api/admin)
  const isPublicAdminApi = path === '/api/admin/login' || path === '/api/admin/forgot-password' || path.startsWith('/api/admin/reset-password');
  const isApiAdmin = path.startsWith('/api/admin') && !isPublicAdminApi;
  const isAdminUI = path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/forgot-password' && !path.startsWith('/admin/reset-password');

  if (isApiAdmin || isAdminUI) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      if (isApiAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('CRITICAL: JWT_SECRET is not defined');
        if (isApiAdmin) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      const secret = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, secret);
      
      const permissions = (payload.permissions as string[]) || [];
      const userRole = payload.role as string;

      // Bypass for absolute unauthorized page
      if (path === '/admin/unauthorized') return NextResponse.next();

      // Admins bypass all granular checks
      if (userRole === 'admin') return NextResponse.next();

      // Granular Permission Mapping
      const permissionMap: Record<string, string> = {
        '/admin/products': 'products',
        '/api/admin/products': 'products',
        '/admin/blogs': 'blogs',
        '/api/admin/blogs': 'blogs',
        '/admin/seo': 'seo',
        '/api/admin/seo': 'seo',
        '/admin/inquiries': 'inquiries',
        '/api/admin/inquiries': 'inquiries',
        '/admin/users': 'users',
        '/api/admin/users': 'users',
        '/admin/settings': 'settings',
        '/api/admin/settings': 'settings',
        '/admin/analytics': 'analytics',
        '/api/admin/analytics': 'analytics',
      };

      for (const [prefix, requiredPermission] of Object.entries(permissionMap)) {
        if (path.startsWith(prefix) && !permissions.includes(requiredPermission)) {
          logger.warn('Access denied: Missing permission', { path, requiredPermission, user: payload.username });
          if (isApiAdmin) return NextResponse.json({ error: 'Forbidden: Missing permission' }, { status: 403 });
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
        }
      }

      return NextResponse.next();
    } catch (err) {
      logger.error('Middleware JWT Error', { err, path });
      if (isApiAdmin) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
