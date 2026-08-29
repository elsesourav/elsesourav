import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { Button, Badge, Section, SectionHeader, ActionGroup, Container } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import { discoverPublishedApps } from '@/features/apps/queries/get-apps';
import { getPublicBlogListing } from '@/features/blog/queries/get-blog';
import { AppCard } from '@/features/apps/components/AppCard';
import Link from 'next/link';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Megaphone,
  Layers,
  Compass,
  Code2,
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
  const cookieStore = await cookies();
  const siteService = new SiteService();

  // Query live featured apps, latest blogs, consolidated site/creator identity, and auth session
  const [appsResult, blogResult, identity, session] = await Promise.all([
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
    siteService.getSiteAndCreatorIdentity(),
    getServerSession({
      getAll: () => cookieStore.getAll(),
    }),
  ]);

  const featuredApps = appsResult.items || [];
  const recentPosts = blogResult.items || [];
  const primaryFeaturedApp = featuredApps[0] || null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${identity.site.url}/#organization`,
        name: identity.site.name,
        url: identity.site.url,
        description: identity.site.description,
        logo: identity.site.logoUrl,
        sameAs: identity.creator.links.map((l) => l.url),
      },
      {
        '@type': 'Person',
        '@id': `${identity.site.url}/#creator`,
        name: identity.creator.name,
        jobTitle: identity.creator.title,
        image: identity.creator.avatarUrl,
        url: `${identity.site.url}/about`,
        sameAs: identity.creator.links.map((l) => l.url),
      },
      {
        '@type': 'WebSite',
        '@id': `${identity.site.url}/#website`,
        url: identity.site.url,
        name: identity.site.name,
        description: identity.site.description,
        publisher: {
          '@id': `${identity.site.url}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${identity.site.url}/apps?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Optional Dynamic Announcement Banner */}
      {identity.homepage.announcementBanner && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/30 px-4 py-2 text-center text-xs text-indigo-200 flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>{identity.homepage.announcementBanner}</span>
        </div>
      )}

      {/* Responsive Header Navigation */}
      <PublicHeader user={session?.user || null} />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1">
        {/* 1. Hero Section: Editorial First-Viewport Narrative */}
        <Section spacing="lg" className="relative pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden flex justify-center"
          >
            <div className="w-[700px] sm:w-[1100px] h-[400px] bg-gradient-to-b from-indigo-500/10 via-indigo-600/5 to-transparent blur-3xl rounded-full transform -translate-y-1/2" />
          </div>

          <Container size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Headline, Narrative, & Primary Exploration CTAs */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {identity.homepage.heroBadge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-xs text-indigo-300 font-medium shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{identity.homepage.heroBadge}</span>
                  </div>
                )}

                <h1 className="text-display font-extrabold tracking-tight text-white leading-[1.08]">
                  {identity.homepage.heroHeadline}
                </h1>

                <p className="text-body sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
                  {identity.homepage.heroSubtitle}
                </p>

                <ActionGroup className="pt-2">
                  <Link href={ROUTES.APPS}>
                    <Button size="lg" className="gap-2 shadow-xl shadow-indigo-600/25 px-6 font-semibold min-h-[44px]">
                      <Terminal className="w-4 h-4" />
                      <span>{identity.homepage.primaryCtaLabel} {appsResult.totalCount > 0 ? `(${appsResult.totalCount})` : ''}</span>
                    </Button>
                  </Link>
                  <Link href={ROUTES.BLOG}>
                    <Button variant="secondary" size="lg" className="gap-2 px-6 min-h-[44px]">
                      <BookOpen className="w-4 h-4" />
                      <span>{identity.homepage.secondaryCtaLabel}</span>
                    </Button>
                  </Link>
                </ActionGroup>

                {/* Status & Scale Indicators */}
                <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-400">Independent Software Platform</span>
                  </span>
                  <span>•</span>
                  <span>{appsResult.totalCount} Applications</span>
                  <span>•</span>
                  <span>By {identity.creator.name}</span>
                </div>
              </div>

              {/* Right Column: Visual Showcase Preview Panel (Glassmorphism 2.0) */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-6 hover:border-zinc-700/80 transition-all duration-300">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 font-mono text-[11px] text-zinc-400">{identity.site.name.toLowerCase()}://hub</span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-md">
                      live
                    </span>
                  </div>

                  {/* Spotlight Preview: First Featured App or Studio Summary */}
                  {primaryFeaturedApp ? (
                    <div className="space-y-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/70">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-400 font-medium font-mono text-[11px] uppercase tracking-wider">
                          Featured Utility
                        </span>
                        <span className="text-zinc-500 text-[11px]">v{primaryFeaturedApp.currentVersion || '1.0'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-white truncate">{primaryFeaturedApp.name}</h3>
                          <p className="text-xs text-zinc-400 truncate">{primaryFeaturedApp.shortDescription}</p>
                        </div>
                      </div>
                      <Link
                        href={`/apps/${primaryFeaturedApp.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-1 group"
                      >
                        <span>Launch & inspect app</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  ) : null}

                  {/* Ecosystem Quick Links */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      href={ROUTES.APPS}
                      className="p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 group-hover:text-white">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <span>Apps Index</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">Tools & Software</p>
                    </Link>

                    <Link
                      href={ROUTES.BLOG}
                      className="p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 group-hover:text-white">
                        <Compass className="w-4 h-4 text-cyan-400" />
                        <span>Journal</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">Insights & Ideas</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* 2. Selected Applications Section */}
        {featuredApps.length > 0 && (
          <Section spacing="md" surface="subtle">
            <Container size="lg">
              <SectionHeader
                align="split"
                caption="Software Index"
                title={identity.homepage.appsTitle}
                description={identity.homepage.appsSubtitle}
                actions={
                  <Link
                    href={ROUTES.APPS}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
                  >
                    <span>Browse full catalog ({appsResult.totalCount})</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                }
              />

              {featuredApps.length >= 3 ? (
                <div className="space-y-6">
                  {/* Top Tier: Flagship Featured Work + 2 Supporting Archival Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-7">
                      <AppCard app={featuredApps[0]!} index={0} featured={true} />
                    </div>
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      <AppCard app={featuredApps[1]!} index={1} />
                      <AppCard app={featuredApps[2]!} index={2} />
                    </div>
                  </div>

                  {/* Optional Remaining Tier */}
                  {featuredApps.length > 3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      {featuredApps.slice(3).map((app, idx) => (
                        <AppCard key={app.id} app={app} index={idx + 3} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {featuredApps.map((app, idx) => (
                    <AppCard key={app.id} app={app} index={idx} />
                  ))}
                </div>
              )}
            </Container>
          </Section>
        )}

        {/* 3. Technical Writing & Ideas Section */}
        {recentPosts.length > 0 && (
          <Section spacing="lg">
            <Container size="lg">
              <SectionHeader
                align="split"
                caption="Writing & Ideas"
                title={identity.homepage.blogTitle}
                description={identity.homepage.blogSubtitle}
                actions={
                  <Link
                    href={ROUTES.BLOG}
                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-1"
                  >
                    <span>Read all articles ({blogResult.totalCount})</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                }
              />

              {recentPosts.length >= 2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left: Emphasized Lead Editorial Essay */}
                  <div className="lg:col-span-7">
                    <Link
                      href={`/blog/${recentPosts[0]!.slug}`}
                      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                    >
                      <div className="h-full border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-cyan-500/50 p-7 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/70">
                            <span className="font-mono text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                              Latest Essay // {recentPosts[0]!.category?.name || 'Architecture'}
                            </span>
                            <span className="text-zinc-400 text-xs">
                              {recentPosts[0]!.readingTime} min read
                            </span>
                          </div>

                          <h3 className="font-bold text-xl sm:text-2xl text-white group-hover:text-cyan-200 transition-colors leading-snug">
                            {recentPosts[0]!.title}
                          </h3>

                          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4">
                            {recentPosts[0]!.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-800/70 text-xs text-zinc-400">
                          <span>
                            {recentPosts[0]!.publishedAt
                              ? new Date(recentPosts[0]!.publishedAt).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Published Recently'}
                          </span>
                          <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Read complete essay</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Right: Archival Index Stream of Supporting Notes */}
                  <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-zinc-800/80 rounded-3xl border border-zinc-800/80 bg-zinc-900/20 p-6">
                    {recentPosts.slice(1).map((post, idx) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className={`group block py-4 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                            <span className="text-cyan-400/90 font-medium">
                              {post.category?.name || 'Notes'}
                            </span>
                            <span>
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : `Note 0${idx + 2}`}
                            </span>
                          </div>

                          <h4 className="font-semibold text-base text-zinc-200 group-hover:text-white group-hover:underline underline-offset-4 transition-colors line-clamp-2">
                            {post.title}
                          </h4>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>{post.readingTime} min read</span>
                            <span className="text-cyan-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Read</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <Link
                    href={`/blog/${recentPosts[0]!.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                  >
                    <div className="border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-cyan-500/50 p-7 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/70">
                          <span className="font-mono text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                            Latest Essay // {recentPosts[0]!.category?.name || 'Architecture'}
                          </span>
                          <span className="text-zinc-400 text-xs">
                            {recentPosts[0]!.readingTime} min read
                          </span>
                        </div>
                        <h3 className="font-bold text-xl sm:text-2xl text-white group-hover:text-cyan-200 transition-colors">
                          {recentPosts[0]!.title}
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {recentPosts[0]!.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-6 border-t border-zinc-800/70 text-xs text-zinc-400">
                        <span>
                          {recentPosts[0]!.publishedAt
                            ? new Date(recentPosts[0]!.publishedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Published Recently'}
                        </span>
                        <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Read essay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </Container>
          </Section>
        )}

        {/* 4. Creator Context & Guiding Philosophy */}
        <Section spacing="lg" surface="subtle">
          <Container size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Creator Intro */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  {identity.creator.avatarUrl ? (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 overflow-hidden shrink-0 shadow-md">
                      <img
                        src={identity.creator.avatarUrl}
                        alt={identity.creator.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                    Creator & Philosophy
                  </Badge>
                </div>
                <h2 className="text-h2 font-bold tracking-tight text-white">
                  Built with purpose & strong fundamentals
                </h2>
                <p className="text-body text-zinc-400 leading-relaxed">{identity.creator.shortBio}</p>
                <div className="pt-2">
                  <Link href={ROUTES.ABOUT}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-800 text-xs gap-1.5 text-zinc-300 hover:text-white"
                    >
                      <span>Read About {identity.creator.name} & Mission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Core Principles Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {identity.creator.principles.map((principle: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 flex items-start gap-3 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-zinc-300 font-medium leading-relaxed">
                      {principle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      </main>

      {/* Dynamic Responsive Footer */}
      <PublicFooter />
    </div>
  );
}
