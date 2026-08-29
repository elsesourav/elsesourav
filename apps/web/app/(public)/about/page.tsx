import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES, SITE_CONFIG } from '@elsesourav/config';

export const metadata = {
  title: 'About the Creator & Ecosystem',
  description: 'Learn about Sourav, the vision behind ElseSourav, and the architecture.',
  alternates: {
    canonical: 'https://elsesourav.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white">About {SITE_CONFIG.name}</h1>
        <p className="text-zinc-400">Engineering philosophy and platform architecture.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info">Creator</Badge>
            <span className="text-sm font-semibold text-white">Sourav</span>
          </div>
          <CardTitle>Building High-Performance Web Software</CardTitle>
          <CardDescription className="text-zinc-300 space-y-4 pt-2">
            <p>
              ElseSourav is an engineering lab focused on crafting modern, low-latency developer tools,
              terminal emulators, and cloud-native applications.
            </p>
            <p>
              The V2 platform leverages a unified Next.js 15 App Router architecture, PostgreSQL with Prisma ORM,
              Supabase Auth, and Cloudinary media optimization.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
