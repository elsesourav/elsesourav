import { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedApps } from '@/features/apps/queries/get-apps';
import { PageShell, PageHeader, Badge, Reveal, RevealGroup, Button } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import {
  Beaker,
  Code2,
  BookOpen,
  ArrowRight,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface LabPageProps {
  searchParams: Promise<{
    topic?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: LabPageProps): Promise<Metadata> {
  const params = await searchParams;
  const topic = params.topic;
  const title = topic
    ? `${topic.charAt(0).toUpperCase() + topic.slice(1)} Experiments — The Lab`
    : 'The Lab — Experiments, Prototypes & Interactive Studies';
  const description =
    'Small experiments, prototypes, and interactive studies built by Sourav Barui to explore algorithms, simulations, C++, WebAssembly, and graphics.';
  const canonicalUrl = `${SITE_CONFIG.url}/lab`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
    },
  };
}

export default async function LabPage({ searchParams }: LabPageProps) {
  const params = await searchParams;
  const activeTopic = params.topic || 'all';
  const query = (params.q || '').trim().toLowerCase();

  // Fetch all published applications
  const allApps = await getPublishedApps({ limit: 50 });

  // Filter for Lab/experimental projects:
  // Identified by category 'simulations' or tags indicating exploratory/simulation work
  const labKeywords = ['simulation', 'simulations', 'algorithms', 'canvas', 'cpp', 'webassembly', 'game-dev'];
  const rawLabApps = allApps.filter((app) => {
    const isSimCat = app.categorySlug === 'simulations' || app.primaryCategory.toLowerCase().includes('simulation');
    const isLabTag = labKeywords.some((kw) => app.primaryCategory.toLowerCase().includes(kw));
    return isSimCat || isLabTag;
  });

  // Apply topic filter
  const filteredApps = rawLabApps.filter((app) => {
    // Topic filtering
    if (activeTopic === 'wasm' && !app.name.toLowerCase().includes('wasm') && !app.shortDescription.toLowerCase().includes('c++') && !app.shortDescription.toLowerCase().includes('assembly')) {
      return false;
    }
    if (activeTopic === 'algorithms' && !app.shortDescription.toLowerCase().includes('algorithm') && !app.shortDescription.toLowerCase().includes('wave') && !app.name.toLowerCase().includes('wave')) {
      return false;
    }
    if (activeTopic === 'physics' && !app.shortDescription.toLowerCase().includes('physics') && !app.shortDescription.toLowerCase().includes('sand') && !app.shortDescription.toLowerCase().includes('particle')) {
      return false;
    }
    if (activeTopic === 'games' && app.categorySlug !== 'simulations' && !app.name.toLowerCase().includes('game') && !app.shortDescription.toLowerCase().includes('game')) {
      return false;
    }

    // Query search filtering
    if (query) {
      const matchName = app.name.toLowerCase().includes(query);
      const matchDesc = app.shortDescription.toLowerCase().includes(query);
      const matchCat = app.primaryCategory.toLowerCase().includes(query);
      return matchName || matchDesc || matchCat;
    }

    return true;
  });

  const topics = [
    { id: 'all', label: 'All Experiments' },
    { id: 'physics', label: 'Physics & Particles' },
    { id: 'algorithms', label: 'Algorithms & Procedural' },
    { id: 'wasm', label: 'C++ & WebAssembly' },
    { id: 'games', label: 'Interactive Studies' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/lab/#collection`,
        name: 'The Lab — Experiments & Prototypes',
        description: 'Interactive experiments, algorithms, and sandbox simulations built by Sourav Barui.',
        url: `${SITE_CONFIG.url}/lab`,
        publisher: {
          '@type': 'Person',
          name: 'Sourav Barui',
          url: `${SITE_CONFIG.url}/about`,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: filteredApps.map((app, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: app.name,
            url: `${SITE_CONFIG.url}/apps/${app.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/lab/#breadcrumb`,
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
            name: 'The Lab',
            item: `${SITE_CONFIG.url}/lab`,
          },
        ],
      },
    ],
  };

  return (
    <PageShell size="lg" glow>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-12">
        {/* Page Header */}
        <Reveal direction="down" distance={12}>
          <PageHeader
            eyebrow="Explorations & Prototypes"
            badge={
              <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium font-mono">
                {rawLabApps.length} {rawLabApps.length === 1 ? 'Experiment' : 'Experiments'}
              </Badge>
            }
            title="The Lab"
            description="Small experiments, prototypes, and interactive studies built to understand ideas, algorithms, physics, and graphics."
          />
        </Reveal>

        {/* Topic Filter Pills */}
        <Reveal direction="up" distance={10}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
            {topics.map((t) => {
              const isActive = activeTopic === t.id;
              return (
                <Link
                  key={t.id}
                  href={t.id === 'all' ? '/lab' : `/lab?topic=${t.id}`}
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 border flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/25'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{t.label}</span>
                </Link>
              );
            })}
          </div>
        </Reveal>

        {/* Experiments Grid or Empty State */}
        {filteredApps.length === 0 ? (
          <Reveal direction="up" distance={12}>
            <div className="py-16 px-6 text-center rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center mx-auto text-purple-400 shadow-lg">
                <Beaker className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-100">No experiments found</h3>
                <p className="text-xs text-zinc-400">
                  No experiments match the selected topic filter.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/lab">
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Show all experiments
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-6">
            <RevealGroup staggerDelay={0.05} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApps.map((app, idx) => {
                const formattedNum = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={app.id}
                    className="p-6 sm:p-7 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between space-y-5 group relative"
                  >
                    <div className="space-y-3.5">
                      {/* Card Header row */}
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800/60">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-purple-400 font-bold text-xs bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                            EXP-{formattedNum}
                          </span>
                          <span className="text-zinc-400 text-xs font-mono">{app.primaryCategory}</span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">Interactive Prototype</span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          <Link href={`/apps/${app.slug}`} className="focus-visible:outline-none focus-visible:underline">
                            {app.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {app.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Action & Trigger Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/apps/${app.slug}`}
                          className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View Project</span>
                        </Link>
                      </div>

                      <Link
                        href={`/apps/${app.slug}`}
                        className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Inspect experiment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </RevealGroup>
          </div>
        )}

        {/* Discovery Bridges: Flagship Work & Field Notes */}
        <Reveal direction="up" distance={14}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-zinc-800/70">
            {/* Work Callout */}
            <Link
              href={ROUTES.APPS}
              className="group p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Flagship Software & Systems
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Production web applications, browser extensions, developer tools, and client workstations.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-400 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
                <span>Browse flagship work</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Notes Callout */}
            <Link
              href={ROUTES.BLOG}
              className="group p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Engineering Notes & Field Logs
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Technical write-ups on canvas math, WebAssembly compilation, algorithms, and system design.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-400 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
                <span>Read engineering notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
