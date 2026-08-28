import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Account Settings',
  description: 'Manage your profile and platform preferences.',
};

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-zinc-400">Manage your identity, theme preferences, and security settings.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your public display name and biography.</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Display Name</label>
              <Input defaultValue="Developer User" />
            </div>
            <Button size="sm">Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
