import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserAccountData } from '@/features/account/queries/get-account';
import { Card, Badge, Button } from '@elsesourav/ui';
import { Mail, Shield, Calendar, Key, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Profile | ElseSourav',
  description: 'Manage your ElseSourav user profile and identity.',
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Your unified ElseSourav identity and account details.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400 overflow-hidden shrink-0">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user.displayName?.slice(0, 2).toUpperCase() || 'U'}</span>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">
                {user.displayName || 'ElseSourav Member'}
              </h2>
              {user.username && (
                <span className="text-xs text-zinc-400 font-mono">@{user.username}</span>
              )}
              <Badge variant="info" className="text-[10px] font-mono">
                {user.role}
              </Badge>
              {user.status === 'active' && (
                <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <CheckCircle className="w-2.5 h-2.5" /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">{user.email}</p>
            {user.bio && <p className="text-xs text-zinc-300 pt-1 leading-relaxed">{user.bio}</p>}
          </div>

          <Link href="/settings">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs">
              Edit Settings
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/60 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1">
            <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5" /> Primary Email
            </div>
            <div className="text-zinc-200 font-semibold">{user.email}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1">
            <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5" /> Account Role
            </div>
            <div className="text-zinc-200 font-semibold">{user.role} Permissions</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1">
            <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <Key className="w-3.5 h-3.5" /> Supabase ID
            </div>
            <div className="text-zinc-200 font-mono text-[11px] truncate">
              {user.supabaseAuthId}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-1">
            <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Member Since
            </div>
            <div className="text-zinc-200 font-semibold">{joinedDate}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
