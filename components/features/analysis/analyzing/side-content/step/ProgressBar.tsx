interface ProgressBarProps {
  progress: number; // 0-100
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="bg-primary-600 absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;
