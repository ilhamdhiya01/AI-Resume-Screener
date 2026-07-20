import { Metadata } from 'next';
import React from 'react';

import DashboardLayoutClient from '@/components/shared/layout/DashboardLayoutClient';

export const metadata: Metadata = {
  title: 'Dashboard - Indigo Insight',
  description: 'AI-powered resume screening and candidate matching platform',
};

const AppLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
};

export default AppLayout;
