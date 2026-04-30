import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  (req) => {
    // 2️⃣ Get token dari NextAuth
    // token = JWT object jika user logged in
    // token = null jika user belum login
    const token = req.nextauth.token;

    // Get path is user access
    const path = req.nextUrl.pathname;

    // 🔍 Debug path dengan detail
    console.log('=== DEBUG ===');
    console.log('Path:', JSON.stringify(path)); // Check encoding
    console.log('Path length:', path.length);
    console.log('Path startsWith /auth:', path.startsWith('/auth'));
    console.log('Path === /auth/login:', path === '/auth/login');
    console.log('Token exists:', token);

    const isAuthPage = path === '/auth/login' || path === '/auth';
    const isHomePage = path === '/';
    const isProtectedPage =
      path.startsWith('/dashboard') ||
      path.startsWith('/profile') ||
      path.startsWith('/resume');

    console.log('isAuthPage:', isAuthPage);

    if (token && isAuthPage) {
      console.log('🔄 SHOULD REDIRECT NOW!');
      console.log('  Redirecting from:', path);
      console.log('  Redirecting to: /');
      const redirectUrl = new URL('/', req.url);
      console.log('  Redirect URL:', redirectUrl.toString());

      return NextResponse.redirect(redirectUrl);
    }

    if (!token && (isHomePage || isProtectedPage)) {
      const from = req.nextUrl.pathname + req.nextUrl.search;
      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith('/auth')) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images|\\.well-known).*)',
  ],
};
