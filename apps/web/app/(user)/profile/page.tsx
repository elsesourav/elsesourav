import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { PageShell, PageHeader, Card, Badge, Button } from '@elsesourav/ui';
import { Mail, Shield, Calendar, Key, CheckCircle, Settings, User, Lock, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Profile & Account Identity | ElseSourav',
  description: 'Manage your ElseSourav user profile and identity.',
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
        <PageHeader
          eyebrow="Account Identity"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              Verified Member
            </Badge>
          }
          title="User Profile"
          description="Your unified ElseSourav identity, credentials, and account details."
        />

        {/* Main Profile Info Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-zinc-800/60">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 overflow-hidden shrink-0 shadow-lg shadow-indigo-950/40">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.displayName?.slice(0, 2).toUpperCase() || 'U'}</span>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-zinc-100">
                    {user.displayName || 'ElseSourav Member'}
                  </h2>
                  {user.username && (
                    <span className="text-xs text-indigo-400 font-mono">@{user.username}</span>
                  )}
                  <Badge variant="info" className="text-[10px] font-mono">
                    {user.role}
                  </Badge>
                  {user.status === 'active' && (
                    <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{user.email}</p>
                {user.bio && <p className="text-xs text-zinc-300 pt-1 leading-relaxed">{user.bio}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Link href="/settings?tab=profile">
                <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 text-xs gap-1.5 rounded-xl hover:bg-zinc-800">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 rounded-xl shadow-lg shadow-indigo-600/20">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Account Settings</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Account Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-1.5 shadow-sm">
              <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Primary Email
              </div>
              <div className="text-zinc-200 font-semibold">{user.email}</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-1.5 shadow-sm">
              <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Account Permissions
              </div>
              <div className="text-zinc-200 font-semibold">{user.role} Authorization</div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-1.5 shadow-sm">
              <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <Key className="w-3.5 h-3.5 text-emerald-400" /> Supabase Authentication ID
              </div>
              <div className="text-zinc-200 font-mono text-[11px] truncate">
                {user.supabaseAuthId}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-1.5 shadow-sm">
              <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Member Since
              </div>
              <div className="text-zinc-200 font-semibold">{joinedDate}</div>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="pt-2 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/settings?tab=security"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 hover:bg-zinc-800/40 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">Security & Password</p>
                  <p className="text-[11px] text-zinc-500">Update password and auth settings</p>
                </div>
              </div>
              <span className="text-xs text-indigo-400 font-medium">Manage &rarr;</span>
            </Link>

            <Link
              href="/support/tickets"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 hover:bg-zinc-800/40 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">Help & Support</p>
                  <p className="text-[11px] text-zinc-500">Submit or check support tickets</p>
                </div>
              </div>
              <span className="text-xs text-indigo-400 font-medium">View &rarr;</span>
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
