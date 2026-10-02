'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { useSearchParams } from 'next/navigation';
import { AccountSection } from './AccountSection';
import { ProfileForm } from './ProfileForm';

interface SettingsTabsProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

export function SettingsTabs({ user }: SettingsTabsProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const isSecurity = rawTab === 'account' || rawTab === 'security' || rawTab === 'danger';

  return (
    <div className="w-full">
      {isSecurity ? <AccountSection user={user} /> : <ProfileForm user={user} />}
    </div>
  );
}
