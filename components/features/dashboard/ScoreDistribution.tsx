'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { ScoreDistribution as ScoreDistributionType } from '@/lib/types/dashboard.types';

import DashboardCard from './DashboardCard';

interface ScoreDistributionProps {
  distribution: ScoreDistributionType;
}

export const SEGMENTS = [
  { key: 'high', label: 'High Match', color: '#22c55e' },
  { key: 'medium', label: 'Medium Match', color: '#facc15' },
  { key: 'low', label: 'Low Match', color: '#fca5a5' },
] as const;

const CHART_COLORS = SEGMENTS.map((segment) => segment.color);

const formatCompact = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }

  return String(value);
};

const ScoreDistribution = ({ distribution }: ScoreDistributionProps) => {
  const { high, medium, low, total } = distribution;

  const data = [
    { name: 'High Match', value: high },
    { name: 'Medium Match', value: medium },
    { name: 'Low Match', value: low },
  ];

  return (
    <DashboardCard className="flex h-full flex-col">
      <h2 className="mb-4 text-base font-semibold text-slate-800 sm:mb-6 sm:text-lg">
        Score Distribution
      </h2>

      <div className="flex flex-1 flex-col items-center gap-4 sm:gap-6">
        <div className="relative h-36 w-36 sm:h-40 sm:w-40 lg:h-44 lg:w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800 sm:text-2xl">
              {formatCompact(total)}
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase sm:text-xs">
              Total
            </span>
          </div>
        </div>

        <div className="w-full space-y-2 sm:space-y-3">
          {SEGMENTS.map((segment) => {
            const value = distribution[segment.key];
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;

            return (
              <div key={segment.key} className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-slate-600">{segment.label}</span>
                <span className="ml-auto text-sm font-semibold text-slate-800">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
};

export default ScoreDistribution;
