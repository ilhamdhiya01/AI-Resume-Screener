import { startCase } from 'lodash';
import React from 'react';

import { AnalysisResult } from '.';

export type Items = Record<'strengths' | 'criticals' | 'suggestions', string[]>;

interface AnalysisResultRootProps {
  score: number;
  items: Items;
  matchSummary?: string;
}

const AnalysisResultRoot = React.memo<AnalysisResultRootProps>(
  ({ score, items, matchSummary }) => {
    const keys: (keyof Items)[] = Object.keys(items) as (keyof Items)[];
    return (
      <div className="space-y-5 overflow-auto p-10">
        <AnalysisResult.Score progress={score} matchSummary={matchSummary} />
        {keys.map((key) => {
          if (items[key].length === 0) return null;
          return (
            <AnalysisResult.Item
              key={key}
              isCritical={key === 'criticals'}
              isSuggestions={key === 'suggestions'}
              isStrengths={key === 'strengths'}
              title={startCase(key)}
              items={items[key as keyof Items]}
            />
          );
        })}
      </div>
    );
  }
);

AnalysisResultRoot.displayName = 'AnalysisResultRoot';

export default AnalysisResultRoot;
