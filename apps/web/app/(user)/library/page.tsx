import { Card, CardTitle, CardDescription } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Personal Software Library',
  description: 'Manage your saved and pinned applications.',
};

export default function LibraryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white">Personal Software Library</h1>
        <p className="text-zinc-400">Applications you have saved, launched, or pinned.</p>
      </div>

      <Card className="text-center py-16">
        <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <CardTitle className="text-xl">Your library is currently empty</CardTitle>
        <CardDescription className="max-w-md mx-auto mt-2">
          Explore the catalog and bookmark developer applications to access them quickly from your personal dashboard.
        </CardDescription>
      </Card>
    </div>
  );
}
