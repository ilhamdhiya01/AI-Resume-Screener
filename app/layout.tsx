import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { QueryProvider } from '@/components/providers';
import GlobalFileUpload from '@/components/shared/global-file-upload/GlobalFileUpload';

export const metadata: Metadata = {
  title: 'Indigo Insight - AI Resume Screener',
  description: 'AI-powered resume screening and analysis platform.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#3525CD',
};

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
        <QueryProvider>
          {children}
          <GlobalFileUpload />
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
