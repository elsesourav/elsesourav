import type { Metadata } from 'next';
import { SkeletonShowcaseClient } from './client';

export const metadata: Metadata = {
  title: 'Skeleton Loading System Showcase & Visual QA',
  description: 'Visual matrix and structure-matching verification for all page skeletons.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SkeletonShowcasePage() {
  return <SkeletonShowcaseClient />;
}
