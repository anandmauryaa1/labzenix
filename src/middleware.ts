import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { logger } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  try {
    // Normalize path to handle trailing slashes consistently
    const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

    // 1. CSRF Protection for mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const skipCsrf = process.env.SKIP_CSRF === 'true';
      
      if (!skipCsrf && process.env.NODE_ENV === 'production') {
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const host = request.headers.get('host') ?? '';

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

        if (host) {
          ALLOWED_ORIGINS.push(`https://${host}`);
          ALLOWED_ORIGINS.push(`http://${host}`);
        }

        const requestOrigin = origin ?? (referer ? (() => { try { return new URL(referer).origin; } catch { return null; } })() : null);

        const isAllowed = requestOrigin
          ? ALLOWED_ORIGINS.includes(requestOrigin)
          : true;

        if (!isAllowed && requestOrigin) {
          logger.warn('CSRF Potential Violation Detected', { 
            origin, 
            referer, 
            host, 
            path, 
            requestOrigin,
            allowedOrigins: ALLOWED_ORIGINS 
          });
        }
      }
    }

    // 2. Auth & Permission Protection for Admin routes
    const isPublicAdminApi = normalizedPath === '/api/admin/login' || normalizedPath === '/api/admin/forgot-password' || normalizedPath.startsWith('/api/admin/reset-password');
    const isApiAdmin = normalizedPath.startsWith('/api/admin') && !isPublicAdminApi;
    const isAdminUI = normalizedPath.startsWith('/admin') && normalizedPath !== '/admin/login' && normalizedPath !== '/admin/forgot-password' && !normalizedPath.startsWith('/admin/reset-password');

    if (isApiAdmin || isAdminUI) {
      const token = request.cookies.get('admin_token')?.value;

      if (!token) {
        if (isApiAdmin) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

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

      if (normalizedPath === '/admin/unauthorized') return NextResponse.next();
      if (userRole === 'admin') return NextResponse.next();

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
        if (normalizedPath.startsWith(prefix) && !permissions.includes(requiredPermission)) {
          logger.warn('Access denied: Missing permission', { path, requiredPermission, user: payload.username });
          if (isApiAdmin) return NextResponse.json({ error: 'Forbidden: Missing permission' }, { status: 403 });
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (err: any) {
    // If it's a JWT error, handle it normally
    if (err.code === 'ERR_JWT_EXPIRED' || err.code === 'ERR_JWS_INVALID') {
      const isApiAdmin = path.startsWith('/api/admin');
      if (isApiAdmin) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    logger.error('Middleware Error', { message: err.message, path });
    // Fail-safe: let the request continue to the actual route handler which might have its own error handling
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
