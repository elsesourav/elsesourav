import { Metadata } from 'next';
import Link from 'next/link';
import { getUserLibraryData } from '@/features/library/queries/get-library';
import { UserLibraryView } from '@/features/library/components/UserLibraryView';
import { Badge } from '@elsesourav/ui';
import { ArrowLeft, Bookmark } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Library | ElseSourav',
  description: 'Manage and launch your saved web applications, developer utilities, and tools.',
};

export default async function LibraryPage() {
  const data = await getUserLibraryData();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/apps"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Explore All Applications</span>
        </Link>

        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              My Application Library
            </h1>
            <Badge variant="info" className="text-xs px-2 py-0.5 font-medium">
              {data.totalCount} {data.totalCount === 1 ? 'App' : 'Apps'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Quickly launch and manage software, utilities, and tools you have bookmarked for your
            workflows.
          </p>
        </div>

        {/* User Library Content View */}
        <UserLibraryView initialItems={data.items} totalCount={data.totalCount} />
      </div>
    </div>
  );
}
