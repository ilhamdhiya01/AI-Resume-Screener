import Icon from '@/components/ui/icon';

const PercentageProgress = () => {
  //   const { progress, step, status } = useJobProgress('abc');

  const size = 192; // size-48 = 192px
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (0 / 100) * circumference;

  const progress = 0;

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="relative flex size-48 items-center justify-center">
        {/* SVG Progress Circle */}
        <svg width={size} height={size} className="absolute -rotate-90">
          {/* Background circle (gray) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#cbd5e1" // slate-300
            strokeWidth={strokeWidth}
          />
          {/* Progress circle (blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#6366f1" // primary color
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>

        {/* Inner circle */}
        <div className="flex size-45 flex-col items-center justify-center gap-1 rounded-full border border-slate-300 bg-transparent">
          {/* Percentage text */}
          <span className="text-primary-700 text-3xl font-bold">
            {progress}%
          </span>
          <span className="font-semibold text-neutral-600 uppercase">
            {progress === 100 ? 'completed' : 'processing'}
          </span>
        </div>
      </div>
      <div className="border-primary-300 bg-primary-100 inline-flex max-w-lg min-w-0 items-center gap-2 rounded-full border px-3 py-1.5">
        <Icon icon="TbFile" className="text-primary-700 shrink-0" size={18} />
        <span className="truncate text-sm">
          senior_software_engineer_cv.pdf
        </span>
      </div>
    </div>
  );
};

export default PercentageProgress;
