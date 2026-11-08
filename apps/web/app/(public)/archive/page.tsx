import { Metadata } from 'next';
import Link from 'next/link';
import { getArchivedApps } from '@/features/apps/queries/get-apps';
import { PageShell, PageHeader, Badge, Reveal, Button, cn } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Archive, RefreshCw, BookOpen, ArrowRight, Layers, Calendar } from 'lucide-react';
import type { AppListItem } from '@elsesourav/types';
import { buildPageMetadata } from '@/lib/seo-metadata';
import { ArchiveProjectRow } from '@/features/apps/components/archive/ArchiveProjectRow';

interface ArchivePageProps {
  searchParams: Promise<{
    year?: string;
    category?: string;
    q?: string;
  }>;
}

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
    const yr = project.publishedAt
      ? new Date(project.publishedAt).getFullYear().toString()
      : 'Legacy';
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
        description:
          'Chronological timeline of software projects and utilities built by Sourav Barui.',
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
    <PageShell
      size="lg"
      glow
      padded={false}
      className="pt-1.5 sm:pt-4 md:pt-6 pb-6 sm:pb-10 md:pb-14"
      containerClassName="px-2.5 sm:px-6 lg:px-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
        {/* Page Header */}
        <Reveal direction="down" distance={8}>
          <div data-testid="archive-header">
            <PageHeader
              eyebrow="Historical Chronology"
              badge={
                <Badge
                  variant="primary"
                  size="sm"
                  className="text-[10px] sm:text-xs font-mono font-medium px-2 py-0.5"
                >
                  {allProjects.length} Records
                </Badge>
              }
              title="The Archive"
              description="A chronological record of software, utilities, academic tools, and earlier implementations built by Sourav."
              className="pb-3 sm:pb-5 md:pb-6 mb-0 border-b border-zinc-800/40 sm:border-zinc-800/70 [&_h1]:text-2xl sm:[&_h1]:text-3xl md:[&_h1]:text-4xl lg:[&_h1]:text-5xl [&_p]:text-xs sm:[&_p]:text-sm md:[&_p]:text-base [&_p]:text-zinc-400 [&_p]:leading-relaxed [&>.space-y-3]:space-y-1.5 sm:[&>.space-y-3]:space-y-2.5 md:[&>.space-y-3]:space-y-3"
            />
          </div>
        </Reveal>

        {/* Year and Category Filter Strip */}
        <Reveal direction="up" distance={8}>
          <div
            data-testid="archive-filters"
            className="p-2 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl md:rounded-3xl border border-zinc-800/40 sm:border-zinc-800/70 bg-zinc-900/20 sm:bg-zinc-900/30 backdrop-blur-sm space-y-1.5 sm:space-y-2.5 md:space-y-3"
          >
            {/* Year filter buttons */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2.5">
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar text-xs py-0.5">
                <span className="text-zinc-500 font-mono text-[10px] sm:text-xs mr-1 hidden sm:inline">
                  Year:
                </span>
                <Link
                  href={
                    selectedCategory !== 'all'
                      ? `/archive?category=${encodeURIComponent(selectedCategory)}`
                      : '/archive'
                  }
                  className="shrink-0"
                >
                  <Button
                    variant={selectedYear === 'all' ? 'primary' : 'outline'}
                    size="xs"
                    className={cn(
                      'h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all',
                      selectedYear === 'all'
                        ? 'shadow-sm'
                        : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    )}
                  >
                    All Years
                  </Button>
                </Link>
                {availableYears.map((yr) => {
                  const isActive = selectedYear === yr;
                  const href =
                    selectedCategory !== 'all'
                      ? `/archive?year=${yr}&category=${encodeURIComponent(selectedCategory)}`
                      : `/archive?year=${yr}`;
                  return (
                    <Link key={yr} href={href} className="shrink-0">
                      <Button
                        variant={isActive ? 'primary' : 'outline'}
                        size="xs"
                        className={cn(
                          'h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs font-mono font-medium rounded-lg transition-all',
                          isActive
                            ? 'shadow-sm'
                            : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        )}
                      >
                        {yr}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Clear filters trigger if active */}
              {(selectedYear !== 'all' || selectedCategory !== 'all' || query) && (
                <Link href="/archive" className="shrink-0">
                  <Button
                    variant="ghost"
                    size="xs"
                    leftIcon={<RefreshCw className="w-3 h-3 text-indigo-400" />}
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs font-mono text-indigo-400 hover:text-indigo-300 gap-1 rounded-lg"
                  >
                    Reset timeline
                  </Button>
                </Link>
              )}
            </div>

            {/* Category filter buttons */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pt-1.5 sm:pt-2 border-t border-zinc-800/30 sm:border-zinc-800/50">
                <span className="text-zinc-500 font-mono text-[10px] sm:text-xs mr-1 hidden sm:inline">
                  Category:
                </span>
                <Link
                  href={selectedYear !== 'all' ? `/archive?year=${selectedYear}` : '/archive'}
                  className="shrink-0"
                >
                  <Button
                    variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
                    size="xs"
                    className={cn(
                      'h-5 sm:h-6 px-1.5 sm:px-2 text-[9px] sm:text-[11px] font-mono rounded-md shrink-0 transition-all',
                      selectedCategory === 'all'
                        ? 'bg-zinc-800 border border-zinc-700 text-white font-medium'
                        : 'border border-zinc-800/60 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    )}
                  >
                    All
                  </Button>
                </Link>
                {availableCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const href =
                    selectedYear !== 'all'
                      ? `/archive?year=${selectedYear}&category=${encodeURIComponent(cat)}`
                      : `/archive?category=${encodeURIComponent(cat)}`;
                  return (
                    <Link key={cat} href={href} className="shrink-0">
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="xs"
                        className={cn(
                          'h-5 sm:h-6 px-1.5 sm:px-2 text-[9px] sm:text-[11px] font-mono rounded-md shrink-0 transition-all',
                          isActive
                            ? 'bg-zinc-800 border border-zinc-700 text-white font-medium'
                            : 'border border-zinc-800/60 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        )}
                      >
                        {cat}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>

        {/* Chronological Table / Index Presentation */}
        {filteredProjects.length === 0 ? (
          <Reveal direction="up" distance={8}>
            <div className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 text-center rounded-xl sm:rounded-2xl md:rounded-3xl border border-zinc-800/40 sm:border-zinc-800/70 bg-zinc-900/20 sm:bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-400">
                <Archive className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-zinc-100">No archive records found</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  No projects match your active timeline or category filters.
                </p>
              </div>
              <div className="pt-1 sm:pt-2">
                <Link href="/archive">
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<RefreshCw className="w-3 h-3" />}
                    className="border-zinc-700 text-zinc-300 text-[11px] sm:text-xs gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3"
                  >
                    Reset archive timeline
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <div data-testid="archive-timeline" className="space-y-5 sm:space-y-7 md:space-y-9">
            {sortedYears.map((year) => {
              const projectsInYear = groupedByYear[year] || [];
              return (
                <Reveal key={year} direction="up" distance={8}>
                  <section
                    aria-labelledby={`year-heading-${year}`}
                    className="space-y-2 sm:space-y-3 md:space-y-3.5"
                  >
                    {/* Year Group Header */}
                    <div className="flex items-center gap-2 sm:gap-3 pb-1.5 sm:pb-2 border-b border-zinc-800/40 sm:border-zinc-800/70">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs shrink-0">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      </div>
                      <h2
                        id={`year-heading-${year}`}
                        className="text-sm sm:text-base md:text-lg lg:text-xl font-bold font-mono text-white tracking-tight"
                      >
                        {year}
                      </h2>
                      <span className="text-[10px] sm:text-xs font-mono text-zinc-500">
                        ({projectsInYear.length}{' '}
                        {projectsInYear.length === 1 ? 'record' : 'records'})
                      </span>
                    </div>

                    {/* Dense Editorial List Rows */}
                    <div className="divide-y divide-zinc-800/30 sm:divide-zinc-800/60 rounded-xl sm:rounded-2xl md:rounded-3xl border border-zinc-800/40 sm:border-zinc-800/70 bg-zinc-900/20 sm:bg-zinc-900/30 backdrop-blur-sm overflow-hidden shadow-md sm:shadow-xl">
                      {projectsInYear.map((project, idx) => (
                        <ArchiveProjectRow key={project.id} project={project} index={idx} />
                      ))}
                    </div>
                  </section>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* Discovery Bridges: Apps & Field Notes */}
        <Reveal direction="up" distance={8}>
          <div
            data-testid="archive-bridges"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4 pt-4 sm:pt-6 md:pt-8 border-t border-zinc-800/40 sm:border-zinc-800/70"
          >
            {/* Apps Callout */}
            <Link
              href={ROUTES.APPS}
              className="group p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-zinc-800/50 sm:border-zinc-800/80 bg-zinc-900/20 sm:bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-indigo-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl md:rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                  <Layers className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Active Software & Systems
                </h3>
                <p className="text-[11px] sm:text-xs md:text-sm text-zinc-400 leading-relaxed">
                  Browse actively maintained web applications, developer utilities, and creative
                  software.
                </p>
              </div>
              <div className="pt-2 sm:pt-3 md:pt-4">
                <Button
                  variant="ghost"
                  size="xs"
                  rightIcon={<ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />}
                  className="text-[10px] sm:text-xs font-mono text-indigo-400 p-0 h-auto hover:bg-transparent hover:text-indigo-300 cursor-pointer"
                >
                  Explore active apps
                </Button>
              </div>
            </Link>

            {/* Updates Callout */}
            <Link
              href={ROUTES.UPDATES}
              className="group p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-zinc-800/50 sm:border-zinc-800/80 bg-zinc-900/20 sm:bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-cyan-500/40 transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl md:rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                  Engineering Updates
                </h3>
                <p className="text-[11px] sm:text-xs md:text-sm text-zinc-400 leading-relaxed">
                  Technical write-ups, architecture decisions, and observations recorded while
                  building.
                </p>
              </div>
              <div className="pt-2 sm:pt-3 md:pt-4">
                <Button
                  variant="ghost"
                  size="xs"
                  rightIcon={<ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />}
                  className="text-[10px] sm:text-xs font-mono text-cyan-400 p-0 h-auto hover:bg-transparent hover:text-cyan-300 cursor-pointer"
                >
                  Read engineering updates
                </Button>
              </div>
            </Link>
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}
