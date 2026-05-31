import React from 'react';

interface ScoreProps {
  progress: number;
  matchSummary?: string;
}

const Score = ({ progress = 85, matchSummary }: ScoreProps) => {
  const size = 224; // size-56 = 224px
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <div className="space-y-5">
      <div className="relative mx-auto flex size-56 items-center justify-center">
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
        <div className="flex size-56 flex-col items-center justify-center gap-1 rounded-full bg-transparent">
          {/* Percentage text */}
          <span className="text-primary-700 text-3xl font-bold">
            {progress}
          </span>
          <span className="text-primary-600 font-semibold uppercase">
            match score
          </span>
        </div>
      </div>
      {matchSummary && (
        <p className="px-6 text-center text-neutral-600">{matchSummary}</p>
      )}
    </div>
  );
};

export default Score;
