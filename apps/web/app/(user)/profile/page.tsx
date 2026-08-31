import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { PageShell, PageHeader, Badge, Button } from '@elsesourav/ui';
import { Sparkles, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { ProfileDetailsCard } from '@/features/account/components/ProfileDetailsCard';

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
    <PageShell size="lg" glow>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            eyebrow="Account Control"
            badge={
              <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Verified Member</span>
              </Badge>
            }
            title="User Profile"
            description="Your unified ElseSourav developer identity, account credentials, and platform profile."
          />

          <div className="flex items-center gap-2 shrink-0 sm:pt-4">
            <Link href="/settings?tab=profile">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-300 text-xs gap-1.5 rounded-xl hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Profile</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all font-semibold"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Card with Micro-Interactions */}
        <ProfileDetailsCard user={user} joinedDate={joinedDate} />
      </div>
    </PageShell>
  );
}
