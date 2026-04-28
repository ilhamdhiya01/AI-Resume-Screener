'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export const SessionProviderClient = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <SessionProvider>{children}</SessionProvider>;
};
