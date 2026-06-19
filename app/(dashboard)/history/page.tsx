import { History } from '@/components/features/history';

interface HistoryPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

const HistoryPage = async ({ searchParams }: HistoryPageProps) => {
  const params = await searchParams;
  return (
    <History.Layout tabParams={params}>
      <History.DocumentList />
    </History.Layout>
  );
};

export default HistoryPage;
