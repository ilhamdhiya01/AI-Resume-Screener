'use client';

import { useEffect, useState } from 'react';

import Icon from '@/components/ui/icon';
import { useJobProgress } from '@/lib/hooks/useJobProgress';

import ProgressItem from './ProgressItem';

interface AnalyzingProps {
  resumeId: string; // 0-100
}

const STEPS = [
  {
    key: 'parsing',
    title: 'Parsing document structure...',
    description: 'Document hierarchy identified.',
  },
  {
    key: 'extracting_skills',
    title: 'Extracting professional skills...',
    description: 'Skill taxonomy mapping.',
  },
  {
    key: 'mapping_timeline',
    title: 'Mapping experience timeline...',
    description: 'Chronological validation in progress.',
  },
  {
    key: 'calculating_score',
    title: 'Calculating match score...',
    description: 'Scoring algorithm running.',
  },
];

const Analyzing = ({ resumeId }: AnalyzingProps) => {
  const { progress, step } = useJobProgress(resumeId);
  const [recordProgress] = useState();

  const size = 192; // size-48 = 192px
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStepStatus = (targetKey: string) => {
    const stepOder = STEPS.map((step) => step.key);
    const currentIndex = stepOder.indexOf(step || '');
    const targetIndex = stepOder.indexOf(targetKey);

    if (currentIndex === -1) return 'pending';
    if (targetIndex < currentIndex) return 'completed';
    if (targetIndex === currentIndex) return 'active';
    return 'pending';
  };

  useEffect(() => {
    console.log({ progress, step });
  }, [progress, step]);

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
              {step}
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
        {/* <div className="flex items-center gap-4 rounded-2xl border border-slate-300 bg-white p-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-200">
            <Icon
              icon="TbCheck"
              className="stroke-3 text-green-600"
              size={20}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-lg leading-none font-semibold">
              Parsing document structure...
            </span>
            <p className="text-sm leading-none text-neutral-500">
              Document hierarchy identified.
            </p>
          </div>
        </div>
        <div className="border-primary-300 bg-primary-100 flex items-center gap-4 rounded-2xl border p-4">
          <div className="bg-primary-200 flex size-8 items-center justify-center rounded-full">
            <Icon
              icon="TbRefresh"
              className="text-primary-700 animate-spin stroke-3"
              size={20}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-primary-700 text-lg leading-none font-semibold">
              Mapping experience timeline...
            </span>
            <p className="text-primary-500 text-sm leading-none">
              Chronological validation in progress.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl p-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-neutral-100">
            <Icon
              icon="TbHourglass"
              className="stroke-3 text-neutral-700/20"
              size={20}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-lg leading-none font-semibold text-neutral-700/30">
              Calculating match score......
            </span>
            <p className="text-sm leading-none text-neutral-500/30">
              Pending extraction data.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-300 bg-white p-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-200">
            <Icon
              icon="TbCheck"
              className="stroke-3 text-green-600"
              size={20}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-lg leading-none font-semibold">
              Parsing document structure...
            </span>
            <p className="text-sm leading-none text-neutral-500">
              Document hierarchy identified.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Analyzing;
