import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/showcase'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token and trying to access login/signup, allow (for logout scenario)
  // but you could also redirect to dashboard
  if (token && pathname === '/') {
    // If authenticated, redirect from root to dashboard (which is actually /)
    // This is fine as is
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
