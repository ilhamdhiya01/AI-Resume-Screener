'use client';

import { useEffect } from 'react';

import { useJobProgress } from '@/lib/hooks/useJobProgress';

import ProgressItem from './ProgressItem';

interface AnalyzingProps {
  resumeId: string;
}

const STEPS = [
  {
    key: 'parsing',
    title: 'Parsing document structure',
    description: 'Document hierarchy identified.',
  },
  {
    key: 'extracting_skills',
    title: 'Extracting professional skills',
    description: 'Skill taxonomy mapping.',
  },
  {
    key: 'mapping_timeline',
    title: 'Mapping experience timeline',
    description: 'Chronological validation in progress.',
  },
  {
    key: 'calculating_score',
    title: 'Calculating match score',
    description: 'Scoring algorithm running.',
  },
];

const Analyzing = ({ resumeId }: AnalyzingProps) => {
  const { progress, step, status } = useJobProgress(resumeId);

  const size = 192; // size-48 = 192px
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStepStatus = (targetKey: string) => {
    const stepOder = STEPS.map((step) => step.key);
    const currentIndex = stepOder.indexOf(step || '');
    const targetIndex = stepOder.indexOf(targetKey);

    if (progress >= 100 || status === 'completed') {
      return 'completed';
    }

    if (currentIndex === -1) return 'pending';
    if (targetIndex === currentIndex) return 'active';
    if (targetIndex < currentIndex) return 'completed';
    return 'pending';
  };

  useEffect(() => {
    console.log({ progress, step, status });
  }, [progress, step, status]);

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="w-full max-w-2xl">
        <div className="relative mx-auto flex size-48 items-center justify-center">
          {/* SVG Progress Circle */}
          <svg width={size} height={size} className="absolute -rotate-90">
            {/* Background circle (gray) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#cbd5e1" // slate-300
              strokeWidth={strokeWidth}
            />
            {/* Progress circle (blue) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#6366f1" // primary color
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>

          {/* Inner circle */}
          <div className="flex size-45 flex-col items-center justify-center gap-1 rounded-full border border-slate-300 bg-transparent">
            {/* Percentage text */}
            <span className="text-primary-700 text-3xl font-bold">
              {progress}%
            </span>
            <span className="font-semibold text-neutral-600 uppercase">
              {progress === 100 ? 'completed' : 'processing'}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold">Processing Resume</h2>
        <p className="text-neutral-700">
          Our AI engine is currently deep-scanning the document <br />
          structure to extract professional insights.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4">
        {STEPS.map((item) => (
          <ProgressItem
            key={item.key}
            title={item.title}
            description={item.description}
            isActive={getStepStatus(item.key) === 'active'}
            isCompleted={getStepStatus(item.key) === 'completed'}
          />
        ))}
      </div>
    </div>
  );
};

export default Analyzing;
