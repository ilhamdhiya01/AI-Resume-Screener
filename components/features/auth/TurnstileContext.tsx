'use client';

import React, { createContext, useContext, useState } from 'react';

interface TurnstileContextValue {
  turnstileToken: string | null;
  setTurnstileToken: (token: string | null) => void;
}

const TurnstileContext = createContext<TurnstileContextValue | undefined>(
  undefined
);

export const TurnstileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <TurnstileContext.Provider value={{ turnstileToken, setTurnstileToken }}>
      {children}
    </TurnstileContext.Provider>
  );
};

export const useTurnstile = () => {
  const context = useContext(TurnstileContext);

  if (!context) {
    throw new Error('useTurnstile must be used within a TurnstileProvider');
  }

  return context;
};
