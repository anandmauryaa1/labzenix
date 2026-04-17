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
      const userRole = payload.role as string;

      // Role-based access control
      // SEO team restricted from products and settings
      if (userRole === 'seo' && (path.startsWith('/admin/products') || path.startsWith('/admin/settings'))) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Marketing team restricted from settings
      if (userRole === 'marketing' && path.startsWith('/admin/settings')) {
        return NextResponse.redirect(new URL('/admin', request.url));
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