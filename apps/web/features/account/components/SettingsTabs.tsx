'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { SegmentedControl } from '@elsesourav/ui/interior';
import { AccountSection } from './AccountSection';
import { ProfileForm } from './ProfileForm';

interface SettingsTabsProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

type TabType = 'profile' | 'account';

const TAB_OPTIONS = [
  { value: 'profile', label: 'Profile' },
  { value: 'account', label: 'Account & Security' },
];

export function SettingsTabs({ user }: SettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabType =
    rawTab === 'account' || rawTab === 'security' || rawTab === 'danger' ? 'account' : 'profile';

  const handleTabChange = (nextTab: string) => {
    router.push(`/settings?tab=${nextTab}`, { scroll: false });
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex justify-start">
        <SegmentedControl
          label="Settings navigation"
          options={TAB_OPTIONS}
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full sm:w-auto"
        />
      </div>

      {activeTab === 'profile' && <ProfileForm user={user} />}
      {activeTab === 'account' && <AccountSection user={user} />}
    </div>
  );
}
