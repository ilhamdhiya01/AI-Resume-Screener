import { Metadata } from 'next';

import { Upload } from '@/components/features/analysis/upload';

export const metadata: Metadata = {
  title: 'Analysis - Indigo Insight',
  description: 'AI-powered resume screening and candidate matching platform',
};

const AnalysisPage = () => {
  return (
    <div className="p-12">
      <Upload />
    </div>
  );
};

export default AnalysisPage;
