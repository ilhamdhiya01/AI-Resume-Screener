'use client';

import React, { useState } from 'react';

import SettingsLayout from '@/components/features/settings/Layout';
import AIPreferencesTab from '@/components/features/settings/tabs/AIPreferencesTab';
import ProfileTab from '@/components/features/settings/tabs/ProfileTab';
import SubscriptionTab from '@/components/features/settings/tabs/SubscriptionTab';

type SettingsTab = 'profile' | 'ai-preferences' | 'subscription';

const TAB_COMPONENTS: Record<SettingsTab, React.ReactNode> = {
  profile: <ProfileTab />,
  'ai-preferences': <AIPreferencesTab />,
  subscription: <SubscriptionTab />,
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {TAB_COMPONENTS[activeTab]}
    </SettingsLayout>
  );
};

export default SettingsPage;
