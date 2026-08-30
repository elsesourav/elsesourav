import * as React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { SettingsTabs } from '@/features/account/components/SettingsTabs';
import { PageShell, PageHeader } from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'Account Settings | ElseSourav',
  description:
    'Manage your profile, public identity, security credentials, and application preferences.',
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
    <PageShell size="lg" glow>
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          eyebrow="Account Control"
          title="Account Settings"
          description="Manage your personal identity, security credentials, and application preferences."
        />

        <React.Suspense fallback={<div className="h-64 rounded-3xl bg-zinc-900/30 border border-zinc-800 animate-pulse" />}>
          <SettingsTabs user={user} />
        </React.Suspense>
      </div>
    </PageShell>
  );
}
