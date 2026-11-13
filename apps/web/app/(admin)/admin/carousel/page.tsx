import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, Badge, Button } from '@elsesourav/ui';
import { Plus, GalleryHorizontalEnd } from 'lucide-react';
import { getAdminCarouselSlides } from '@/features/admin/carousel/queries/get-admin-carousel';
import { AdminCarouselTable } from '@/features/admin/carousel/components/AdminCarouselTable';

export const metadata: Metadata = {
  title: 'Hero Carousel CMS | Admin Portal',
  description: 'Manage featured hero carousel slides, banner visuals, and promotional cards.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCarouselPage() {
  const slides = await getAdminCarouselSlides();
  const activeCount = slides.filter((s) => s.isActive).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-6">
        <PageHeader
          eyebrow="Hero Carousel CMS"
          badge={
            <div className="flex items-center gap-1.5">
              <Badge
                variant="primary"
                className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 font-medium"
              >
                {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'}
              </Badge>
              <Badge
                variant="success"
                className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 font-medium"
              >
                {activeCount} Live
              </Badge>
            </div>
          }
          title="Hero Carousel Management"
          description="Manage independent top showcase banners across the public catalog and homepage with responsive 21:9 desktop and 3:4 mobile visuals."
          className="pb-0 mb-0"
        />

        <Link href="/admin/carousel/new" className="shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl gap-1.5 shadow-md shadow-indigo-600/20 w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Add Hero Slide</span>
          </Button>
        </Link>
      </div>

      {/* Table & Cards Management */}
      <AdminCarouselTable initialSlides={slides} />
    </div>
  );
}
