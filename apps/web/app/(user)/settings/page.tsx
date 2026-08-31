import * as React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { SettingsTabs } from '@/features/account/components/SettingsTabs';

export const metadata: Metadata = {
  title: 'Settings | ElseSourav',
  description: 'Manage your profile, public identity, security credentials, and account settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  const user = await getUserAccountData();

  if (!user) {
    redirect('/login?next=/settings');
  }

  return (
    <div className="w-full">
      <React.Suspense
        fallback={
          <div className="h-64 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border animate-pulse" />
        }
      >
        <SettingsTabs user={user} />
      </React.Suspense>
    </div>
  );
}
