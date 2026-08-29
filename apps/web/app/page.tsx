import type { Metadata } from 'next';
import { Button, Card, Badge } from '@elsesourav/ui';
import { SITE_CONFIG, CREATOR_CONFIG, ROUTES } from '@elsesourav/config';
import { AdminRepository } from '@elsesourav/database';
import { discoverPublishedApps } from '@/features/apps/queries/get-apps';
import { getPublicBlogListing } from '@/features/blog/queries/get-blog';
import { AppCard } from '@/features/apps/components/AppCard';
import Link from 'next/link';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  CheckCircle2,
  Terminal,
  Megaphone,
} from 'lucide-react';

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  },
  description: SITE_CONFIG.description,
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const adminRepo = new AdminRepository();

  // Query live featured apps, latest blogs, and dynamic site settings
  const [appsResult, blogResult, dbSettings] = await Promise.all([
    discoverPublishedApps({ limit: 6, sort: 'popularity' }).catch(() => ({
      items: [],
      totalCount: 0,
    })),
    getPublicBlogListing({ limit: 3 }).catch(() => ({
      items: [],
      totalCount: 0,
      page: 1,
      totalPages: 1,
    })),
    adminRepo.getAllSettings().catch(() => ({} as Record<string, string>)),
  ]);

  const featuredApps = appsResult.items || [];
  const recentPosts = blogResult.items || [];

  const heroBadge = dbSettings['hero_badge'] || `Software & Digital Tools by ${CREATOR_CONFIG.name}`;
  const heroHeadline = dbSettings['hero_headline'] || 'Thoughtful software, practical tools, & engineering ideas.';
  const heroSubtitle = dbSettings['hero_subtitle'] || CREATOR_CONFIG.positioning;
  const primaryCtaLabel = dbSettings['primary_cta_label'] || 'Explore Applications';
  const secondaryCtaLabel = dbSettings['secondary_cta_label'] || 'Read Engineering Notes';
  const announcementBanner = dbSettings['announcement_banner'] || '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        sameAs: [CREATOR_CONFIG.links.github, CREATOR_CONFIG.links.twitter],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_CONFIG.url}/#website`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        publisher: {
          '@id': `${SITE_CONFIG.url}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_CONFIG.url}/apps?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <main className="flex flex-col min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Optional Dynamic Announcement Banner */}
      {announcementBanner && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/30 px-4 py-2 text-center text-xs text-indigo-200 flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>{announcementBanner}</span>
        </div>
      )}

      {/* Responsive Header Navigation */}
      <PublicHeader />

      {/* Hero Section: Identity, Positioning, & Value Proposition */}
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.500/10),transparent)]" />
        
        <Badge variant="info" className="mb-6 gap-1.5 py-1 px-3.5 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" /> {heroBadge}
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          {heroHeadline}
        </h1>

        <p className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          {heroSubtitle}
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center items-center">
          <Link href={ROUTES.APPS}>
            <Button size="lg" className="gap-2 shadow-lg shadow-indigo-600/20 px-6 font-semibold">
              <Terminal className="w-4 h-4" /> {primaryCtaLabel} ({appsResult.totalCount})
            </Button>
          </Link>
          <Link href={ROUTES.BLOG}>
            <Button variant="secondary" size="lg" className="gap-2 px-6">
              <BookOpen className="w-4 h-4" /> {secondaryCtaLabel}
            </Button>
          </Link>
        </div>
      </section>

      {/* Selected Applications Section */}
      {featuredApps.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Featured Software & Tools
                </h2>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Practical utilities and digital tools crafted for real workflows.
              </p>
            </div>
            <Link
              href={ROUTES.APPS}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              Browse catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {/* Technical Writing & Exploration Section */}
      {recentPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Technical Writing & Exploration
                </h2>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Deep-dives on software design, performance, and architecture lessons.
              </p>
            </div>
            <Link
              href={ROUTES.BLOG}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Read all articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <Card className="h-full border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-cyan-500/50 p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between backdrop-blur-sm group-hover:shadow-xl group-hover:shadow-cyan-500/10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{post.category?.name || 'Engineering'}</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                    <h3 className="font-semibold text-base text-zinc-100 group-hover:text-white transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                    <span className="text-cyan-400 flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Creator Context & Guiding Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full border-t border-zinc-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Creator Intro */}
          <div className="lg:col-span-5 space-y-4">
            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
              Creator & Philosophy
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built with purpose & strong fundamentals
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {CREATOR_CONFIG.shortBio}
            </p>
            <div className="pt-2">
              <Link href={ROUTES.ABOUT}>
                <Button variant="outline" size="sm" className="border-zinc-800 text-xs gap-1.5 text-zinc-300">
                  Read About Sourav & Mission <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Core Principles Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CREATOR_CONFIG.principles.map((principle, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-300 font-medium leading-relaxed">
                  {principle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Crafted by {SITE_CONFIG.author}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href={ROUTES.APPS} className="hover:text-white transition-colors">
              Applications
            </Link>
            <Link href={ROUTES.BLOG} className="hover:text-white transition-colors">
              Blog
            </Link>
            <Link href={ROUTES.HELP} className="hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href={ROUTES.ABOUT} className="hover:text-white transition-colors">
              About
            </Link>
            <Link href={ROUTES.SUPPORT} className="hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
