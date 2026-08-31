'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import type { User } from '@elsesourav/types';
import { ProfileForm } from './ProfileForm';
import { AccountSection } from './AccountSection';
import { SecuritySection } from './SecuritySection';

interface SettingsTabsProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

type TabType = 'profile' | 'account' | 'security';

export function SettingsTabs({ user }: SettingsTabsProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabType = (rawTab === 'account' || rawTab === 'security' || rawTab === 'danger')
    ? (rawTab === 'danger' ? 'security' : (rawTab as TabType))
    : 'profile';

  return (
    <div className="w-full">
      {activeTab === 'profile' && <ProfileForm user={user} />}
      {activeTab === 'account' && <AccountSection user={user} />}
      {activeTab === 'security' && <SecuritySection user={user} />}
    </div>
  );
}
