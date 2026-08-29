import type { Metadata } from 'next';
import { Button, Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { discoverPublishedApps } from '@/features/apps/queries/get-apps';
import { getPublicBlogListing } from '@/features/blog/queries/get-blog';
import { AppCard } from '@/features/apps/components/AppCard';
import Link from 'next/link';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { Sparkles, BookOpen, LifeBuoy, ArrowRight, Layers, Cpu, ShieldCheck } from 'lucide-react';

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
  // Query live featured apps and latest blogs from Supabase PostgreSQL
  const [appsResult, blogResult] = await Promise.all([
    discoverPublishedApps({ limit: 6, sort: 'popularity' }).catch(() => ({ items: [], totalCount: 0 })),
    getPublicBlogListing({ limit: 3 }).catch(() => ({ items: [], totalCount: 0, page: 1, totalPages: 1 })),
  ]);

  const featuredApps = appsResult.items || [];
  const recentPosts = blogResult.items || [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        sameAs: [SITE_CONFIG.links.github, SITE_CONFIG.links.twitter],
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
    <main className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Responsive Header Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.500/10),transparent)]" />
        <Badge variant="info" className="mb-6 gap-1.5 py-1 px-3">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation V2 Platform
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl">
          High-performance developer tools, terminal environments, & web software.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl">
          Crafted for engineers who value precision, low-latency architecture, and sleek aesthetics.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href={ROUTES.APPS}>
            <Button size="lg" className="gap-2 shadow-lg shadow-indigo-500/20">
              Explore All Apps ({appsResult.totalCount}) <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={ROUTES.BLOG}>
            <Button variant="secondary" size="lg" className="gap-2">
              Read Engineering Notes
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Applications Section */}
      {featuredApps.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-2xl font-bold tracking-tight text-white">Featured Developer Utilities</h2>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Explore popular tools built for modern engineering workflows.
              </p>
            </div>
            <Link href={ROUTES.APPS} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Engineering Blog Section */}
      {recentPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h2 className="text-2xl font-bold tracking-tight text-white">Latest Engineering Articles</h2>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                System design, performance benchmarks, and architecture deep-dives.
              </p>
            </div>
            <Link href={ROUTES.BLOG} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Read all notes <ArrowRight className="w-3.5 h-3.5" />
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
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
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

      {/* Pillar Architecture Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full border-t border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 text-xs border-zinc-700">Platform Core</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Engineered for Reliability & Speed
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            A production-ready stack built on Next.js 15 App Router, PostgreSQL, and Supabase Auth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-zinc-800/80 bg-zinc-900/30 p-6">
            <CardHeader className="p-0 space-y-2">
              <Cpu className="w-8 h-8 text-indigo-400" />
              <CardTitle className="text-lg">Next.js 15 Server-First</CardTitle>
              <CardDescription className="text-xs text-zinc-400 leading-relaxed">
                Zero client bundle bloat with streaming Server Components, Server Actions, and sub-100ms response latencies.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-zinc-800/80 bg-zinc-900/30 p-6">
            <CardHeader className="p-0 space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <CardTitle className="text-lg">Zero-Trust Security</CardTitle>
              <CardDescription className="text-xs text-zinc-400 leading-relaxed">
                Multi-tenant RBAC, input sanitization, rate limiting, and cryptographic session verification on every request.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-zinc-800/80 bg-zinc-900/30 p-6">
            <CardHeader className="p-0 space-y-2">
              <LifeBuoy className="w-8 h-8 text-cyan-400" />
              <CardTitle className="text-lg">Integrated Help & Desk</CardTitle>
              <CardDescription className="text-xs text-zinc-400 leading-relaxed">
                Comprehensive knowledge base guides and priority support ticket conversations with staff notes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Built with Next.js 15, PostgreSQL & Tailwind CSS.</p>
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href={ROUTES.APPS} className="hover:text-white transition-colors">Applications</Link>
            <Link href={ROUTES.BLOG} className="hover:text-white transition-colors">Blog</Link>
            <Link href={ROUTES.HELP} className="hover:text-white transition-colors">Documentation</Link>
            <Link href={ROUTES.SUPPORT} className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
