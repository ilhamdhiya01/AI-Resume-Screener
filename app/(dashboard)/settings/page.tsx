import React from 'react';

import SettingsLayout from '@/components/features/settings/Layout';
import AIPreferencesTab from '@/components/features/settings/tabs/AIPreferencesTab';
import ProfileTab from '@/components/features/settings/tabs/ProfileTab';
import SubscriptionTab from '@/components/features/settings/tabs/SubscriptionTab';

type SettingsTab = 'profile' | 'ai-preferences' | 'subscription';

interface SettingsPageProps {
  searchParams: Promise<{
    tab?: SettingsTab;
  }>;
}

const TAB_COMPONENTS: Record<SettingsTab, React.ReactNode> = {
  profile: <ProfileTab />,
  'ai-preferences': <AIPreferencesTab />,
  subscription: <SubscriptionTab />,
};

const SettingsPage = async ({ searchParams }: SettingsPageProps) => {
  const resolvedParams = await searchParams;

  const initialTab = resolvedParams.tab || 'profile';

  return (
    <SettingsLayout activeTab={initialTab}>
      {TAB_COMPONENTS[initialTab]}
    </SettingsLayout>
  );
};

export default SettingsPage;
