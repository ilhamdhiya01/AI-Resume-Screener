import './globals.css';

import { Inter } from 'next/font/google';

import { QueryProvider } from '@/components/providers';
import GlobalFileUpload from '@/components/shared/global-file-upload/GlobalFileUpload';

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
