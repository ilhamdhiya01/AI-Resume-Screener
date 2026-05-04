import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

import authConfig from './auth.config';
import prisma from './lib/db';
import { getUserById } from './lib/services/auth.service';
import { ROOT_AUTH_PATH } from './routes';

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
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

      if (path.includes(ROOT_AUTH_PATH)) {
        return true;
      }

      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  ...authConfig,
});
