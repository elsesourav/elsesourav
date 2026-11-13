import { Metadata } from 'next';
import { AdminCarouselForm } from '@/features/admin/carousel/components/AdminCarouselForm';

export const metadata: Metadata = {
  title: 'Create Carousel Slide | Admin Portal',
  description: 'Add a new hero carousel slide to the public apps showcase.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminNewCarouselSlidePage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <AdminCarouselForm />
    </div>
  );
}
