'use client';

import React from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import { ScoreDistribution as ScoreDistributionType } from '@/lib/types/dashboard.types';

interface ScoreDistributionProps {
  distribution: ScoreDistributionType;
}

const SEGMENTS = [
  { key: 'high', label: 'High Match', color: '#22c55e' },
  { key: 'medium', label: 'Medium Match', color: '#facc15' },
  { key: 'low', label: 'Low Match', color: '#fca5a5' },
] as const;

const formatCompact = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }

  return String(value);
};

const ScoreDistribution = ({ distribution }: ScoreDistributionProps) => {
  const { high, medium, low, total } = distribution;

  const data = [
    { name: 'High Match', value: high, color: '#22c55e' },
    { name: 'Medium Match', value: medium, color: '#facc15' },
    { name: 'Low Match', value: low, color: '#fca5a5' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-slate-800">
        Score Distribution
      </h2>

      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <PieChart width={165} height={165}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx={80}
              cy={80}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">
              {formatCompact(total)}
            </span>
            <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Total
            </span>
          </div>
        </div>

        <div className="w-full space-y-3">
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
    </div>
  );
};

export default ScoreDistribution;
