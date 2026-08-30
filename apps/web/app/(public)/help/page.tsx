import { Metadata } from 'next';
import {
  getPublicHelpCategories,
  searchPublicHelpArticles,
} from '@/features/help/queries/get-help';
import { HelpSearchBar } from '@/features/help/components/HelpSearchBar';
import { HelpCategoryCard } from '@/features/help/components/HelpCategoryCard';
import { HelpArticleCard } from '@/features/help/components/HelpArticleCard';
import { HelpEmptyState } from '@/features/help/components/HelpEmptyState';
import { HelpSupportCTA } from '@/features/help/components/HelpSupportCTA';
import { PageShell, Badge } from '@elsesourav/ui';
import { SITE_CONFIG } from '@elsesourav/config';
import { LifeBuoy, Sparkles } from 'lucide-react';

interface HelpPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

import { buildPageMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({ searchParams }: HelpPageProps): Promise<Metadata> {
  const params = await searchParams;
  const searchQuery = (params.q || '').trim();
  const hasQuery = Boolean(searchQuery);

  const title = hasQuery
    ? `Search: "${searchQuery}" in Help Center`
    : 'Help Center & Documentation';

  const description =
    'Guides, FAQs, troubleshooting advice, and documentation for ElseSourav web tools and developer software.';

  return buildPageMetadata({
    title,
    description,
    path: '/help',
    noIndex: hasQuery,
  });
}

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const params = await searchParams;
  const searchQuery = (params.q || '').trim();

  // Search Results Mode
  if (searchQuery) {
    const searchResult = await searchPublicHelpArticles({ query: searchQuery, limit: 20 });
    return (
      <PageShell size="lg" glow>
        <div className="space-y-10">
          {/* Header & Search Bar */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
              Help Center Search
            </h1>
            <HelpSearchBar />
          </div>

          {/* Results Summary */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  Search results for &ldquo;
                  <span className="text-[hsl(var(--foreground))] font-semibold">{searchQuery}</span>&rdquo;
                </span>
                <Badge variant="primary" className="text-xs px-2 py-0.5">
                  {searchResult.totalCount} {searchResult.totalCount === 1 ? 'guide' : 'guides'}
                </Badge>
              </div>
            </div>

            {searchResult.items.length === 0 ? (
              <HelpEmptyState query={searchQuery} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResult.items.map((art) => (
                  <HelpArticleCard key={art.id} article={art} />
                ))}
              </div>
            )}
          </div>

          <HelpSupportCTA />
        </div>
      </PageShell>
    );
  }

  // Help Home Mode
  const categories = await getPublicHelpCategories();

  // Collect popular/recent guides from categories
  const featuredArticles = categories.flatMap((c) => c.articles).slice(0, 6);

  // Structured JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: `${SITE_CONFIG.name} Help Center & Documentation`,
    description: 'Documentation, guides, and troubleshooting for ElseSourav software.',
    url: `${SITE_CONFIG.url}/help`,
  };

  return (
    <PageShell size="lg" glow>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-16">
        {/* Hero Section */}
        <section
          className="text-center space-y-5 max-w-3xl mx-auto pt-4"
          aria-labelledby="help-hero-title"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Help Center & Knowledge Base</span>
          </div>

          <h1
            id="help-hero-title"
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[hsl(var(--foreground))]"
          >
            How can we help you?
          </h1>

          <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] max-w-xl mx-auto leading-relaxed">
            Guides, FAQs, troubleshooting advice, and step-by-step documentation for ElseSourav
            tools.
          </p>

          <div className="pt-2">
            <HelpSearchBar />
          </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-6" aria-labelledby="categories-heading">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border-subtle))] pb-4">
            <h2 id="categories-heading" className="text-xl font-bold text-[hsl(var(--foreground))]">
              Browse by Category
            </h2>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {categories.length} Knowledge Base {categories.length === 1 ? 'Topic' : 'Topics'}
            </span>
          </div>

          {categories.length === 0 ? (
            <HelpEmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <HelpCategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </section>

        {/* Popular / Featured Guides */}
        {featuredArticles.length > 0 && (
          <section className="space-y-6" aria-labelledby="popular-guides-heading">
            <div className="flex items-center gap-2 border-b border-[hsl(var(--border-subtle))] pb-4">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 id="popular-guides-heading" className="text-xl font-bold text-[hsl(var(--foreground))]">
                Popular Guides & Tutorials
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredArticles.map((art) => (
                <HelpArticleCard key={art.id} article={art} />
              ))}
            </div>
          </section>
        )}

        {/* Support Escalation CTA */}
        <HelpSupportCTA />
      </div>
    </PageShell>
  );
}
