import React from 'react';

interface ScoreProps {
  score?: number;
}

const Score = ({ score = 92 }: ScoreProps) => {
  const size = 48; // size-12 = 48px
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative flex size-12 items-center justify-center">
        {/* SVG Progress Circle */}
        <svg width={size} height={size} className="absolute -rotate-90">
          {/* Background circle (track) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0" // slate-200
            strokeWidth={strokeWidth}
          />
          {/* Progress circle (navy) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#007fb5" // secondary-600
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>

        {/* Percentage text */}
        <span className="text-secondary-600 text-xs font-bold">{score}%</span>
      </div>

      {/* Match label */}
      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        Match
      </span>
    </div>
  );
};

export default Score;
