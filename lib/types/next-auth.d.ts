import 'next-auth';

import { Role } from '@/app/generated/prisma/enums';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
  }
  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    id?: string;
    role?: Role;
  }
}
