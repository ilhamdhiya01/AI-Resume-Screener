import classNames from 'classnames';
import React from 'react';

interface ScoreProps {
  score?: number;
}

const Score = ({ score = 92 }: ScoreProps) => {
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative flex size-12 items-center justify-center">
        <svg width={size} height={size} className="absolute -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={classNames({
              'stroke-green-200': score > 85,
              'stroke-secondary-200': score > 70 && score <= 85,
              'stroke-tertiary-200': score > 40 && score <= 70,
              'stroke-red-200': score <= 40,
            })}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={classNames('transition-all duration-500 ease-in-out', {
              'stroke-green-500': score > 85,
              'stroke-secondary-500': score > 70 && score <= 85,
              'stroke-tertiary-500': score > 40 && score <= 70,
              'stroke-red-500': score <= 40,
            })}
          />
        </svg>
        <span
          className={classNames('text-xs font-bold', {
            'text-green-500': score > 85,
            'text-secondary-500': score > 70 && score <= 85,
            'text-tertiary-500': score > 40 && score <= 70,
            'text-red-500': score <= 40,
          })}
        >
          {score}%
        </span>
      </div>

      <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        Match
      </span>
    </div>
  );
};

export default Score;
