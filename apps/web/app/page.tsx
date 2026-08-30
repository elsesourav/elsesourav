import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { Button, Section, SectionHeader, ActionGroup, Container } from '@elsesourav/ui';
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
  Layers,
  Code2,
  Megaphone,
  LifeBuoy,
  HelpCircle,
  Activity,
} from 'lucide-react';

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
  },
  description:
    'The personal software studio and digital archive of Sourav. Discover independent applications, developer tools, and engineering field notes.',
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    title: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
    description:
      'The personal software studio and digital archive of Sourav. Discover independent applications, developer tools, and engineering field notes.',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
    description:
      'The personal software studio and digital archive of Sourav. Discover independent applications, developer tools, and engineering field notes.',
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const siteService = new SiteService();

  // Query live selected apps (curated 3), latest blogs, consolidated site/creator identity, and auth session
  const [appsResult, blogResult, identity, session] = await Promise.all([
    discoverPublishedApps({ limit: 3, sort: 'popularity' }).catch(() => ({
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
          <Megaphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{identity.homepage.announcementBanner}</span>
        </div>
      )}

      {/* Responsive Header Navigation */}
      <PublicHeader user={session?.user || null} />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1">
        {/* 1. Hero Section: Personal Creator Studio & Digital Archive */}
        <Section spacing="lg" className="relative pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] overflow-hidden flex justify-center"
          >
            <div className="w-[700px] sm:w-[1100px] h-[400px] bg-gradient-to-b from-indigo-500/10 via-indigo-600/5 to-transparent blur-3xl rounded-full transform -translate-y-1/2" />
          </div>

          <Container size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Creator Introduction & Direct Studio Narrative */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-xs text-indigo-300 font-medium shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{identity.homepage.heroBadge || 'Independent Software Studio & Archive'}</span>
                </div>

                <h1 className="text-display font-extrabold tracking-tight text-white leading-[1.08]">
                  {identity.homepage.heroHeadline || `I'm ${identity.creator.name}. I design and build software, tools, and interactive experiences.`}
                </h1>

                <p className="text-body sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
                  {identity.homepage.heroSubtitle || `${SITE_CONFIG.name} is my personal studio and workshop—a living collection of software, engineering field notes, and creative experiments built with a focus on craft, speed, and privacy.`}
                </p>

                <ActionGroup className="pt-2">
                  <Link href={ROUTES.APPS}>
                    <Button size="lg" className="gap-2 shadow-xl shadow-indigo-600/25 px-6 font-semibold min-h-[44px]">
                      <Layers className="w-4 h-4" />
                      <span>{identity.homepage.primaryCtaLabel || 'Explore Applications'} {appsResult.totalCount > 0 ? `(${appsResult.totalCount})` : ''}</span>
                    </Button>
                  </Link>
                  <Link href={ROUTES.BLOG}>
                    <Button variant="secondary" size="lg" className="gap-2 px-6 min-h-[44px]">
                      <BookOpen className="w-4 h-4" />
                      <span>{identity.homepage.secondaryCtaLabel || 'Read Engineering Notes'}</span>
                    </Button>
                  </Link>
                </ActionGroup>

                {/* Subtle Real-Data Scale Indicators */}
                <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-400">Independent Studio</span>
                  </span>
                  <span>•</span>
                  <span>{appsResult.totalCount} {appsResult.totalCount === 1 ? 'Application' : 'Applications'}</span>
                  <span>•</span>
                  <span>{blogResult.totalCount} {blogResult.totalCount === 1 ? 'Note' : 'Field Notes'}</span>
                  <span>•</span>
                  <span>By {identity.creator.name}</span>
                </div>
              </div>

              {/* Right Column: Creator Spotlight & Exploration Overview Panel */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-5 hover:border-zinc-700/80 transition-all duration-300">
                  {/* Studio Status Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="font-mono text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                        Current Focus & Work
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>Active Studio</span>
                    </span>
                  </div>

                  {/* Flagship Work Spotlight */}
                  {primaryFeaturedApp && (
                    <div className="p-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/70 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-400 font-medium font-mono text-[11px] uppercase tracking-wider">
                          Featured Work
                        </span>
                        <span className="text-zinc-500 text-[11px] font-mono">v{primaryFeaturedApp.currentVersion || '1.0'}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                          <Code2 className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-white truncate">{primaryFeaturedApp.name}</h3>
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{primaryFeaturedApp.shortDescription}</p>
                        </div>
                      </div>
                      <Link
                        href={`/apps/${primaryFeaturedApp.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-1 group"
                      >
                        <span>Inspect architecture</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}

                  {/* Latest Note Spotlight */}
                  {recentPosts[0] && (
                    <div className="p-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/70 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400 font-medium font-mono text-[11px] uppercase tracking-wider">
                          Latest Note
                        </span>
                        <span className="text-zinc-500 text-[11px] font-mono">{recentPosts[0].readingTime || 5} min read</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white line-clamp-1">{recentPosts[0].title}</h3>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{recentPosts[0].excerpt}</p>
                      </div>
                      <Link
                        href={`/blog/${recentPosts[0].slug}`}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium pt-1 group"
                      >
                        <span>Read note</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}

                  {/* Fast Exploration Links */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                    <Link
                      href={ROUTES.APPS}
                      className="p-2.5 rounded-xl border border-zinc-800/70 bg-zinc-950/50 hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">Work</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Software</div>
                    </Link>

                    <Link
                      href="/apps?category=simulations"
                      className="p-2.5 rounded-xl border border-zinc-800/70 bg-zinc-950/50 hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">Lab</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Experiments</div>
                    </Link>

                    <Link
                      href={ROUTES.BLOG}
                      className="p-2.5 rounded-xl border border-zinc-800/70 bg-zinc-950/50 hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">Notes</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Devlog</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* 2. Selected Work / Applications Section */}
        {featuredApps.length > 0 && (
          <Section spacing="md" surface="subtle">
            <Container size="lg">
              <SectionHeader
                align="split"
                caption="Selected Work"
                title={identity.homepage.appsTitle || 'Software Crafted with Purpose'}
                description={identity.homepage.appsSubtitle || 'A curated collection of desktop utilities, web apps, and developer tools built for daily workflows.'}
                actions={
                  <Link
                    href={ROUTES.APPS}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1 group"
                  >
                    <span>View all applications {appsResult.totalCount > 0 ? `(${appsResult.totalCount})` : ''}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                }
              />

              {featuredApps.length >= 3 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Primary Highlighted Project (Col 7) */}
                  <div className="lg:col-span-7">
                    <AppCard app={featuredApps[0]!} index={0} featured={true} />
                  </div>
                  {/* Secondary Curated Projects (Col 5) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <AppCard app={featuredApps[1]!} index={1} />
                    <AppCard app={featuredApps[2]!} index={2} />
                  </div>
                </div>
              ) : featuredApps.length === 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredApps.map((app, idx) => (
                    <AppCard key={app.id} app={app} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <AppCard app={featuredApps[0]!} index={0} featured={true} />
                </div>
              )}
            </Container>
          </Section>
        )}

        {/* 3. Writing & Engineering Notes Section */}
        {recentPosts.length > 0 && (
          <Section spacing="lg">
            <Container size="lg">
              <SectionHeader
                align="split"
                caption="Field Notes & Writing"
                title={identity.homepage.blogTitle || 'Engineering Notes & Reflections'}
                description={
                  identity.homepage.blogSubtitle ||
                  'Notes on software design, architecture, performance, and things I learn while building.'
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

              {recentPosts.length >= 2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left: Emphasized Lead Editorial Essay */}
                  <div className="lg:col-span-7">
                    <Link
                      href={`/blog/${recentPosts[0]!.slug}`}
                      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                    >
                      <article className="h-full border border-zinc-800/90 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 hover:border-cyan-500/50 p-7 sm:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/70">
                            <span className="font-mono text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                              Latest Essay // {recentPosts[0]!.category?.name || 'Architecture'}
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
                              className="font-mono text-zinc-500"
                            >
                              {new Date(recentPosts[0]!.publishedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </time>
                          ) : (
                            <span className="text-zinc-500 font-mono">Published Recently</span>
                          )}
                          <span className="text-cyan-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                            <span>Read complete essay</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </div>

                  {/* Right: Archival Index Stream of Supporting Notes */}
                  <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-zinc-800/70 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-7 backdrop-blur-sm">
                    {recentPosts.slice(1).map((post, idx) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group block py-4 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl"
                      >
                        <article className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                            <span className="text-cyan-400/90 font-medium">
                              {post.category?.name || 'Notes'}
                            </span>
                            {post.publishedAt ? (
                              <time dateTime={new Date(post.publishedAt).toISOString()}>
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}{' '}
                                · {post.readingTime} min
                              </time>
                            ) : (
                              <span>Note 0{idx + 2} · {post.readingTime} min</span>
                            )}
                          </div>

                          <h4 className="font-semibold text-base sm:text-lg text-zinc-200 group-hover:text-white group-hover:underline underline-offset-4 transition-colors line-clamp-2 leading-snug">
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
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <Link
                    href={`/blog/${recentPosts[0]!.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                  >
                    <article className="border border-zinc-800/90 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 hover:border-cyan-500/50 p-7 sm:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800/70">
                          <span className="font-mono text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                            Latest Essay // {recentPosts[0]!.category?.name || 'Architecture'}
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
                            className="font-mono text-zinc-500"
                          >
                            {new Date(recentPosts[0]!.publishedAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </time>
                        ) : (
                          <span className="text-zinc-500 font-mono">Published Recently</span>
                        )}
                        <span className="text-cyan-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                          <span>Read complete essay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </div>
              )}
            </Container>
          </Section>
        )}

        {/* 4. Creator Context & Guiding Philosophy */}
        <Section spacing="lg" surface="subtle">
          <Container size="lg">
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
                      <span>Read the complete studio mission & bio</span>
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
          </Container>
        </Section>

        {/* 5. Explore Studio Pathways */}
        <Section spacing="lg">
          <Container size="lg">
            <SectionHeader
              align="center"
              caption="Studio Pathways"
              title={identity.homepage.closingCtaTitle || 'Explore the ElseSourav Archive'}
              description={identity.homepage.closingCtaSubtitle || 'Discover software tools, read architectural writings, or get in touch directly.'}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Link
                href={ROUTES.APPS}
                className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-indigo-500/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-indigo-300 transition-colors">
                    Applications Catalog
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Explore standalone desktop and web utilities built for everyday productivity.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs text-indigo-400 font-medium gap-1">
                  <span>Browse apps</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href={ROUTES.BLOG}
                className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-cyan-500/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                    Engineering Devlogs
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Deep dives into software architecture, monorepos, and creative engineering.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs text-cyan-400 font-medium gap-1">
                  <span>Read devlogs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href={ROUTES.HELP}
                className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-purple-500/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-purple-300 transition-colors">
                    Documentation & Guides
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Step-by-step setup guides, feature walkthroughs, and troubleshooting tips.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs text-purple-400 font-medium gap-1">
                  <span>Open help desk</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href={ROUTES.SUPPORT}
                className="p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-emerald-500/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors">
                    Support Desk
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Have feedback or found a bug? Submit a ticket directly to the studio.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs text-emerald-400 font-medium gap-1">
                  <span>Contact support</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      {/* Dynamic Responsive Footer */}
      <PublicFooter />
    </div>
  );
}
