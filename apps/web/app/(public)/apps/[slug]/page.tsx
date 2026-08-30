import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { getPublicAppBySlug, getPublishedApps, getRelatedProjects } from '@/features/apps/queries/get-apps';
import { AppDetailHero } from '@/features/apps/components/AppDetailHero';
import { AppScreenshotGallery } from '@/features/apps/components/AppScreenshotGallery';
import { AppDetailLinks } from '@/features/apps/components/AppDetailLinks';
import { AppVersionHistory } from '@/features/apps/components/AppVersionHistory';
import { AppCard } from '@/features/apps/components/AppCard';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import { PageShell, Reveal, RevealGroup } from '@elsesourav/ui';
import { Sparkles, FileText, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';

interface AppDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const app = await getPublicAppBySlug(slug);
    const title = `${app.name} — Architecture & Technical Overview`;
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
        type: 'article',
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
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
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

  // Fetch all published apps to determine related apps and next/previous exploration
  const [allApps, fallbackRelated] = await Promise.all([
    getPublishedApps({ limit: 50 }),
    getRelatedProjects(app, 3),
  ]);

  // Find adjacent items for sequence navigation
  const currentIndex = allApps.findIndex((item) => item.id === app.id);
  const prevApp = currentIndex > 0 ? allApps[currentIndex - 1] : null;
  const nextApp = currentIndex >= 0 && currentIndex < allApps.length - 1 ? allApps[currentIndex + 1] : null;

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
        operatingSystem: app.platforms.join(', ') || 'Web Browser',
        softwareVersion: app.currentVersion || '1.0.0',
        url: appUrl,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: 'Sourav Barui',
          url: `${SITE_CONFIG.url}/about`,
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
            name: 'Work',
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

  const isLab =
    app.categorySlug === 'simulations' ||
    app.primaryCategory.toLowerCase().includes('simulation') ||
    app.primaryCategory.toLowerCase().includes('lab');

  return (
    <PageShell size="lg" glow>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-16 max-w-5xl mx-auto">
        {/* 1. App Hero Section (Immediately visible, no initial scroll delay) */}
        <AppDetailHero app={app} />

        {/* 2. Visual Showcase / Screenshot Gallery */}
        {app.screenshots && app.screenshots.length > 0 && (
          <Reveal direction="up" distance={16}>
            <AppScreenshotGallery appName={app.name} screenshots={app.screenshots} />
          </Reveal>
        )}

        {/* 3. The Project Story & Architectural Documentation */}
        {app.documentationMd ? (
          <Reveal direction="up" distance={16}>
            <section aria-labelledby="technical-architecture-heading" className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <h2 id="technical-architecture-heading" className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                    Technical Architecture & Implementation
                  </h2>
                </div>
                <span className="text-xs font-mono text-zinc-500">Verified Implementation</span>
              </div>
              <div className="p-6 sm:p-10 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
                <BlogContentRenderer content={app.documentationMd} />
              </div>
            </section>
          </Reveal>
        ) : app.description ? (
          <Reveal direction="up" distance={16}>
            <section aria-labelledby="project-story-heading" className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold pb-3 border-b border-zinc-800/80">
                <FileText className="w-4 h-4" />
                <h2 id="project-story-heading" className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  About the Project
                </h2>
              </div>
              <div className="p-6 sm:p-10 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
                <BlogContentRenderer content={app.description} />
              </div>
            </section>
          </Reveal>
        ) : null}

        {/* 4. Platform Downloads & Distribution Links */}
        {app.links && app.links.length > 0 && (
          <Reveal direction="up" distance={14}>
            <AppDetailLinks links={app.links} />
          </Reveal>
        )}

        {/* 5. Version History & Changelog */}
        {app.versions && app.versions.length > 0 && (
          <Reveal direction="up" distance={14}>
            <AppVersionHistory versions={app.versions} />
          </Reveal>
        )}

        {/* 6. Adjacent Sequence Navigation (Previous / Next Project) */}
        {(prevApp || nextApp) && (
          <Reveal direction="up" distance={14}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-zinc-800/70">
              {prevApp ? (
                <Link
                  href={`/apps/${prevApp.slug}`}
                  className="group p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/70 hover:border-indigo-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Previous Project</span>
                  </span>
                  <span className="text-sm font-semibold text-zinc-200 group-hover:text-white pt-1">
                    {prevApp.name}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextApp ? (
                <Link
                  href={`/apps/${nextApp.slug}`}
                  className="group p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/70 hover:border-indigo-500/40 transition-all flex flex-col justify-between sm:text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="text-xs font-mono text-zinc-500 flex items-center justify-end gap-1">
                    <span>Next Project</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="text-sm font-semibold text-zinc-200 group-hover:text-white pt-1">
                    {nextApp.name}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </Reveal>
        )}

        {/* 7. Related Projects Section */}
        {fallbackRelated.length > 0 && (
          <section aria-labelledby="related-projects-heading" className="space-y-6 pt-8 border-t border-zinc-800/70">
            <Reveal direction="up" distance={14}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 id="related-projects-heading" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span>More {isLab ? 'Lab Experiments' : 'in ' + app.primaryCategory}</span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Explore related tools, systems, and prototypes built by Sourav.
                  </p>
                </div>
                <Link
                  href={isLab ? '/apps?category=simulations' : ROUTES.APPS}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
                >
                  <span>{isLab ? 'Explore Lab' : 'View all work'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Reveal>

            <RevealGroup staggerDelay={0.06} baseDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fallbackRelated.map((related, idx) => (
                <AppCard key={related.id} app={related} index={idx} />
              ))}
            </RevealGroup>
          </section>
        )}
      </div>
    </PageShell>
  );
}
