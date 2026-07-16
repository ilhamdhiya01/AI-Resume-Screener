import { NextResponse } from 'next/server';

import { Role } from './app/generated/prisma/enums';
import { auth } from './auth';
import {
  authRoutes,
  LOGIN_PATH,
  ROOT_PATH,
  ROOT_VERIFY_REQUEST_PATH,
  SETTINGS_PATH,
} from './routes';

type SettingsTab = 'profile' | 'ai-preferences' | 'subscription';

const DEFAULT_SETTINGS_TAB: SettingsTab = 'profile';

const SETTINGS_TAB_PERMISSIONS: Record<SettingsTab, Role[]> = {
  profile: Object.values(Role),
  subscription: Object.values(Role),
  'ai-preferences': [Role.PRO, Role.ADMIN],
};

const isSettingsTabAllowed = (tab: SettingsTab, role?: Role) => {
  const allowedRoles = SETTINGS_TAB_PERMISSIONS[tab];
  return !!role && allowedRoles.includes(role);
};

export const proxy = auth(async (req) => {
  const { nextUrl, url, auth } = req;
  const isLoggedIn = !!auth;
  const role = auth?.user?.role;
  const path = nextUrl.pathname;

  const isAuthRoute = authRoutes.some((route) => {
    const pattern = route.replace(/\[.*?\]/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(path);
  });

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL(ROOT_PATH, url));
  }

  // verify-request without token → redirect to login
  if (
    !isLoggedIn &&
    path === ROOT_VERIFY_REQUEST_PATH &&
    !nextUrl.searchParams.has('token')
  ) {
    return NextResponse.redirect(new URL(LOGIN_PATH, url));
  }

  const tab = nextUrl.searchParams.get('tab') as SettingsTab | null;

  if (path === SETTINGS_PATH && tab && !isSettingsTabAllowed(tab, role)) {
    const redirectUrl = new URL(SETTINGS_PATH, url);
    redirectUrl.searchParams.set('tab', DEFAULT_SETTINGS_TAB);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
