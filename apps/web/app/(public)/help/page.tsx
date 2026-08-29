import { Metadata } from 'next';
import { getPublicHelpCategories, searchPublicHelpArticles } from '@/features/help/queries/get-help';
import { HelpSearchBar } from '@/features/help/components/HelpSearchBar';
import { HelpCategoryCard } from '@/features/help/components/HelpCategoryCard';
import { HelpArticleCard } from '@/features/help/components/HelpArticleCard';
import { HelpEmptyState } from '@/features/help/components/HelpEmptyState';
import { HelpSupportCTA } from '@/features/help/components/HelpSupportCTA';
import { Badge } from '@elsesourav/ui';
import { LifeBuoy, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center & Documentation | ElseSourav',
  description: 'Guides, FAQs, troubleshooting advice, and documentation for ElseSourav web tools and developer software.',
  alternates: {
    canonical: 'https://elsesourav.com/help',
  },
  openGraph: {
    title: 'Help Center & Documentation | ElseSourav',
    description: 'Guides, FAQs, and troubleshooting documentation for ElseSourav tools.',
    url: 'https://elsesourav.com/help',
    type: 'website',
  },
};

interface HelpPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const params = await searchParams;
  const searchQuery = (params.q || '').trim();

  // Search Results Mode
  if (searchQuery) {
    const searchResult = await searchPublicHelpArticles({ query: searchQuery, limit: 20 });
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Header & Search Bar */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              Help Center Search
            </h1>
            <HelpSearchBar />
          </div>

          {/* Results Summary */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">
                  Search results for &ldquo;<span className="text-zinc-200 font-semibold">{searchQuery}</span>&rdquo;
                </span>
                <Badge variant="info" className="text-xs px-2 py-0.5">
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
      </div>
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
    name: 'ElseSourav Help Center & Documentation',
    description: 'Documentation, guides, and troubleshooting for ElseSourav software.',
    url: 'https://elsesourav.com/help',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto pt-4" aria-labelledby="help-hero-title">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 text-xs font-medium">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Help Center & Knowledge Base</span>
          </div>

          <h1 id="help-hero-title" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100">
            How can we help you?
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Guides, FAQs, troubleshooting advice, and step-by-step documentation for ElseSourav tools.
          </p>

          <div className="pt-2">
            <HelpSearchBar />
          </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-6" aria-labelledby="categories-heading">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <h2 id="categories-heading" className="text-xl font-bold text-zinc-100">
              Browse by Category
            </h2>
            <span className="text-xs text-zinc-500">
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
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 id="popular-guides-heading" className="text-xl font-bold text-zinc-100">
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

        {/* Support CTA */}
        <HelpSupportCTA />
      </div>
    </div>
  );
}
