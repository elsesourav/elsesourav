'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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

  return (
    <div className="space-y-8">
      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-zinc-800 text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-zinc-800 text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>Password & Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-zinc-800 text-white shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('danger')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            activeTab === 'danger'
              ? 'bg-rose-950/60 border border-rose-500/30 text-rose-300 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-rose-300'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
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
