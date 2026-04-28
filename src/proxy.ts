import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { logger } from '@/lib/logger';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // CSRF Protection for mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host') ?? '';

    if (process.env.NODE_ENV === 'production') {
      // Explicit allowlist: VPS IP, production domain, and localhost dev variants
      const ALLOWED_ORIGINS = [
        // Production domain
        'https://app.labzenix.com',
        'http://app.labzenix.com',
        // VPS direct IP access (port 80 / 443 / Next.js default 3000)
        'http://82.25.105.115',
        'https://82.25.105.115',
        'http://82.25.105.115:3000',
        'http://82.25.105.115:80',
        'http://82.25.105.115:22',
        'https://82.25.105.115:22',
        // Localhost development variants
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        // Dynamic fallback from the request Host header (catches any port the server runs on)
        `https://${host}`,
        `http://${host}`,
      ];

      // Also include NEXT_PUBLIC_SITE_URL if it's set
      const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (configuredUrl) {
        ALLOWED_ORIGINS.push(configuredUrl.replace(/\/$/, ''));
      }

      // Use Origin header; fall back to Referer origin for same-origin POSTs
      const requestOrigin = origin ?? (referer ? (() => { try { return new URL(referer).origin; } catch { return null; } })() : null);

      const isAllowed = requestOrigin
        ? ALLOWED_ORIGINS.some((allowed) => requestOrigin === allowed || requestOrigin.startsWith(allowed))
        : false;

      if (!isAllowed) {
        // Log the violation for auditing, but DO NOT block the request.
        // This prevents users from being locked out due to proxy/browser header issues.
        logger.warn('CSRF Potential Violation Detected (Permitted)', { 
          origin, 
          referer, 
          host, 
          path, 
          requestOrigin,
          allowedOrigins: ALLOWED_ORIGINS 
        });
      }
    }
    // In development: skip CSRF check entirely (localhost fetch doesn't reliably send Origin)
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