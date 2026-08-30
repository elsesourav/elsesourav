import { Metadata } from 'next';
import Link from 'next/link';
import { getArchivedApps } from '@/features/apps/queries/get-apps';
import { PageShell, PageHeader, Badge, Reveal, Button } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import {
  Archive,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Layers,
  Calendar,
} from 'lucide-react';
import type { AppListItem } from '@elsesourav/types';

interface ArchivePageProps {
  searchParams: Promise<{
    year?: string;
    category?: string;
    q?: string;
  }>;
}

import { buildPageMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({ searchParams }: ArchivePageProps): Promise<Metadata> {
  const params = await searchParams;
  const year = params.year;
  const title = year
    ? `${year} Software Index — The Archive`
    : 'The Archive — Historical Software & Chronology';
  const description =
    'A chronological record of software, utilities, academic tools, and earlier implementations built by Sourav Barui.';

  return buildPageMetadata({
    title,
    description,
    path: '/archive',
  });
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const selectedYear = params.year || 'all';
  const selectedCategory = params.category || 'all';
  const query = (params.q || '').trim().toLowerCase();

  // Fetch all archived / published items
  const allProjects = await getArchivedApps();

  // Extract available years from publishedAt/createdAt dates
  const yearSet = new Set<string>();
  allProjects.forEach((p) => {
    if (p.publishedAt) {
      const yr = new Date(p.publishedAt).getFullYear().toString();
      yearSet.add(yr);
    }
  });
  const availableYears = Array.from(yearSet).sort((a, b) => Number(b) - Number(a));

  // Extract available categories
  const categorySet = new Set<string>();
  allProjects.forEach((p) => categorySet.add(p.primaryCategory));
  const availableCategories = Array.from(categorySet).sort();

  // Filter projects
  const filteredProjects = allProjects.filter((p) => {
    const projectYear = p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : '2024';

    if (selectedYear !== 'all' && projectYear !== selectedYear) {
      return false;
    }

    if (selectedCategory !== 'all' && p.primaryCategory !== selectedCategory) {
      return false;
    }

    if (query) {
      const matchName = p.name.toLowerCase().includes(query);
      const matchDesc = p.shortDescription.toLowerCase().includes(query);
      const matchCat = p.primaryCategory.toLowerCase().includes(query);
      return matchName || matchDesc || matchCat;
    }

    return true;
  });

  // Group filtered projects by Year
  const groupedByYear = filteredProjects.reduce<Record<string, AppListItem[]>>((acc, project) => {
    const yr = project.publishedAt ? new Date(project.publishedAt).getFullYear().toString() : 'Legacy';
    if (!acc[yr]) {
      acc[yr] = [];
    }
    acc[yr].push(project);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/archive/#collection`,
        name: 'The Archive — Historical Software Index',
        description: 'Chronological timeline of software projects and utilities built by Sourav Barui.',
        url: `${SITE_CONFIG.url}/archive`,
        publisher: {
          '@type': 'Person',
          name: 'Sourav Barui',
          url: `${SITE_CONFIG.url}/about`,
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: filteredProjects.map((app, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: app.name,
            url: `${SITE_CONFIG.url}/apps/${app.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/archive/#breadcrumb`,
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
            name: 'The Archive',
            item: `${SITE_CONFIG.url}/archive`,
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
            eyebrow="Historical Chronology"
            badge={
              <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium font-mono">
                {allProjects.length} Records
              </Badge>
            }
            title="The Archive"
            description="A chronological record of software, utilities, academic tools, and earlier implementations built by Sourav."
          />
        </Reveal>

        {/* Year and Category Filter Strip */}
        <Reveal direction="up" distance={10}>
          <div className="space-y-3 p-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm">
            {/* Year filter pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                <span className="text-zinc-500 font-mono text-xs mr-1 hidden sm:inline">Year:</span>
                <Link
                  href={selectedCategory !== 'all' ? `/archive?category=${encodeURIComponent(selectedCategory)}` : '/archive'}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    selectedYear === 'all'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All Years
                </Link>
                {availableYears.map((yr) => {
                  const isActive = selectedYear === yr;
                  const href = selectedCategory !== 'all' ? `/archive?year=${yr}&category=${encodeURIComponent(selectedCategory)}` : `/archive?year=${yr}`;
                  return (
                    <Link
                      key={yr}
                      href={href}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {yr}
                    </Link>
                  );
                })}
              </div>

              {/* Clear filters trigger if active */}
              {(selectedYear !== 'all' || selectedCategory !== 'all' || query) && (
                <Link href="/archive" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset timeline</span>
                </Link>
              )}
            </div>

            {/* Category filter pills */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pt-2 border-t border-zinc-800/60">
                <span className="text-zinc-500 font-mono text-xs mr-1 hidden sm:inline">Category:</span>
                <Link
                  href={selectedYear !== 'all' ? `/archive?year=${selectedYear}` : '/archive'}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all border ${
                    selectedCategory === 'all'
                      ? 'bg-zinc-800 border-zinc-700 text-white'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All
                </Link>
                {availableCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const href = selectedYear !== 'all' ? `/archive?year=${selectedYear}&category=${encodeURIComponent(cat)}` : `/archive?category=${encodeURIComponent(cat)}`;
                  return (
                    <Link
                      key={cat}
                      href={href}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all border shrink-0 ${
                        isActive
                          ? 'bg-zinc-800 border-zinc-700 text-white'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {/* Chronological Table / Index Presentation */}
        {filteredProjects.length === 0 ? (
          <Reveal direction="up" distance={12}>
            <div className="py-16 px-6 text-center rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-400">
                <Archive className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-100">No archive records found</h3>
                <p className="text-xs text-zinc-400">
                  No projects match your active timeline or category filters.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/archive">
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset archive timeline
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-12">
            {sortedYears.map((year) => {
              const projectsInYear = groupedByYear[year] || [];
              return (
                <Reveal key={year} direction="up" distance={14}>
                  <section aria-labelledby={`year-heading-${year}`} className="space-y-4">
                    {/* Year Group Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-zinc-800/80">
                      <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h2 id={`year-heading-${year}`} className="text-xl font-bold font-mono text-white tracking-tight">
                        {year}
                      </h2>
                      <span className="text-xs font-mono text-zinc-500">
                        ({projectsInYear.length} {projectsInYear.length === 1 ? 'record' : 'records'})
                      </span>
                    </div>

                    {/* Dense Editorial List Rows */}
                    <div className="divide-y divide-zinc-800/60 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm overflow-hidden shadow-xl">
                      {projectsInYear.map((project, idx) => {
                        const formattedIndex = String(idx + 1).padStart(2, '0');
                        return (
                          <div
                            key={project.id}
                            className="p-5 sm:p-6 hover:bg-zinc-900/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                          >
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              {/* Sequence index */}
                              <span className="font-mono text-xs text-zinc-500 font-semibold pt-0.5 sm:pt-0 shrink-0">
                                {formattedIndex}
                              </span>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    href={`/apps/${project.slug}`}
                                    className="font-bold text-base text-zinc-100 group-hover:text-indigo-300 transition-colors focus-visible:outline-none focus-visible:underline"
                                  >
                                    {project.name}
                                  </Link>

                                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-400 border border-zinc-700/60">
                                    {project.primaryCategory}
                                  </span>

                                  {project.currentVersion && (
                                    <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-1.5 py-0.2 rounded">
                                      v{project.currentVersion}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl line-clamp-2">
                                  {project.shortDescription}
                                </p>
                              </div>
                            </div>

                            {/* Action Links */}
                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center pt-2 md:pt-0">
                              <Link
                                href={`/apps/${project.slug}`}
                                className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Overview</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* Discovery Bridges: Apps & Field Notes */}
        <Reveal direction="up" distance={14}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-zinc-800/70">
            {/* Apps Callout */}
            <Link
              href={ROUTES.APPS}
              className="group p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Active Software & Systems
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Browse actively maintained web applications, developer utilities, and creative software.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-400 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
                <span>Explore active apps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Notes Callout */}
            <Link
              href={ROUTES.BLOG}
              className="group p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                  Engineering Field Notes
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Technical write-ups, architecture decisions, and observations recorded while building.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
                <span>Read field notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
