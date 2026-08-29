import type { Metadata } from 'next';
import { Button, Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import Link from 'next/link';
import { Sparkles, Terminal, BookOpen, LifeBuoy, ArrowRight } from 'lucide-react';

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

export default function HomePage() {
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
    <main className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold text-lg text-white">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>{SITE_CONFIG.name}</span>
            <Badge variant="outline" className="text-[10px] ml-1">v2.0</Badge>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-zinc-300">
            <Link href={ROUTES.APPS} className="hover:text-white transition-colors">Apps</Link>
            <Link href={ROUTES.BLOG} className="hover:text-white transition-colors">Blog</Link>
            <Link href={ROUTES.HELP} className="hover:text-white transition-colors">Help</Link>
            <Link href={ROUTES.SUPPORT} className="hover:text-white transition-colors">Support</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href={ROUTES.SIGNUP}>
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32 relative overflow-hidden">
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
            <Button size="lg" className="gap-2">
              Explore Applications <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={ROUTES.BLOG}>
            <Button variant="secondary" size="lg" className="gap-2">
              Read Engineering Notes
            </Button>
          </Link>
        </div>

        {/* Pillar Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-20 text-left">
          <Card>
            <CardHeader>
              <Terminal className="w-8 h-8 text-indigo-400 mb-2" />
              <CardTitle>Hardware-Accelerated Tools</CardTitle>
              <CardDescription>
                High-throughput web terminals, state visualizers, and command-line interfaces.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="w-8 h-8 text-cyan-400 mb-2" />
              <CardTitle>Engineering Journal</CardTitle>
              <CardDescription>
                Architectural walkthroughs, benchmark studies, and deep-dive technical explorations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <LifeBuoy className="w-8 h-8 text-emerald-400 mb-2" />
              <CardTitle>Direct Engineering Support</CardTitle>
              <CardDescription>
                Knowledge base documentation and responsive priority issue tracking.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Built with Next.js 15, PostgreSQL & Tailwind CSS.</p>
      </footer>
    </main>
  );
}
