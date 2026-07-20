import classNames from 'classnames';
import React from 'react';

import Icon, { type IconName } from '@/components/ui/icon';
import { StatTrend } from '@/lib/types/dashboard.types';

import DashboardCard from './DashboardCard';

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
  <DashboardCard>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
          {value}
        </p>
      </div>
      <div
        className={classNames(
          'shrink-0 rounded-lg p-2',
          iconClassName || 'bg-slate-100 text-slate-500'
        )}
      >
        <Icon icon={icon} size={22} className="sm:size-6" />
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
  </DashboardCard>
);

export default StatsCard;
