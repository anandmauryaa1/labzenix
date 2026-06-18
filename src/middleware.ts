import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Middleware for authentication and permission-based access control.
 * 
 * CSRF Protection Note:
 * JWT tokens stored in httpOnly cookies with sameSite='strict' already provide
 * inherent CSRF protection. No additional CSRF token mechanism is needed.
 */

export async function middleware(request: NextRequest) {
  // Prevent X-Original-URL / X-Rewrite-URL attacks
  if (request.headers.has('x-original-url') || request.headers.has('x-rewrite-url')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  try {
    const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

    // ====================================================================
    // AUTHENTICATION & PERMISSION PROTECTION for Admin routes
    // ====================================================================
    const isPublicAdminApi = normalizedPath === '/api/admin/login' ||
      normalizedPath === '/api/admin/forgot-password' ||
      normalizedPath.startsWith('/api/admin/reset-password');
    const isApiAdmin = normalizedPath.startsWith('/api/admin') && !isPublicAdminApi;
    const isAdminUI = normalizedPath.startsWith('/admin') &&
      normalizedPath !== '/admin/login' &&
      normalizedPath !== '/admin/forgot-password' &&
      !normalizedPath.startsWith('/admin/reset-password');

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
        console.error('CRITICAL: JWT_SECRET is not defined');
        if (isApiAdmin) {
          return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      const secret = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, secret);

      const permissions = (payload.permissions as string[]) || [];
      const userRole = payload.role as string;

      if (normalizedPath === '/admin/unauthorized') return response;
      if (userRole === 'admin') return response;

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
        '/admin/hero-slides': 'settings',
        '/api/hero-slides': 'settings',
        '/admin/applications': 'products',
        '/api/applications': 'products',
        '/admin/product-ranges': 'products',
        '/api/product-ranges': 'products',
        '/admin/analytics': 'analytics',
        '/api/admin/analytics': 'analytics',
        '/admin/testimonials': 'settings',
        '/api/admin/testimonials': 'settings',
      };

      for (const [prefix, requiredPermission] of Object.entries(permissionMap)) {
        if (normalizedPath.startsWith(prefix) && !permissions.includes(requiredPermission)) {
          if (isApiAdmin) {
            return NextResponse.json(
              { error: 'Forbidden: Missing permission' },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
        }
      }
    }

    return response;
  } catch (err: any) {
    const isApi = path.startsWith('/api');

    if (err.code === 'ERR_JWT_EXPIRED' || err.code === 'ERR_JWS_INVALID') {
      if (isApi) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    console.error('Middleware Error', { message: err.message, path, method: request.method });

    if (isApi) {
      return NextResponse.json({ error: 'Middleware failure' }, { status: 500 });
    }
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
