'use client';

import { useSession } from 'next-auth/react';
import React from 'react';

import Button from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAnalysisLimit } from '@/lib/hooks/analysis/useAnalysisLimit';

const PRO_BENEFITS = [
  'Unlimited resume parsing and analysis',
  'Advanced semantic matching engine',
  'Custom scoring rubrics and standards',
  'Priority email and chat support',
  'Export reports in PDF and CSV',
];

const FREE_BENEFITS = [
  'Up to 4 resume analyses',
  'Standard ATS scoring',
  'Basic analysis dashboard',
];

/**
 * @description Subscription tab UI (static, no payment logic yet).
 */
const SubscriptionTab = React.memo(() => {
  const session = useSession();
  const { credit, isPending } = useAnalysisLimit();

  const role = session.data?.user?.role ?? 'FREE';
  const isPro = role === 'PRO' || role === 'ADMIN';
  const planLabel = isPro ? 'Pro Plan' : 'Free Plan';
  const benefits = isPro ? PRO_BENEFITS : FREE_BENEFITS;

  const used = credit?.used ?? 0;
  const limit = credit?.limit;
  const progress = limit ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800 md:mb-6">
          Subscription
        </h2>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600">Current Plan</p>
                  <p className="text-xl font-semibold text-slate-800">
                    {planLabel}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  ACTIVE
                </span>
              </div>

              {!isPro && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Usage Overview
                  </p>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Analysis Credits</span>
                    <span className="font-medium text-slate-800">
                      {isPending ? '—' : `${used} / ${limit ?? '∞'}`}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-5">
                <Button
                  type="button"
                  variant="contained"
                  label={isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                  fullWidth
                  disabled
                  className="bg-indigo-600 hover:bg-indigo-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-4 text-sm font-semibold text-slate-800">
              Plan Benefits
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm">
                  <Icon
                    icon="TbCheck"
                    className="mt-0.5 shrink-0 text-indigo-600"
                    size={16}
                  />
                  <span className="text-slate-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

SubscriptionTab.displayName = 'SubscriptionTab';

export default SubscriptionTab;
