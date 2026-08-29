import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_CONFIG } from '@elsesourav/config';
import { getPublicAppBySlug, getPublishedApps } from '@/features/apps/queries/get-apps';
import { AppDetailHero } from '@/features/apps/components/AppDetailHero';
import { AppScreenshotGallery } from '@/features/apps/components/AppScreenshotGallery';
import { AppDetailLinks } from '@/features/apps/components/AppDetailLinks';
import { AppVersionHistory } from '@/features/apps/components/AppVersionHistory';
import { AppCard } from '@/features/apps/components/AppCard';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import { PageShell, Card } from '@elsesourav/ui';
import { Sparkles, FileText, BookOpen } from 'lucide-react';

interface AppDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const app = await getPublicAppBySlug(slug);
    const title = `${app.name} — Software & Utility Overview`;
    const canonicalUrl = `${SITE_CONFIG.url}/apps/${app.slug}`;
    return {
      title,
      description: app.shortDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} | ${SITE_CONFIG.name}`,
        description: app.shortDescription,
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
        type: 'website',
        images: app.featuredImageUrl
          ? [{ url: app.featuredImageUrl, width: 1200, height: 630, alt: app.name }]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ${SITE_CONFIG.name}`,
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

  const appUrl = `${SITE_CONFIG.url}/apps/${app.slug}`;

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
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
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
            item: SITE_CONFIG.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Applications',
            item: `${SITE_CONFIG.url}/apps`,
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
    <PageShell size="lg" glow>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-12">
        {/* App Hero Section */}
        <AppDetailHero app={app} />

        {/* Screenshot Gallery if available */}
        <AppScreenshotGallery appName={app.name} screenshots={app.screenshots} />

        {/* Detailed Long-Form Description / Markdown Content */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> About {app.name}
          </h2>
          <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm">
            <BlogContentRenderer content={app.description} />
          </Card>
        </div>

        {/* Long-Form Technical Documentation & Guides */}
        {app.documentationMd && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Documentation & Guide
            </h2>
            <Card className="p-6 sm:p-8 rounded-3xl border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm">
              <BlogContentRenderer content={app.documentationMd} />
            </Card>
          </div>
        )}

        {/* Platform Downloads & Distribution Links */}
        <AppDetailLinks links={app.links} />

        {/* Version History & Changelog */}
        <AppVersionHistory versions={app.versions} />

        {/* Related Apps Section */}
        {relatedApps.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-zinc-800/70">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> More in {app.primaryCategory}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedApps.map((related, idx) => (
                <AppCard key={related.id} app={related} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
