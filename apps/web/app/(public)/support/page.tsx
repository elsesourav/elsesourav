import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Engineering Support Portal',
  description: 'Submit an issue, bug report, or technical question.',
};

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white">Engineering Support</h1>
        <p className="text-zinc-400">Open a ticket directly with the engineering team.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
          <CardDescription>We aim to respond to all technical queries within 24 hours.</CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Subject</label>
            <Input placeholder="Brief summary of the issue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description</label>
            <textarea
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[120px]"
              placeholder="Detailed description of the steps to reproduce or issue context"
            />
          </div>
          <Button className="w-full">Submit Ticket</Button>
        </div>
      </Card>
    </div>
  );
}
