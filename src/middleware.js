import { NextResponse } from 'next/server';

/**
 * Decodes JWT payload without verifying signature (safe for UI navigation logic,
 * as backend routes will do strict signature validation).
 */
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Base64URL to Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return JSON.parse(rawData);
  } catch (error) {
    return null;
  }
}

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protection for Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const decoded = decodeJwt(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Protection for Employee Routes
  if (pathname.startsWith('/employee')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const decoded = decodeJwt(token);
    if (!decoded || (decoded.role !== 'EMPLOYEE' && decoded.role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Prevent logged-in users from accessing Auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.role) {
        if (decoded.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        if (decoded.role === 'EMPLOYEE') {
          return NextResponse.redirect(new URL('/employee', request.url));
        }
        // Readers go back to public homepage
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Specify matching paths
export const config = {
  matcher: ['/admin/:path*', '/employee/:path*', '/login', '/register'],
};
