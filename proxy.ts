import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';

import authConfig from './auth.config';
import {
  authRoutes,
  LOGIN_PATH,
  privateRoutes,
  ROOT_AUTH_PATH,
  ROOT_PATH,
} from './routes';

// Use only one of the two proxy options below
// 1. Use proxy directly
// export const { auth: proxy } = NextAuth(authConfig)

// 2. Wrapped proxy option
const { auth } = NextAuth(authConfig);
export const proxy = auth(async (req) => {
  const { nextUrl, url, auth } = req;
  const isLoggedIn = !!auth;
  const path = nextUrl.pathname;

  const isPrivateRoutes = privateRoutes.includes(path);
  const isAuthRoute = authRoutes.includes(path);

  if (isLoggedIn && isAuthRoute) {
    const redirectUrl = new URL(ROOT_PATH, url);
    return NextResponse.redirect(redirectUrl);
  }

  if ((!isLoggedIn && isPrivateRoutes) || path === ROOT_AUTH_PATH) {
    const from = path + nextUrl.search;
    return NextResponse.redirect(
      new URL(`${LOGIN_PATH}?from=${encodeURIComponent(from)}`, url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
