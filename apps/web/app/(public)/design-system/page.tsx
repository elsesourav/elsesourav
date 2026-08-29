import type { Metadata } from 'next';
import { DesignSystemClient } from './client';

export const metadata: Metadata = {
  title: 'Design System Primitives & Tokens',
  description: 'Production-grade, accessible, and responsive UI primitives built for ElseSourav V2.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignSystemPage() {
  return <DesignSystemClient />;
}
