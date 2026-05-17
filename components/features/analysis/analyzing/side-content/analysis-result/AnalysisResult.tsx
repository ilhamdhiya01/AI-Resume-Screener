import { AnalysisResult } from '.';

const AnalysisResultRoot = () => {
  return (
    <div className="space-y-5 overflow-auto p-10">
      <AnalysisResult.Score progress={85} />
      <AnalysisResult.Item
        isCritical
        title="Critical Issues"
        items={[
          'Missing Quantifiable Metrics: Several achievements lack specific percentages or dollar values.',
          'ATS Readability: Two-column layouts may be difficult for older systems to parse.',
        ]}
      />
      <AnalysisResult.Item
        isSuggestions
        title="Suggestions"
        items={[
          "Add specific metrics to achievements (e.g., 'Increased sales by 25%' instead of 'Improved sales').",
          'Use single-column layout for better ATS compatibility.',
        ]}
      />
      <AnalysisResult.Item
        isStrengths
        title="Strengths"
        items={[
          'Clear role and company information.',
          'Well-structured bullet points.',
        ]}
      />
    </div>
  );
};

export default AnalysisResultRoot;
