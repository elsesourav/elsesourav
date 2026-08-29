import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { SettingsTabs } from '@/features/account/components/SettingsTabs';

export const metadata: Metadata = {
  title: 'Account Settings | ElseSourav',
  description: 'Manage your profile, public identity, security credentials, and application preferences.',
};

export default async function SettingsPage() {
  const user = await getUserAccountData();

  if (!user) {
    redirect('/login?next=/settings');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Manage your personal identity, security credentials, and application preferences.
        </p>
      </div>

      <SettingsTabs user={user} />
    </div>
  );
}
