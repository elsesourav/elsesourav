'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@elsesourav/types';
import { ProfileForm } from './ProfileForm';
import { PreferencesForm } from './PreferencesForm';
import { SecuritySection } from './SecuritySection';
import { DangerZone } from './DangerZone';
import { User as UserIcon, Sliders, Shield, ShieldAlert } from 'lucide-react';

interface SettingsTabsProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

type TabType = 'profile' | 'preferences' | 'security' | 'danger';

export function SettingsTabs({ user }: SettingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'profile';

  const [activeTab, setActiveTab] = React.useState<TabType>(
    ['profile', 'preferences', 'security', 'danger'].includes(initialTab)
      ? initialTab
      : 'profile'
  );

  React.useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['profile', 'preferences', 'security', 'danger'].includes(tab)) {
      setActiveTab(tab);
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
          <span>Edit Profile</span>
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

        <button
          type="button"
          onClick={() => handleSelectTab('preferences')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-background text-foreground shadow-sm font-semibold ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-primary" />
          <span>Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('danger')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'danger'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Danger Zone</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && <ProfileForm user={user} />}
      {activeTab === 'security' && <SecuritySection user={user} />}
      {activeTab === 'preferences' && <PreferencesForm user={user} />}
      {activeTab === 'danger' && <DangerZone />}
    </div>
  );
}
