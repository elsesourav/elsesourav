import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { PageShell } from '@elsesourav/ui';
import { ProfileHeroSection } from '@/features/account/components/ProfileHeroSection';
import { ProfileMetadataGrid } from '@/features/account/components/ProfileMetadataGrid';
import { ProfileQuickActions } from '@/features/account/components/ProfileQuickActions';

export const metadata: Metadata = {
  title: 'Profile & Account Identity | ElseSourav',
  description: 'Manage your ElseSourav user profile, identity, and personal credentials.',
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
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <PageShell size="lg" glow padded={false}>
      <div className="space-y-8">
        {/* Hero: Concentric Neon Avatar + Identity */}
        <ProfileHeroSection user={user} />

        {/* 4-Tile Credentials Grid */}
        <ProfileMetadataGrid user={user} joinedDate={joinedDate} />

        {/* 3-Card Quick Action Hub */}
        <ProfileQuickActions />
      </div>
    </PageShell>
  );
}
