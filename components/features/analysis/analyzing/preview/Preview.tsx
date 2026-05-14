import { Preview } from '.';

const PreviewRoot = () => {
  return (
    <div className="flex-1 p-8">
      <div className="relative flex h-full flex-col items-center justify-center gap-10 overflow-hidden rounded-xl bg-white drop-shadow-xl">
        <div className="animate-shimmer pointer-events-none absolute top-0 z-50 h-24 w-full bg-linear-to-t from-transparent via-blue-700/20 to-transparent" />
        <Preview.Skelaton />
        <Preview.PercentageProgress />
      </div>
    </div>
  );
};

export default PreviewRoot;
