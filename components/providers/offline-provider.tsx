/* eslint-disable react-hooks/set-state-in-effect */

import { onlineManager } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

interface OfflineProviderProps {
  children: React.ReactNode;
}

const OfflineProvider = ({ children }: OfflineProviderProps) => {
  const [isOnline, setIsOnline] = useState(() => onlineManager.isOnline());
  const [showOfflineUI, setShowOfflineUI] = useState(false);

  useEffect(() => {
    // Subscribe to online manager
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // Delay showing offline UI to avoid flicker
    if (!isOnline) {
      timer = setTimeout(() => {
        setShowOfflineUI(true);
      }, 1000);
    } else {
      setShowOfflineUI(false);
    }

    // Cleanup timer on unmount or when isOnline changes
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOnline]);

  if (showOfflineUI) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md">
          <h2 className="text-center text-2xl font-bold">
            Anda sedang offline
          </h2>
          <p className="text-center text-gray-600">
            Silahkan cek koneksi internet Anda
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OfflineProvider;
