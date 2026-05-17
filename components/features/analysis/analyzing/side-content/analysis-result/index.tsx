import AnalysisItem from './AnalysisItem';
import AnalysisResultRoot from './AnalysisResult';
import Score from './Score';

export const AnalysisResult = Object.assign(AnalysisResultRoot, {
  Item: AnalysisItem,
  Score,
});
