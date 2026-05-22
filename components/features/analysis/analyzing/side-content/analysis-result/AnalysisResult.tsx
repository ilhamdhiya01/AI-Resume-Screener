import { startCase } from 'lodash';

import { ResumeData } from '@/lib/types/resume-analysis.types';

import { AnalysisResult } from '.';

export type Items = Record<'strengths' | 'criticals' | 'suggestions', string[]>;

interface AnalysisResultRootProps {
  score: number;
  strengths: string[];
  criticals: string[];
  suggestions: string[];
  items: Items;
}

const AnalysisResultRoot = ({
  score,
  strengths,
  criticals,
  suggestions,
  items,
}: AnalysisResultRootProps) => {
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
      {/* <AnalysisResult.Item
        isSuggestions
        title="Suggestions"
        items={suggestions}
      />
      <AnalysisResult.Item isStrengths title="Strengths" items={strengths} /> */}
    </div>
  );
};

export default AnalysisResultRoot;
