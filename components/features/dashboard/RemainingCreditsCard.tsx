'use client';

import React from 'react';

import Icon from '@/components/ui/icon';
import { CreditInfo } from '@/lib/types/dashboard.types';

interface RemainingCreditsCardProps {
  creditInfo: CreditInfo;
}

const RemainingCreditsCard = ({ creditInfo }: RemainingCreditsCardProps) => {
  const { used, limit } = creditInfo;
  const remaining = limit !== null ? Math.max(0, limit - used) : 0;
  const progress = limit ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-600 text-sm font-medium">
            Remaining Credits
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {limit !== null ? (
              <>
                {remaining}{' '}
                <span className="text-xl font-medium text-slate-400">
                  / {limit}
                </span>
              </>
            ) : (
              'Unlimited'
            )}
          </p>
        </div>
        <div className="bg-primary-100 text-primary-600 rounded-lg p-2">
          <Icon icon="TbBox" size={24} />
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
    </div>
  );
};

export default RemainingCreditsCard;
