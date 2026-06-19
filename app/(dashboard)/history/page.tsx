import { History } from '@/components/features/history';

interface HistoryPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

const HistoryPage = async ({ searchParams }: HistoryPageProps) => {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));

  return (
    <History.Layout params={{ tab: params.tab, page }}>
      <History.DocumentList page={page} status={params.tab} />
    </History.Layout>
  );
};

export default HistoryPage;
