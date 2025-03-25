import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// This middleware is used to protect routes
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Auth routes that don't need protection
  const publicAuthPaths = ['/auth/signin', '/auth/signup', '/auth/error'];
  
  // API routes that don't need protection
  const publicApiPaths = ['/api/auth/register', '/api/auth/session'];
  
  const isAuthPath = publicAuthPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  const isPublicApiPath = publicApiPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  // If the path is an auth path or public API, allow access
  if (isAuthPath || isPublicApiPath) {
    return NextResponse.next();
  }

  // If the user is trying to access a protected API route
  if (request.nextUrl.pathname.startsWith('/api/author') && !token) {
    return new NextResponse(
      JSON.stringify({ error: 'authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  // For author-specific pages, redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/author') && !token) {
    return NextResponse.redirect(
      new URL('/auth/signin', request.url)
    );
  }

  // Allow public routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/author/:path*',
    '/author/:path*',
    '/bookshelf/:path*',
    '/auth/:path*',
  ],
}; 