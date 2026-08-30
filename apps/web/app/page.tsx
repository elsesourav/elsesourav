import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import type { AppListItem, BlogPostListItem, SiteLinkItem } from '@elsesourav/types';
import { Button, Section, SectionHeader, ActionGroup, Container, Reveal, RevealGroup } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';
import { discoverPublishedApps } from '@/features/apps/queries/get-apps';
import { getPublicBlogListing } from '@/features/blog/queries/get-blog';
import { AppCard } from '@/features/apps/components/AppCard';
import { HeroProjectVisual } from '@/features/home/components/HeroProjectVisual';
import Link from 'next/link';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Layers,
  Megaphone,
  Sparkles,
  User,
} from 'lucide-react';

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
  },
  description:
    'Building software, tools, games, and experiments that solve real problems and spark new ideas.',
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    title: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
    description:
      'Building software, tools, games, and experiments that solve real problems and spark new ideas.',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1024,
        height: 576,
        alt: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
    description:
      'Building software, tools, games, and experiments that solve real problems and spark new ideas.',
    images: [SITE_CONFIG.ogImage],
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const siteService = new SiteService();

  // Curated data queries: 5 selected projects, 3 recent notes, site/creator identity
  const [appsResult, blogResult, identity, session] = await Promise.all([
    discoverPublishedApps({ limit: 5, sort: 'popularity' }).catch(() => ({
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
        sameAs: identity.creator.links.map((l: SiteLinkItem) => l.url),
      },
      {
        '@type': 'Person',
        '@id': `${identity.site.url}/#creator`,
        name: identity.creator.name,
        jobTitle: identity.creator.title,
        image: identity.creator.avatarUrl,
        url: `${identity.site.url}/about`,
        sameAs: identity.creator.links.map((l: SiteLinkItem) => l.url),
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
          <Megaphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{identity.homepage.announcementBanner}</span>
        </div>
      )}

      {/* Responsive Header Navigation */}
      <PublicHeader user={session?.user || null} />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1">
        {/* 1. Hero Section: Direct Identity & Purpose */}
        <Section spacing="lg" className="relative pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden flex justify-center"
          >
            <div className="w-[700px] sm:w-[1100px] h-[400px] bg-gradient-to-b from-indigo-500/10 via-indigo-600/5 to-transparent blur-3xl rounded-full transform -translate-y-1/2" />
          </div>

          <Container size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Primary Hero Statement & Positioning */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* 1. Small Identity/Context Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs font-mono text-indigo-300 font-semibold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{identity.homepage.heroBadge || 'SOURAV / ELSESOURAV'}</span>
                </div>

                {/* 2. Strong Statement with Structured Visual Hierarchy */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                  <span className="text-white">Building software, tools, games, and experiments</span>{' '}
                  <span className="text-zinc-400 font-normal">that</span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-white font-extrabold">
                    solve real problems and spark new ideas.
                  </span>
                </h1>

                {/* 3. Short Supporting Explanation */}
                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
                  {identity.homepage.heroSubtitle ||
                    'ElseSourav is my personal space for the applications I build, the ideas I explore, and the things I learn along the way.'}
                </p>

                {/* 4. Action Buttons */}
                <ActionGroup className="pt-2">
                  <Link href={ROUTES.APPS}>
                    <Button size="lg" className="gap-2 shadow-xl shadow-indigo-600/25 px-6 font-semibold min-h-[44px]">
                      <Layers className="w-4 h-4" />
                      <span>{identity.homepage.primaryCtaLabel || 'Explore Apps'}</span>
                    </Button>
                  </Link>
                  <Link href={ROUTES.ABOUT}>
                    <Button variant="secondary" size="lg" className="gap-2 px-6 min-h-[44px]">
                      <User className="w-4 h-4" />
                      <span>{identity.homepage.secondaryCtaLabel || 'About Me'}</span>
                    </Button>
                  </Link>
                </ActionGroup>

                {/* Real-Data Scale Summary */}
                <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-zinc-500 font-mono">
                  <span className="text-zinc-400">Independent Studio</span>
                  <span>•</span>
                  <span>{appsResult.totalCount} {appsResult.totalCount === 1 ? 'App' : 'Applications'}</span>
                  <span>•</span>
                  <span>{blogResult.totalCount} {blogResult.totalCount === 1 ? 'Note' : 'Field Notes'}</span>
                </div>
              </div>

              {/* Right Column: Visual Representation of Sourav's Work */}
              <div className="lg:col-span-5">
                <HeroProjectVisual apps={featuredApps} />
              </div>
            </div>
          </Container>
        </Section>

        {/* 2. Selected Apps (Curated 4–5 Projects) */}
        {featuredApps.length > 0 && (
          <Section spacing="lg" surface="subtle">
            <Container size="lg">
              <Reveal direction="up" distance={14}>
                <SectionHeader
                  align="split"
                  caption="Selected Apps"
                  title={identity.homepage.appsTitle || 'Selected Apps'}
                  description={
                    identity.homepage.appsSubtitle ||
                    'A curated selection of software, developer tools, games, and systems.'
                  }
                  actions={
                    <Link
                      href={ROUTES.APPS}
                      className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1 group"
                    >
                      <span>Explore all apps {appsResult.totalCount > 0 ? `(${appsResult.totalCount})` : ''}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  }
                />
              </Reveal>

              <div className="space-y-6">
                {/* 1. Flagship Lead Project */}
                <Reveal direction="up" distance={16} delay={0.05}>
                  <AppCard app={featuredApps[0]!} index={0} featured={true} />
                </Reveal>

                {/* 2. Supporting Projects Grid (up to 4 projects in 2x2) */}
                {featuredApps.length > 1 && (
                  <RevealGroup staggerDelay={0.06} baseDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {featuredApps.slice(1, 5).map((app: AppListItem, idx: number) => (
                      <AppCard key={app.id} app={app} index={idx + 1} />
                    ))}
                  </RevealGroup>
                )}
              </div>

              {/* Bottom Exploration CTA */}
              <Reveal direction="up" distance={10} delay={0.15}>
                <div className="text-center pt-10">
                  <Link
                    href={ROUTES.APPS}
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white px-5 py-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <span>Explore full apps catalog ({appsResult.totalCount} applications)</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  </Link>
                </div>
              </Reveal>
            </Container>
          </Section>
        )}

        {/* 3. Field Notes & Reflections (1 Lead Essay + 2 Archival Notes) */}
        {recentPosts.length > 0 && (
          <Section spacing="lg">
            <Container size="lg">
              <Reveal direction="up" distance={14}>
                <SectionHeader
                  align="split"
                  caption="Field Notes"
                  title={identity.homepage.blogTitle || 'Field Notes & Reflections'}
                  description={
                    identity.homepage.blogSubtitle ||
                    'Things I write about while building software, learning tools, and solving architectural problems.'
                  }
                  actions={
                    <Link
                      href={ROUTES.BLOG}
                      className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-1 group"
                    >
                      <span>Read all notes {blogResult.totalCount > 0 ? `(${blogResult.totalCount})` : ''}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  }
                />
              </Reveal>

              {recentPosts.length >= 2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left: Emphasized Lead Editorial Essay */}
                  <Reveal direction="up" distance={16} delay={0.06} className="lg:col-span-7">
                    <Link
                      href={`/blog/${recentPosts[0]!.slug}`}
                      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                    >
                      <article className="h-full border border-zinc-800/90 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 hover:border-cyan-500/50 p-7 sm:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/70">
                            <span className="font-mono text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                              Field Note // {recentPosts[0]!.category?.name || 'Architecture'}
                            </span>
                            <span className="text-zinc-500 text-xs font-mono">
                              {recentPosts[0]!.readingTime} min read
                            </span>
                          </div>

                          <h3 className="font-bold text-2xl sm:text-3xl text-white group-hover:text-cyan-200 transition-colors leading-tight">
                            {recentPosts[0]!.title}
                          </h3>

                          <p className="text-body text-zinc-400 leading-relaxed line-clamp-3">
                            {recentPosts[0]!.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-800/70 text-xs text-zinc-400">
                          {recentPosts[0]!.publishedAt ? (
                            <time
                              dateTime={new Date(recentPosts[0]!.publishedAt).toISOString()}
                              className="font-mono text-zinc-500 uppercase"
                            >
                              {new Date(recentPosts[0]!.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                              })}
                            </time>
                          ) : (
                            <span className="text-zinc-500 font-mono">Published Recently</span>
                          )}
                          <span className="text-cyan-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                            <span>Read note</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </Reveal>

                  {/* Right: Archival Index Stream of Supporting Notes */}
                  <Reveal direction="up" distance={16} delay={0.12} className="lg:col-span-5 flex flex-col justify-between divide-y divide-zinc-800/70 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-7 backdrop-blur-sm">
                    {recentPosts.slice(1, 3).map((post: BlogPostListItem, idx: number) => {
                      const formattedIdx = String(idx + 1).padStart(2, '0');
                      return (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group block py-4 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl"
                        >
                          <article className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                              <div className="flex items-center gap-2">
                                <span className="text-cyan-400 font-bold text-[11px]">
                                   {formattedIdx}
                                </span>
                                <span className="text-cyan-400/90 font-medium uppercase tracking-wider text-[11px]">
                                  {post.category?.name || 'Notes'}
                                </span>
                              </div>
                              {post.publishedAt ? (
                                <time dateTime={new Date(post.publishedAt).toISOString()} className="uppercase">
                                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: '2-digit',
                                    year: 'numeric',
                                  })}{' '}
                                  · {post.readingTime} min
                                </time>
                              ) : (
                                <span>{post.readingTime} min read</span>
                              )}
                            </div>

                            <h4 className="font-semibold text-base text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>

                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                              {post.excerpt}
                            </p>

                            <div className="pt-1 flex items-center text-xs text-cyan-400 font-medium gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Read note</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </article>
                        </Link>
                      );
                    })}
                  </Reveal>
                </div>
              ) : (
                <Reveal direction="up" distance={16} className="max-w-3xl mx-auto">
                  <Link
                    href={`/blog/${recentPosts[0]!.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                  >
                    <article className="border border-zinc-800/90 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 hover:border-cyan-500/50 p-7 sm:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/70">
                          <span className="font-mono text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                            Field Note // {recentPosts[0]!.category?.name || 'Architecture'}
                          </span>
                          <span className="text-zinc-500 text-xs font-mono">
                            {recentPosts[0]!.readingTime} min read
                          </span>
                        </div>
                        <h3 className="font-bold text-2xl sm:text-3xl text-white group-hover:text-cyan-200 transition-colors leading-tight">
                          {recentPosts[0]!.title}
                        </h3>
                        <p className="text-body text-zinc-400 leading-relaxed">
                          {recentPosts[0]!.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-800/70 text-xs text-zinc-400">
                        {recentPosts[0]!.publishedAt ? (
                          <time
                            dateTime={new Date(recentPosts[0]!.publishedAt).toISOString()}
                            className="font-mono text-zinc-500 uppercase"
                          >
                            {new Date(recentPosts[0]!.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                          </time>
                        ) : (
                          <span className="text-zinc-500 font-mono">Published Recently</span>
                        )}
                        <span className="text-cyan-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                          <span>Read note</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              )}

              {/* Bottom Exploration CTA */}
              <Reveal direction="up" distance={10} delay={0.15}>
                <div className="text-center pt-8">
                  <Link
                    href={ROUTES.BLOG}
                    className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-1"
                  >
                    <span>Read all engineering field notes ({blogResult.totalCount} articles)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </Link>
                </div>
              </Reveal>
            </Container>
          </Section>
        )}

        {/* 4. Creator Context & Guiding Philosophy */}
        <Section spacing="lg">
          <Container size="lg">
            <Reveal direction="up" distance={16}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column: Creator Statement & Narrative */}
                <div className="lg:col-span-5 space-y-5">
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
                    <div>
                      <div className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                        How I Build
                      </div>
                      <div className="text-xs text-zinc-400">
                        {identity.creator.name} · {identity.creator.title}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-h2 font-bold tracking-tight text-white leading-snug">
                    {identity.creator.statement || 'I care about software that is understandable, useful, fast, and considerate.'}
                  </h2>

                  <p className="text-body text-zinc-400 leading-relaxed">
                    {identity.creator.shortBio || identity.creator.positioning}
                  </p>

                  <div className="pt-2">
                    <Link href={ROUTES.ABOUT}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-800 text-xs gap-1.5 text-zinc-300 hover:text-white"
                      >
                        <span>Read about the journey & background</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Ordered Principles Grid */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {identity.creator.principles.map((principle: string, idx: number) => {
                    const formattedIdx = String(idx + 1).padStart(2, '0');
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700/80 transition-colors space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-indigo-400/90 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded">
                            {formattedIdx}
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                        <p className="text-sm text-zinc-200 font-medium leading-snug">
                          {principle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* 5. Closing Invitation & Studio Pathways */}
        <Section spacing="lg" surface="subtle">
          <Container size="lg">
            <Reveal direction="up" distance={14}>
              <div className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-zinc-950/80 p-8 sm:p-12 text-center space-y-8 backdrop-blur-md">
                <div className="space-y-3 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-xs text-indigo-300 font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Studio Doorway</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {identity.homepage.closingCtaTitle || 'Explore the ElseSourav Studio'}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {identity.homepage.closingCtaSubtitle ||
                      'Every application, utility, and field note is built independently with a focus on craft, performance, and usability.'}
                  </p>
                </div>

                {/* 3 Focused Core Pathways */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <Link
                    href={ROUTES.APPS}
                    className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/70 hover:border-indigo-500/40 transition-all text-left space-y-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="flex items-center justify-between">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white">
                      Explore Apps
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      Browse full collection of software, utilities, and developer tools.
                    </p>
                  </Link>

                  <Link
                    href={ROUTES.BLOG}
                    className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/70 hover:border-cyan-500/40 transition-all text-left space-y-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <div className="flex items-center justify-between">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white">
                      Read Field Notes
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      Technical write-ups, architecture breakdowns, and learnings.
                    </p>
                  </Link>

                  <Link
                    href={ROUTES.ABOUT}
                    className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/70 hover:border-purple-500/40 transition-all text-left space-y-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    <div className="flex items-center justify-between">
                      <User className="w-4 h-4 text-purple-400" />
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white">
                      About Me
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      Background, engineering evolution, and studio principles.
                    </p>
                  </Link>
                </div>

                <div className="pt-2 text-xs text-zinc-500">
                  Have a question or found a bug?{' '}
                  <Link
                    href={ROUTES.SUPPORT}
                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    Reach out via Support Desk
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>
      </main>

      {/* Dynamic Responsive Footer */}
      <PublicFooter />
    </div>
  );
}
