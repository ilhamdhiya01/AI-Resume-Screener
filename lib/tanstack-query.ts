import { onlineManager, QueryCache, QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

if (typeof window !== 'undefined') {
  onlineManager.setEventListener((setOnline) => {
    const handleOnline = () => {
      setOnline(true);
      toast.success('Koneksi internet kembali!', {
        icon: '🟢',
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setOnline(false);
      toast.error('Koneksi internet terputus', {
        icon: '🔴',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (data, query) => {
      // Check if the query that just succeeded has the 'syncToZustand' meta
      //   if (query.meta?.syncToZustand) {
      //     // Update to Zustand safely without breaking React render rules!
      //     useAuthStore.getState().setUser(data as User);
      //   }
    },
    onError: () => {
      const isOnline = onlineManager.isOnline();

      if (!isOnline) {
        return;
      }

      // if (query.meta?.showErrorToast !== false) {
      //   toast.error(error?.message || 'Terjadi kesalahan saat memuat data');
      // }
      //   if (query.meta?.syncToZustand) {
      //     useAuthStore.getState().setUser(null);
      //   }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount) => {
        // Don't retry if offline
        if (!onlineManager.isOnline()) {
          return false;
        }
        // Retry max 2x if online
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount) => {
        // Don't retry mutations if offline
        if (!onlineManager.isOnline()) {
          return false;
        }
        return failureCount < 1;
      },
      networkMode: 'online',
    },
  },
});
