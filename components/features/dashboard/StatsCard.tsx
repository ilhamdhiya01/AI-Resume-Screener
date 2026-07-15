import classNames from 'classnames';
import React from 'react';

import Icon, { type IconName } from '@/components/ui/icon';
import { StatTrend } from '@/lib/types/dashboard.types';

interface StatsCardProps {
  label: string;
  value: string;
  icon: IconName;
  iconClassName?: string;
  trend: StatTrend;
}

const TREND_ICONS: Record<StatTrend['direction'], IconName> = {
  up: 'TbTrendingUp',
  down: 'TbTrendingDown',
  stable: 'TbMinus',
};

const TREND_STYLES: Record<StatTrend['direction'], string> = {
  up: 'bg-green-100 text-green-700',
  down: 'bg-red-100 text-red-700',
  stable: 'bg-slate-100 text-slate-600',
};

const StatsCard = ({
  label,
  value,
  icon,
  iconClassName,
  trend,
}: StatsCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div
        className={classNames(
          'rounded-lg p-2',
          iconClassName || 'bg-slate-100 text-slate-500'
        )}
      >
        <Icon icon={icon} size={24} />
      </div>
    </div>
    <div
      className={classNames(
        'mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        TREND_STYLES[trend.direction]
      )}
    >
      <Icon icon={TREND_ICONS[trend.direction]} size={14} />
      <span>{trend.label}</span>
      {trend.direction !== 'stable' && (
        <span className="opacity-80">{trend.context}</span>
      )}
    </div>
  </div>
);

export default StatsCard;
