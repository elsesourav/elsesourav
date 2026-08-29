import { Metadata } from 'next';
import { getAdminMediaList } from '@/features/admin/media/queries/get-admin-media';
import { AdminMediaGallery } from '@/features/admin/media/components/AdminMediaGallery';

export const metadata: Metadata = {
  title: 'Media Library | Admin Portal',
  description: 'Manage Cloudinary media assets, application references, asset uploads, and usage tracking.',
};

export default async function AdminMediaPage() {
  const data = await getAdminMediaList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          Cloudinary Media Library
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Inspect, upload, and manage application assets stored in Cloudinary with automated database reference detection.
        </p>
      </div>

      <AdminMediaGallery initialData={data} />
    </div>
  );
}
