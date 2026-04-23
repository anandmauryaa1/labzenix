import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

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
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');
      
      const { payload } = await jwtVerify(token, secret);
      const permissions = (payload.permissions as string[]) || [];
      const userRole = payload.role as string;

      // Allow access to unauthorized page itself
      if (path === '/admin/unauthorized') return NextResponse.next();

      // Admins bypass all checks
      if (userRole === 'admin') return NextResponse.next();

      // Granular Permission Checks
      if (path.startsWith('/admin/products') && !permissions.includes('products')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      if (path.startsWith('/admin/blogs') && !permissions.includes('blogs')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      if (path.startsWith('/admin/seo') && !permissions.includes('seo')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      if (path.startsWith('/admin/inquiries') && !permissions.includes('inquiries')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      if (path.startsWith('/admin/users') && !permissions.includes('users')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      if (path.startsWith('/admin/settings') && !permissions.includes('settings')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      if (path.startsWith('/admin/analytics') && !permissions.includes('analytics')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Middleware JWT Error:', err);
      // If token is invalid or expired, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};