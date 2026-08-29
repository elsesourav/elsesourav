import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES, SITE_CONFIG } from '@elsesourav/config';

export const metadata: Metadata = {
  title: 'About the Creator & Ecosystem',
  description: 'Learn about Sourav, the engineering philosophy behind ElseSourav, and its cloud-native architecture.',
  alternates: {
    canonical: 'https://elsesourav.com/about',
  },
  openGraph: {
    title: 'About the Creator & Ecosystem | ElseSourav',
    description: 'Learn about Sourav and the engineering philosophy behind ElseSourav.',
    url: 'https://elsesourav.com/about',
    siteName: SITE_CONFIG.name,
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: 'About the Creator & Ecosystem | ElseSourav',
    description: 'Learn about Sourav and the engineering philosophy behind ElseSourav.',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About ElseSourav & Creator',
    description: 'Engineering philosophy and platform architecture behind ElseSourav.',
    url: 'https://elsesourav.com/about',
    mainEntity: {
      '@type': 'Person',
      name: 'Sourav',
      jobTitle: 'Systems Engineer & Software Creator',
      url: SITE_CONFIG.url,
      sameAs: [SITE_CONFIG.links.github, SITE_CONFIG.links.twitter],
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              The platform leverages a unified Next.js 15 App Router architecture, PostgreSQL with Prisma ORM,
              Supabase Auth, and Cloudinary media optimization.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
