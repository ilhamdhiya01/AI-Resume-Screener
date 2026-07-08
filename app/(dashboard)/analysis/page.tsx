import { Metadata } from 'next';

import { Upload } from '@/components/features/analysis/upload';

export const metadata: Metadata = {
  title: 'Analysis - Indigo Insight',
  description: 'AI-powered resume screening and candidate matching platform',
};

const AnalysisPage = () => {
  return (
    <Upload.Layout>
      <Upload.FileUpload />
      <Upload.JobDescription />
    </Upload.Layout>
  );
};

export default AnalysisPage;
