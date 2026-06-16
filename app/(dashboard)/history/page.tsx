import React from 'react';

import { History } from '@/components/features/history';

const HistoryPage = () => {
  return (
    <History.Layout>
      <History.DocumentList />
    </History.Layout>
  );
};

export default HistoryPage;
