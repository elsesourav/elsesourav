'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@elsesourav/types';
import { ProfileForm } from './ProfileForm';
import { AccountSection } from './AccountSection';
import { SecuritySection } from './SecuritySection';
import { User as UserIcon, UserCheck, Shield } from 'lucide-react';

interface SettingsTabsProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

type TabType = 'profile' | 'account' | 'security';

export function SettingsTabs({ user }: SettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const initialTab: TabType = (rawTab === 'account' || rawTab === 'security' || rawTab === 'danger')
    ? (rawTab === 'danger' ? 'security' : (rawTab as TabType))
    : 'profile';

  const [activeTab, setActiveTab] = React.useState<TabType>(initialTab);

  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'account' || tab === 'security') {
      setActiveTab(tab);
    } else if (tab === 'danger') {
      setActiveTab('security');
    }
  }, [searchParams]);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="space-y-8">
      {/* Tabs Switcher */}
      <div className="inline-flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border text-xs overflow-x-auto no-scrollbar shadow-sm max-w-full">
        <button
          type="button"
          onClick={() => handleSelectTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-background text-foreground shadow-sm font-semibold ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5 text-primary" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('account')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'account'
              ? 'bg-background text-foreground shadow-sm font-semibold ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-primary" />
          <span>Account</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-background text-foreground shadow-sm font-semibold ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Password & Security</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && <ProfileForm user={user} />}
      {activeTab === 'account' && <AccountSection user={user} />}
      {activeTab === 'security' && <SecuritySection user={user} />}
    </div>
  );
}
