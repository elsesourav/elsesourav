import * as React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { AccountTabsView } from '@/features/account/components/AccountTabsView';
import { AccountPageSkeleton } from '@/components/skeletons';

export const metadata: Metadata = {
  title: 'Account | ElseSourav',
  description: 'Manage your ElseSourav account, settings, security, and preferences.',
  robots: {
    index: false,
    follow: false,
  },
};

interface AccountPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getUserAccountData();

  if (!user) {
    redirect('/login?next=/account');
  }

  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.tab;

  return (
    <div className="w-full">
      <React.Suspense fallback={<AccountPageSkeleton tab={currentTab} />}>
        <AccountTabsView user={user} initialTab={currentTab} />
      </React.Suspense>
    </div>
  );
}
