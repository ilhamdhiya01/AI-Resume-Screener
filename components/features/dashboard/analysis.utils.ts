import { type IconName } from '@/components/ui/icon';
import { RecentAnalysisItem } from '@/lib/types/dashboard.types';

type ScoreBadge = {
  label: string;
  className: string;
};

type FileIcon = {
  icon: IconName;
  className: string;
};

export const getScoreBadge = (score: number): ScoreBadge => {
  if (score >= 70) {
    return {
      label: 'Strong Match',
      className: 'bg-green-100 text-green-700',
    };
  }

  if (score >= 40) {
    return {
      label: 'Average',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  return {
    label: 'Poor Fit',
    className: 'bg-red-100 text-red-600',
  };
};

export const getFileIcon = (fileType: string): FileIcon => {
  const lower = fileType.toLowerCase();

  if (lower.includes('pdf')) {
    return { icon: 'TbFileTypePdf', className: 'bg-red-50 text-red-500' };
  }

  if (lower.includes('doc') || lower.includes('word')) {
    return { icon: 'TbFileTypeDoc', className: 'bg-blue-50 text-blue-500' };
  }

  return { icon: 'TbFile', className: 'bg-slate-100 text-slate-500' };
};

export const getAnalysisMeta = (item: RecentAnalysisItem): string => {
  const roleLabel = item.role ?? 'Unknown role';
  return `${roleLabel}`;
};
