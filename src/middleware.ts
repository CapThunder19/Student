import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes — redirect to /login if not authenticated
export const config = {
  matcher: [
    '/profile/:path*',
    '/polls/:path*',
    '/showcase/:path*',
    '/sos/:path*',
  ],
};
