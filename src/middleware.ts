import { NextResponse } from 'next/server';
// import { withAuth } from 'next-auth/middleware';

export function middleware() {
  return NextResponse.next();
}

// export default withAuth({
//   callbacks: {
//     authorized: ({ token }) => !!token,
//   },
// });

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - signup (signup page)
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|login|signup|showcase).*)',
  ],
};
