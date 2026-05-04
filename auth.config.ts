import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';

import {
  generateVerificationTokenByEmail,
  verifyCredentials,
} from '@/lib/services/auth.service';

import { MissingCredentialsError } from './lib/errors/auth.error';
import { LOGIN_PATH } from './routes';

export default {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: Number(process.env.EMAIL_SERVER_PORT),
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // }),
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
          return null;
        }

        await generateVerificationTokenByEmail(credentials.email as string);
        // ✅ PENTING: Block user yang belum verify email
        // if (!user.emailVerified) {
        //   throw new Error('Please verify your email before logging in');
        // }

        return user;
      },
    }),
  ],
  pages: {
    signIn: LOGIN_PATH,
    verifyRequest: '/auth/verify-request',
  },
} satisfies NextAuthConfig;
