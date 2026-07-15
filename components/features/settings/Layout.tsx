'use client';

import classNames from 'classnames';
import React from 'react';

type SettingsTab = 'profile' | 'ai-preferences' | 'subscription';

interface SettingsLayoutProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
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
const SettingsLayout = ({
  activeTab,
  onTabChange,
  children,
}: SettingsLayoutProps) => (
  <section className="flex flex-col gap-6 p-8">
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your account preferences and analysis configurations.
      </p>
    </div>

    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <nav className="flex shrink-0 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:w-64">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={classNames(
              'rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
              {
                'bg-indigo-50 text-indigo-700': activeTab === tab.id,
                'text-slate-600 hover:bg-slate-50': activeTab !== tab.id,
              }
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  </section>
);

export default SettingsLayout;
