import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { verifyCredentials } from '@/lib/services/auth.service';

import {
  InvalidPasswordError,
  MissingCredentialsError,
} from './lib/errors/auth.error';
import { LOGIN_PATH } from './routes';

export default {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new MissingCredentialsError();
        }

        const user = await verifyCredentials({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (!user) {
          throw new InvalidPasswordError();
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: LOGIN_PATH,
  },
} satisfies NextAuthConfig;
