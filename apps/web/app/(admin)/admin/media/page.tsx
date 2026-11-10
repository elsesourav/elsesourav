import { AdminMediaGallery } from '@/features/admin/media/components/AdminMediaGallery';
import { getAdminMediaList } from '@/features/admin/media/queries/get-admin-media';
import { Badge } from '@elsesourav/ui';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Media Library | Admin Portal',
  description:
    'Manage Cloudinary media assets, application references, asset uploads, and usage tracking.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminMediaPage() {
  const data = await getAdminMediaList();

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Asset Management
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              {data.items.length} {data.items.length === 1 ? 'Asset' : 'Assets'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Central Media Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Inspect, upload, and organize application assets with automated database reference tracking and storage management.
          </p>
        </div>
      </div>

      <AdminMediaGallery initialData={data} />
    </div>
  );
}
