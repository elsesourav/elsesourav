import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicAppBySlug, getPublishedApps } from '@/features/apps/queries/get-apps';
import { AppDetailHero } from '@/features/apps/components/AppDetailHero';
import { AppScreenshotGallery } from '@/features/apps/components/AppScreenshotGallery';
import { AppDetailLinks } from '@/features/apps/components/AppDetailLinks';
import { AppVersionHistory } from '@/features/apps/components/AppVersionHistory';
import { AppCard } from '@/features/apps/components/AppCard';
import { Card } from '@elsesourav/ui';
import { Sparkles, FileText } from 'lucide-react';

interface AppDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const app = await getPublicAppBySlug(slug);
    const title = `${app.name} — Software & Tools`;
    const canonicalUrl = `https://elsesourav.com/apps/${app.slug}`;
    return {
      title,
      description: app.shortDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} | ElseSourav`,
        description: app.shortDescription,
        url: canonicalUrl,
        siteName: 'ElseSourav',
        type: 'website',
        images: app.featuredImageUrl ? [{ url: app.featuredImageUrl, width: 1200, height: 630, alt: app.name }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ElseSourav`,
        description: app.shortDescription,
        images: app.featuredImageUrl ? [app.featuredImageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: 'Application Not Found',
      description: 'The requested application could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;

  let app;
  try {
    app = await getPublicAppBySlug(slug);
  } catch {
    notFound();
  }

  // Fetch related applications in the same category (bounded query)
  const relatedApps = await getPublishedApps({
    categorySlug: app.categorySlug,
    limit: 4,
  }).then((items) => items.filter((item) => item.id !== app.id).slice(0, 3));

  const appUrl = `https://elsesourav.com/apps/${app.slug}`;

  // JSON-LD Structured Data for SoftwareApplication & BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${appUrl}/#software`,
        name: app.name,
        description: app.shortDescription,
        applicationCategory: app.primaryCategory,
        operatingSystem: app.platforms.join(', '),
        softwareVersion: app.currentVersion,
        url: appUrl,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Organization',
          name: 'ElseSourav',
          url: 'https://elsesourav.com',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${appUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://elsesourav.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Applications',
            item: 'https://elsesourav.com/apps',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: app.name,
            item: appUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* App Hero Section */}
        <AppDetailHero app={app} />

        {/* Screenshot Gallery if available */}
        <AppScreenshotGallery appName={app.name} screenshots={app.screenshots} />

        {/* Detailed Description */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> About {app.name}
          </h2>
          <Card className="p-6 rounded-2xl border-zinc-800/80 bg-zinc-900/30">
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line space-y-4">
              {app.description}
            </div>
          </Card>
        </div>

        {/* Platform Downloads & Links */}
        <AppDetailLinks links={app.links} />

        {/* Version History & Changelog */}
        <AppVersionHistory versions={app.versions} />

        {/* Related Apps Section */}
        {relatedApps.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-zinc-800/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Related in {app.primaryCategory}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedApps.map((related) => (
                <AppCard key={related.id} app={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
