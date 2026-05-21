import { use } from 'react';

import AnalyzingProcess from '@/components/features/analysis/analyzing/AnalyzingProcess';

interface AnalyzingPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AnalyzingPage = ({ params }: AnalyzingPageProps) => {
  const { id } = use(params);
  return <AnalyzingProcess resumeId={id} />;
};

export default AnalyzingPage;
