import React, { use } from 'react';

import Analyzing from '@/components/features/analysis/analyzing';
import AnalyzingProcess from '@/components/features/analysis/analyzing/AnalyzingProcess';

interface AnalyzingPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AnalyzingPage = ({ params }: AnalyzingPageProps) => {
  const { id } = use(params);
  return (
    <div className="">
      <AnalyzingProcess resumeId={id} />
    </div>
  );
};

export default AnalyzingPage;
