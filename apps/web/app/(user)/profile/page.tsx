import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { ProfileHeroSection } from '@/features/account/components/ProfileHeroSection';
import { ProfileQuickActions } from '@/features/account/components/ProfileQuickActions';

export const metadata: Metadata = {
  title: 'User Profile | ElseSourav',
  description: 'Manage your ElseSourav profile, identity, and account preferences.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const user = await getUserAccountData();

  if (!user) {
    redirect('/login?next=/profile');
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* Profile Identity Card */}
      <ProfileHeroSection user={user} joinedDate={joinedDate} />

      {/* Account Actions */}
      <ProfileQuickActions />
    </div>
  );
}
