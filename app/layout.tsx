import './globals.css';

import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import { SessionProviderClient } from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body
        className={`${inter.className} flex min-h-full flex-col bg-[#f0f5ff]`}
      >
        <SessionProviderClient>{children}</SessionProviderClient>
        <Toaster
          toastOptions={{
            position: 'top-center',
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
};

export default RootLayout;
