import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { getPublicAppBySlug, getRelatedProjects } from '@/features/apps/queries/get-apps';
import {
  AppDetailHero,
  AppDetailDescription,
  AppInformationSpecs,
} from '@/features/apps/components/detail';
import { AppMediaShowcase } from '@/features/apps/components/media';
import { AppFeedbackSection } from '@/features/apps/components/reviews';
import { ShelfCarouselRow } from '@/features/apps/components/editorial';
import { PageShell, Reveal } from '@elsesourav/ui';
import { Sparkles, Gamepad2, Layers, Cpu, Radio, Wrench, ChevronRight } from 'lucide-react';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';

function getCategoryDetails(categorySlug?: string, primaryCategory?: string) {
  const slug = (categorySlug || '').toLowerCase();
  const name = (primaryCategory || '').toLowerCase();

  if (slug.includes('game') || name.includes('game') || name.includes('play')) {
    return {
      icon: <Gamepad2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
      subtitle: 'WebAssembly arcade games, interactive canvases, and physics playgrounds',
    };
  }
  if (slug.includes('sim') || name.includes('sim') || name.includes('algo')) {
    return {
      icon: <Layers className="w-4 h-4 text-violet-500 dark:text-violet-400" />,
      subtitle: 'Interactive physics models, cellular automata, and algorithmic labs',
    };
  }
  if (
    slug.includes('ai') ||
    slug.includes('ml') ||
    name.includes('ai') ||
    name.includes('machine') ||
    name.includes('learning')
  ) {
    return {
      icon: <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
      subtitle: 'Multi-model assistants, on-device OCR, and neural classification engines',
    };
  }
  if (slug.includes('auto') || name.includes('auto') || name.includes('workflow')) {
    return {
      icon: <Cpu className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
      subtitle: 'Marketplace bulk tools, SKU synchronizers, and productivity systems',
    };
  }
  if (
    slug.includes('iot') ||
    slug.includes('hardware') ||
    name.includes('iot') ||
    name.includes('hardware')
  ) {
    return {
      icon: <Radio className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />,
      subtitle: 'Microcontroller telemetry, non-destructive tools, and developer utilities',
    };
  }
  return {
    icon: <Wrench className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
    subtitle: 'Microcontroller telemetry, non-destructive tools, and developer utilities',
  };
}

interface AppDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { buildAppMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const app = await getPublicAppBySlug(slug);
    return buildAppMetadata(app);
  } catch {
    return {
      title: `Project Not Found — ${SITE_CONFIG.name}`,
      description: 'The requested software application or project could not be found.',
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

  // Fetch related apps and auth session in parallel
  const cookieStore = await cookies();
  const [fallbackRelated, session] = await Promise.all([
    getRelatedProjects(app, 8),
    getServerSession({ getAll: () => cookieStore.getAll() }).catch(() => null),
  ]);
  const isAuthenticated = Boolean(session?.user?.id);
  const categoryMeta = getCategoryDetails(app.categorySlug, app.primaryCategory);

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
            name: 'Apps',
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

      <div className="space-y-16 max-w-5xl mx-auto">
        {/* 1. App Hero Section (Immediately visible, no initial scroll delay) */}
        <AppDetailHero app={app} isAuthenticated={isAuthenticated} />

        {/* 2. Visual Showcase / Media Carousel (Videos & Screenshots with Drag/Scroll) */}
        {(app.featuredImageUrl ||
          (app.screenshots && app.screenshots.length > 0) ||
          app.videoUrl) && (
          <Reveal direction="up" distance={16}>
            <AppMediaShowcase
              appName={app.name}
              screenshots={app.screenshots || []}
              featuredImageUrl={app.featuredImageUrl}
              videoUrl={app.videoUrl}
              platforms={app.platforms}
            />
          </Reveal>
        )}

        {/* 3. Description & Technical Story with App Store style more toggle */}
        {app.description && (
          <Reveal direction="up" distance={14}>
            <AppDetailDescription
              description={app.description}
              documentationMd={app.documentationMd}
            />
          </Reveal>
        )}

        {/* 4. Community Feedback, Ratings & Reviews */}
        <Reveal direction="up" distance={14}>
          <div id="community-feedback" className="scroll-mt-24">
            <AppFeedbackSection
              appSlug={app.slug}
              appName={app.name}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </Reveal>

        {/* 5. App Store Information & Technical Specifications */}
        <Reveal direction="up" distance={14}>
          <AppInformationSpecs app={app} />
        </Reveal>

        {/* 8. Suggestions & Related Projects Shelf (Matches Apps page shelf style) */}
        {fallbackRelated.length > 0 && (
          <section
            aria-labelledby="related-projects-heading"
            className="w-full max-w-full min-w-0 space-y-3 pt-8 border-t border-[hsl(var(--border-subtle))]"
          >
            <Reveal direction="up" distance={14}>
              <div className="flex items-center justify-between gap-3 pb-1 border-b border-[hsl(var(--border-subtle))]">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0 shadow-xs">
                    {categoryMeta.icon}
                  </span>
                  <div>
                    <h2
                      id="related-projects-heading"
                      className="text-base sm:text-lg font-bold tracking-tight text-[hsl(var(--foreground))] font-display"
                    >
                      More in {app.primaryCategory}
                    </h2>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] hidden sm:block">
                      {categoryMeta.subtitle}
                    </p>
                  </div>
                </div>

                <Link
                  href={app.categorySlug ? `/apps?category=${app.categorySlug}` : ROUTES.APPS}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors shrink-0 group/link"
                >
                  <span>See all</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </Reveal>

            {/* Shelf Horizontal Carousel with Left/Right Buttons & Drag */}
            <ShelfCarouselRow items={fallbackRelated} />
          </section>
        )}
      </div>
    </PageShell>
  );
}
