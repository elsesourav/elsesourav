import { AdminMediaGallery } from '@/features/admin/media/components/AdminMediaGallery';
import { getAdminMediaList } from '@/features/admin/media/queries/get-admin-media';
import { PageHeader, Badge } from '@elsesourav/ui';
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        eyebrow="Asset Management"
        badge={
          <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
            {data.items.length} {data.items.length === 1 ? 'Asset' : 'Assets'}
          </Badge>
        }
        title="Central Media Library"
        description="Inspect, upload, and organize application assets with automated database reference tracking and category filtering."
      />

      <AdminMediaGallery initialData={data} />
    </div>
  );
}
