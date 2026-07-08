import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Screener - Authentication',
  description: 'Sign in or sign up to access your AI Resume Screener dashboard',
};

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <main>{children}</main>;
};

export default AuthLayout;
