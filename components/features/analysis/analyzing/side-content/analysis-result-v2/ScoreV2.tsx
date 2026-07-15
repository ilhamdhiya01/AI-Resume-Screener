import React, { useCallback, useMemo, useState } from 'react';

interface ScoreV2Props {
  score: number;
  matchSummary?: string;
}

const getScoreMeta = (score: number) => {
  if (score >= 80)
    return {
      label: 'Excellent',
      color: '#22c55e',
      bg: '#dcfce7',
      track: '#bbf7d0',
    };
  if (score >= 60)
    return { label: 'Good', color: '#6366f1', bg: '#eef2ff', track: '#c7d2fe' };
  if (score >= 40)
    return { label: 'Fair', color: '#f59e0b', bg: '#fffbeb', track: '#fde68a' };
  return {
    label: 'Needs Work',
    color: '#ef4444',
    bg: '#fef2f2',
    track: '#fecaca',
  };
};

const SUMMARY_LIMIT = 120;

const ScoreV2 = React.memo<ScoreV2Props>(({ score, matchSummary }) => {
  const meta = useMemo(() => getScoreMeta(score), [score]);
  const [expanded, setExpanded] = useState(false);

  const size = 148;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(
    () => circumference - (score / 100) * circumference,
    [score, circumference]
  );

  const isTruncated = useMemo(
    () => !!matchSummary && matchSummary.length > SUMMARY_LIMIT,
    [matchSummary]
  );
  const displayedSummary = useMemo(() => {
    if (!matchSummary) return '';
    if (!isTruncated || expanded) return matchSummary;
    return matchSummary.slice(0, SUMMARY_LIMIT) + '…';
  }, [matchSummary, isTruncated, expanded]);

  const toggleExpand = useCallback(() => setExpanded((v) => !v), []);

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl p-4"
      style={{ background: `linear-gradient(145deg, ${meta.bg}, #ffffff)` }}
    >
      {/* Score ring row */}
      <div className="flex items-center gap-4">
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="absolute -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={meta.track}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={meta.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span
              className="text-4xl leading-none font-extrabold tabular-nums"
              style={{ color: meta.color }}
            >
              {score}
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              match score
            </span>
          </div>
        </div>

        {/* Right side: label + summary */}
        <div className="flex flex-1 flex-col gap-2">
          <span
            className="w-fit rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: meta.track, color: meta.color }}
          >
            {meta.label}
          </span>
          {matchSummary && (
            <div>
              <p className="text-xs leading-relaxed text-slate-500 italic">
                {displayedSummary}
              </p>
              {isTruncated && (
                <button
                  onClick={toggleExpand}
                  className="mt-1 text-xs font-semibold"
                  style={{ color: meta.color }}
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ScoreV2.displayName = 'ScoreV2';

export default ScoreV2;
