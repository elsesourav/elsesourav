'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { useSearchParams } from 'next/navigation';
import { AccountSection } from './AccountSection';
import { ProfileForm } from './ProfileForm';

interface SettingsTabsProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

type TabType = 'profile' | 'account';

export function SettingsTabs({ user }: SettingsTabsProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabType =
    rawTab === 'account' || rawTab === 'security' || rawTab === 'danger' ? 'account' : 'profile';

  return (
    <div className="w-full">
      {activeTab === 'profile' && <ProfileForm user={user} />}
      {activeTab === 'account' && <AccountSection user={user} />}
    </div>
  );
}
