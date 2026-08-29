import { Metadata } from 'next';
import Link from 'next/link';
import { getUserLibraryData } from '@/features/library/queries/get-library';
import { UserLibraryView } from '@/features/library/components/UserLibraryView';
import { PageShell, PageHeader, Badge } from '@elsesourav/ui';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Library | ElseSourav',
  description: 'Manage and launch your saved web applications, developer utilities, and tools.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LibraryPage() {
  const data = await getUserLibraryData();

  return (
    <PageShell size="lg" glow>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <Link
          href="/apps"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Explore All Applications</span>
        </Link>

        {/* Page Header */}
        <PageHeader
          eyebrow="Personal Workspace"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              {data.totalCount} {data.totalCount === 1 ? 'App' : 'Apps'}
            </Badge>
          }
          title="My Application Library"
          description="Quickly launch and manage software, utilities, and tools you have bookmarked for your workflows."
        />

        {/* User Library Content View */}
        <UserLibraryView initialItems={data.items} totalCount={data.totalCount} />
      </div>
    </PageShell>
  );
}
