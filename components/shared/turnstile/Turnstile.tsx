import { Turnstile as CloudflareTurnstile } from '@marsidev/react-turnstile';
import React from 'react';

interface TurnstileProps {
  onSuccess: (toke: string) => void;
  onError?: (error: string) => void;
}

const Turnstile = ({ onSuccess, onError }: TurnstileProps) => {
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY;

  if (!siteKey) {
    console.error('NEXT_PUBLIC_CLOUDFLARE_SITE_KEY is not defined');
    return null;
  }
  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        <label className="select text-sm font-medium">
          Security verification
        </label>
        <CloudflareTurnstile
          siteKey={siteKey}
          onSuccess={onSuccess}
          onError={onError}
          options={{
            theme: 'light',
            size: 'flexible',
          }}
        />
      </div>
    </div>
  );
};

export default Turnstile;
