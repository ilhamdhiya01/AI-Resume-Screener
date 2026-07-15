import React from 'react';

import ScoreV2 from './ScoreV2';
import SectionCard from './SectionCard';

export type ItemsV2 = Record<
  'strengths' | 'criticals' | 'suggestions',
  string[]
>;

interface AnalysisResultV2Props {
  score: number;
  items: ItemsV2;
  matchSummary?: string;
}

const SECTION_ORDER: (keyof ItemsV2)[] = [
  'criticals',
  'suggestions',
  'strengths',
];

const AnalysisResultV2 = React.memo<AnalysisResultV2Props>(
  ({ score, items, matchSummary }) => {
    return (
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-3 p-5">
          <ScoreV2 score={score} matchSummary={matchSummary} />
          {SECTION_ORDER.map((key) => (
            <SectionCard
              key={key}
              type={key}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
              items={items[key]}
              defaultOpen={key === 'criticals'}
            />
          ))}
        </div>
      </div>
    );
  }
);

AnalysisResultV2.displayName = 'AnalysisResultV2';

export default AnalysisResultV2;
