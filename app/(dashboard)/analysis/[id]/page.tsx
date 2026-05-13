import React, { use } from 'react';

import Analyzing from '@/components/features/analysis/analyzing';

interface AnalyzingPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AnalyzingPage = ({ params }: AnalyzingPageProps) => {
  const { id } = use(params);
  return (
    <div className="p-12">
      <Analyzing resumeId={id} />
    </div>
  );
};

export default AnalyzingPage;
