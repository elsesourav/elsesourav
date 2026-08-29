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
import { Badge } from '@elsesourav/ui';
import { SITE_CONFIG } from '@elsesourav/config';

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    search?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = (params.q || params.search || '').trim();
  const category = params.category;
  const tag = params.tag;
  const hasFilterOrQuery = Boolean(query || category || tag || params.page);

  const title = query
    ? `Search: "${query}" in Engineering Journal`
    : category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Articles`
      : tag
        ? `#${tag} Engineering Notes`
        : 'Engineering Journal & Articles';

  const description =
    'Technical articles, architectural deep dives, software benchmarks, and release devlogs by ElseSourav.';
  const canonicalUrl = 'https://elsesourav.com/blog';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: hasFilterOrQuery
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: `${title} | ElseSourav`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ElseSourav`,
      description,
    },
  };
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
    name: 'ElseSourav Engineering Journal',
    description: 'Technical articles, software benchmarks, and architecture walkthroughs.',
    url: 'https://elsesourav.com/blog',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://elsesourav.com/blog/${post.slug}`,
      datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      author: {
        '@type': 'Person',
        name: post.author.displayName,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
              Engineering Journal
            </h1>
            <Badge variant="info" className="text-xs px-2.5 py-0.5 font-medium">
              {listingResult.totalCount} {listingResult.totalCount === 1 ? 'Article' : 'Articles'}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Deep-dive notes on web architecture, software systems, performance benchmarks, and
            release logs.
          </p>
        </div>

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
            <BlogPagination
              currentPage={listingResult.page}
              totalPages={listingResult.totalPages}
              totalMatches={listingResult.totalCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
