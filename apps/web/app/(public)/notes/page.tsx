import { Metadata } from 'next';
import {
  getPublicBlogListing,
  getBlogCategories,
  getBlogTags,
} from '@/features/blog/queries/get-blog';
import { BlogCard } from '@/features/blog/components/BlogCard';
import { BlogDiscoveryBar } from '@/features/blog/components/BlogDiscoveryBar';
import { BlogPagination } from '@/features/blog/components/BlogPagination';
import { BlogEmptyState } from '@/features/blog/components/BlogEmptyState';
import { PageShell, PageHeader, Badge } from '@elsesourav/ui';

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    search?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

import { buildPageMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = (params.q || params.search || '').trim();
  const category = params.category;
  const tag = params.tag;
  const hasFilterOrQuery = Boolean(query || category || tag || params.page);

  const title = query
    ? `Search: "${query}" in Field Notes`
    : category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} — Field Notes`
      : tag
        ? `#${tag} — Field Notes`
        : 'Field Notes & Technical Writing';

  const description =
    'Technical articles, architectural deep dives, software benchmarks, and release devlogs by Sourav Barui.';

  return buildPageMetadata({
    title,
    description,
    path: '/notes',
    noIndex: hasFilterOrQuery,
  });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const query = (params.q || params.search || '').trim();
  const categorySlug = params.category || undefined;
  const tagSlug = params.tag || undefined;
  const page = parseInt(params.page || '1', 10) || 1;

  // Parallel server data fetching
  const [categories, tags, listingResult] = await Promise.all([
    getBlogCategories(),
    getBlogTags(),
    getPublicBlogListing({
      query: query || undefined,
      categorySlug,
      tagSlug,
      page,
      limit: 9,
    }),
  ]);

  const hasFilters = Boolean(categorySlug || tagSlug || query);
  const posts = listingResult.items;

  // JSON-LD structured data for blog
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ElseSourav Notes & Writing',
    description: 'Technical observations, architecture notes, and lessons learned while building software.',
    url: 'https://elsesourav.com/notes',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://elsesourav.com/notes/${post.slug}`,
      datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      author: {
        '@type': 'Person',
        name: post.author.displayName,
      },
    })),
  };

  return (
    <PageShell size="lg" glow>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8">
        {/* Header Section */}
        <PageHeader
          eyebrow="Writing & Observations"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              {listingResult.totalCount} {listingResult.totalCount === 1 ? 'Note' : 'Notes'}
            </Badge>
          }
          title="Notes"
          description="Thoughts, technical observations, architecture notes, and things learned while building software."
        />

        {/* Discovery & Search Bar */}
        <BlogDiscoveryBar categories={categories} tags={tags} />

        {/* Blog Post Grid or Empty State */}
        {posts.length === 0 ? (
          <BlogEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, idx) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  isFeatured={idx === 0 && page === 1 && !hasFilters}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {listingResult.totalPages > 1 && (
              <BlogPagination
                currentPage={listingResult.page}
                totalPages={listingResult.totalPages}
                totalMatches={listingResult.totalCount}
              />
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
