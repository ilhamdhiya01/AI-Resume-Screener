'use client';

import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useCallback } from 'react';

type SettingsTab = 'profile' | 'ai-preferences' | 'subscription';

interface SettingsLayoutProps {
  activeTab: SettingsTab;
  children: React.ReactNode;
}

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'ai-preferences', label: 'AI Preferences' },
  { id: 'subscription', label: 'Subscription' },
];

/**
 * @description Layout for the Settings page with tab navigation.
 */
const SettingsLayout = ({ activeTab, children }: SettingsLayoutProps) => {
  const session = useSession();
  const user = session.data?.user;
  const router = useRouter();

  const handleTabChange = useCallback(
    (newTab: SettingsTab) => {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', newTab);
      router.push(`/settings?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  return (
    <section className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account preferences and analysis configurations.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav className="flex shrink-0 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:w-64">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled =
              user?.role === 'FREE' && tab.id === 'ai-preferences';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !isDisabled && handleTabChange(tab.id)}
                className={classNames(
                  'relative cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors select-none',
                  {
                    'bg-indigo-50 text-indigo-700': isActive,
                    'text-slate-600 hover:bg-slate-50': !isActive,
                    'pointer-events-none cursor-not-allowed': isDisabled,
                  }
                )}
              >
                <span
                  className={classNames({
                    'opacity-50': isDisabled,
                  })}
                >
                  {tab.label}
                </span>
                {isDisabled && (
                  <small className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] text-white">
                    Pro
                  </small>
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
};

export default SettingsLayout;
