import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

const SessionProviderClient = ({ children }: { children: ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default SessionProviderClient;
