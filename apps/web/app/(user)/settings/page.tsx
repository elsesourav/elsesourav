import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@elsesourav/ui';
import { User, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings | ElseSourav',
  description: 'Manage your profile, security, and account preferences.',
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    redirect('/login?next=/settings');
  }

  const { user } = session;

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

      <div className="space-y-6">
        {/* Profile Settings Card */}
        <Card className="rounded-2xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <CardTitle className="text-base text-zinc-100">Profile Information</CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-400">
              Your public name and profile identity.
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Display Name</label>
              <Input
                defaultValue={user.displayName || ''}
                placeholder="Enter your name"
                className="bg-zinc-950/60 border-zinc-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
              <Input
                defaultValue={user.email}
                disabled
                className="bg-zinc-950/40 border-zinc-800 text-xs text-zinc-500 cursor-not-allowed"
              />
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs">
              Save Profile Changes
            </Button>
          </div>
        </Card>

        {/* Security Settings Card */}
        <Card className="rounded-2xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-base text-zinc-100">Security & Authentication</CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-400">
              Manage credentials, authentication providers, and sessions.
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Password</h4>
                <p className="text-[11px] text-zinc-400">Update your account password securely via reset flow.</p>
              </div>
              <Button variant="outline" size="sm" className="border-zinc-700 text-xs text-zinc-300">
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
