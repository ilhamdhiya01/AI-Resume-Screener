import { startCase } from 'lodash';

import { AnalysisResult } from '.';

export type Items = Record<'criticals' | 'suggestions' | 'strengths', string[]>;

interface AnalysisResultRootProps {
  score: number;
  items: Items;
}

const AnalysisResultRoot = ({ score, items }: AnalysisResultRootProps) => {
  console.log({ items });
  const keys: (keyof Items)[] = Object.keys(items) as (keyof Items)[];
  return (
    <div className="space-y-5 overflow-auto p-10">
      <AnalysisResult.Score progress={score} />
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
};

export default AnalysisResultRoot;
