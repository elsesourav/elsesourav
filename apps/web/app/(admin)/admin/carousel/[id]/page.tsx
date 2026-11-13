import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminCarouselSlideById } from '@/features/admin/carousel/queries/get-admin-carousel';
import { AdminCarouselForm } from '@/features/admin/carousel/components/AdminCarouselForm';

interface EditAdminCarouselSlidePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditAdminCarouselSlidePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const slide = await getAdminCarouselSlideById(id);
    return {
      title: `Edit Slide: ${slide.title} | Admin Portal`,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: 'Edit Carousel Slide | Admin Portal',
      robots: { index: false, follow: false },
    };
  }
}

export default async function EditAdminCarouselSlidePage({
  params,
}: EditAdminCarouselSlidePageProps) {
  const { id } = await params;

  try {
    const slide = await getAdminCarouselSlideById(id);
    return (
      <div className="w-full max-w-7xl mx-auto">
        <AdminCarouselForm slide={slide} />
      </div>
    );
  } catch {
    notFound();
  }
}
