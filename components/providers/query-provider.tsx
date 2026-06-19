'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { queryClient } from '@/lib/tanstack-query';

import OfflineProvider from './offline-provider';
import SessionProviderClient from './session-provider';

interface QueryProviderProps {
  children: React.ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineProvider>
        <SessionProviderClient>{children}</SessionProviderClient>
      </OfflineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        toastOptions={{
          position: 'top-center',
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  );
};

export default QueryProvider;
