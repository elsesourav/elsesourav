import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getHelpCategoryBySlug } from '@/features/help/queries/get-help';
import { HelpSearchBar } from '@/features/help/components/HelpSearchBar';
import { HelpArticleCard } from '@/features/help/components/HelpArticleCard';
import { HelpEmptyState } from '@/features/help/components/HelpEmptyState';
import { HelpSupportCTA } from '@/features/help/components/HelpSupportCTA';
import { Badge } from '@elsesourav/ui';
import { ChevronRight, Folder } from 'lucide-react';

interface HelpCategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export async function generateMetadata({ params }: HelpCategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getHelpCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested help category does not exist.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${category.name} Guides & Documentation`;
  const description = category.description || `Browse documentation, tutorials, and troubleshooting guides for ${category.name}.`;
  const canonicalUrl = `https://elsesourav.com/help/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ElseSourav`,
      description,
      url: canonicalUrl,
      siteName: 'ElseSourav',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ElseSourav`,
      description,
    },
  };
}

export default async function HelpCategoryPage({ params }: HelpCategoryPageProps) {
  const { categorySlug } = await params;
  const category = await getHelpCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const categoryUrl = `https://elsesourav.com/help/${category.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${categoryUrl}/#category`,
        name: category.name,
        description: category.description || `Guides and articles in ${category.name}.`,
        url: categoryUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: category.articles.map((art, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: art.title,
            url: `https://elsesourav.com/help/${category.slug}/${art.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${categoryUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://elsesourav.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Help Center',
            item: 'https://elsesourav.com/help',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: categoryUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Navigation & Breadcrumbs */}
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs text-zinc-400" aria-label="Breadcrumb">
            <Link href="/help" className="hover:text-white transition-colors">
              Help Center
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium">{category.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Folder className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
                  {category.name}
                </h1>
                <Badge variant="info" className="text-xs px-2.5 py-0.5">
                  {category.articles.length} {category.articles.length === 1 ? 'Article' : 'Articles'}
                </Badge>
              </div>

              {category.description && (
                <p className="text-sm text-zinc-400 max-w-2xl pl-13">
                  {category.description}
                </p>
              )}
            </div>

            <div className="w-full sm:w-80">
              <HelpSearchBar categorySlug={category.slug} placeholder={`Search in ${category.name}...`} />
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <section className="space-y-6" aria-label="Category articles">
          {category.articles.length === 0 ? (
            <HelpEmptyState categoryName={category.name} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.articles.map((art) => (
                <HelpArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </section>

        {/* Support CTA */}
        <HelpSupportCTA />
      </div>
    </div>
  );
}
