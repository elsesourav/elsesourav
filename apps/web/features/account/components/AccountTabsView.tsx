'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { useSearchParams } from 'next/navigation';
import { ProfileHeroSection } from './ProfileHeroSection';
import { AccountOverviewCard } from './AccountOverviewCard';
import { ProfileQuickActions } from './ProfileQuickActions';
import { ProfileForm } from './ProfileForm';
import { AccountSection } from './AccountSection';
import { AccountPageSkeleton } from '@/components/skeletons';

interface AccountTabsViewProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
  initialTab?: string;
}

export function AccountTabsView({ user, initialTab }: AccountTabsViewProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') ?? initialTab ?? 'overview';

  const [displayedTab, setDisplayedTab] = React.useState(rawTab);
  const [isTabSwitching, setIsTabSwitching] = React.useState(false);

  React.useEffect(() => {
    if (rawTab !== displayedTab) {
      setIsTabSwitching(true);
      const timer = setTimeout(() => {
        setDisplayedTab(rawTab);
        setIsTabSwitching(false);
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [rawTab, displayedTab]);

  const joinedDate = React.useMemo(() => {
    try {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }, [user.createdAt]);

  const activeTab = isTabSwitching ? rawTab : displayedTab;
  const isSettings = activeTab === 'settings' || activeTab === 'profile';
  const isSecurity = activeTab === 'security' || activeTab === 'account' || activeTab === 'danger';

  if (isTabSwitching) {
    return (
      <div className="w-full transition-opacity duration-150 animate-in fade-in">
        <AccountPageSkeleton tab={rawTab} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <React.Suspense fallback={<AccountPageSkeleton tab={displayedTab} />}>
        {isSettings ? (
          <div className="w-full transition-opacity duration-200">
            <ProfileForm user={user} />
          </div>
        ) : isSecurity ? (
          <div className="w-full transition-opacity duration-200">
            <AccountSection user={user} />
          </div>
        ) : (
          <div className="w-full space-y-2.5 sm:space-y-4 md:space-y-5 lg:space-y-6 transition-opacity duration-200">
            {/* 1. Account Hero Identity Card */}
            <ProfileHeroSection user={user} joinedDate={joinedDate} />

            {/* 2. Security Overview Card */}
            <AccountOverviewCard user={user} joinedDate={joinedDate} />

            {/* 3. Account Actions & Shortcuts */}
            <ProfileQuickActions />
          </div>
        )}
      </React.Suspense>
    </div>
  );
}
