'use client';

import React from 'react';

import Icon from '@/components/ui/icon';
import { CreditInfo } from '@/lib/types/dashboard.types';

import DashboardCard from './DashboardCard';

interface RemainingCreditsCardProps {
  creditInfo: CreditInfo;
}

const RemainingCreditsCard = ({ creditInfo }: RemainingCreditsCardProps) => {
  const { used, limit } = creditInfo;
  const remaining = limit !== null ? Math.max(0, limit - used) : 0;
  const progress = limit ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-primary-600 text-xs font-medium sm:text-sm">
            Remaining Credits
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
            {limit !== null ? (
              <>
                {remaining}{' '}
                <span className="text-lg font-medium text-slate-400 sm:text-xl">
                  / {limit}
                </span>
              </>
            ) : (
              'Unlimited'
            )}
          </p>
        </div>
        <div className="bg-primary-100 text-primary-600 shrink-0 rounded-lg p-2">
          <Icon icon="TbBox" size={22} className="sm:size-6" />
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="bg-primary-600 h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {limit !== null
            ? `${used} used · ${remaining} remaining`
            : 'Unlimited analyses'}
        </p>
      </div>
    </DashboardCard>
  );
};

export default RemainingCreditsCard;
