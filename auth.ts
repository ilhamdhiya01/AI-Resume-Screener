import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';

import { Role } from './app/generated/prisma/enums';
import authConfig from './auth.config';
import prisma from './lib/db';
import { authRoutes, LOGIN_PATH } from './routes';
import { getUserById } from './services/server/auth.service';

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    // token expired on 1 day
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth providers (Google, etc.) to sign in without email verification
      if (account?.provider !== 'credentials') return true;

      const existingUser = await getUserById(user.id);

      // Check if user exists and has email verified
      if (!existingUser?.emailVerified) return false;

      return true;
    },
    authorized({ request, auth }) {
      const path = request.nextUrl.pathname;

      if (authRoutes.includes(path)) {
        return true;
      }

      if (!auth?.user) {
        const from = path + request.nextUrl.search;
        return NextResponse.redirect(
          new URL(`${LOGIN_PATH}?from=${encodeURIComponent(from)}`, request.url)
        );
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await getUserById(user.id);
        token.id = dbUser?.id ?? user.id;
        token.role = dbUser?.role ?? Role.FREE;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  ...authConfig,
});
