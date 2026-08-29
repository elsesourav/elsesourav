import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE_CONFIG } from '@elsesourav/config';
import {
  getPublicBlogPostBySlug,
  getRelatedBlogPosts,
} from '@/features/blog/queries/get-blog-post';
import { BlogArticleHeader } from '@/features/blog/components/BlogArticleHeader';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import { RelatedPosts } from '@/features/blog/components/RelatedPosts';
import { getBlogCoverUrl } from '@elsesourav/media';
import { Tag } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested engineering article could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || `Read ${post.title} on ${SITE_CONFIG.name}.`;
  const coverUrl = post.coverImageUrl ? getBlogCoverUrl(post.coverImageUrl, 1200, 630) : undefined;
  const canonicalUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [post.author.displayName],
      images: coverUrl ? [{ url: coverUrl, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: coverUrl ? [coverUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(post.id, post.category?.id, 3);
  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;

  // JSON-LD structured data for article & breadcrumbs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}/#article`,
        headline: post.title,
        description: post.excerpt,
        image: post.coverImageUrl ? [getBlogCoverUrl(post.coverImageUrl, 1200, 630)] : undefined,
        datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        dateModified: new Date(post.updatedAt).toISOString(),
        author: {
          '@type': 'Person',
          name: post.author.displayName,
          url: post.author.username
            ? `${SITE_CONFIG.url}/u/${post.author.username}`
            : undefined,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${postUrl}/#breadcrumb`,
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
            name: 'Blog',
            item: `${SITE_CONFIG.url}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Article Header */}
        <BlogArticleHeader post={post} postUrl={postUrl} />

        {/* Article Content Container */}
        <main className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/20 p-6 sm:p-10 backdrop-blur-sm">
            <BlogContentRenderer content={post.content} />

            {/* Tag Pills Footer */}
            {post.tags.length > 0 && (
              <div className="pt-8 mt-8 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Tags:
                </span>
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors">
                      #{tag.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Related Articles Section */}
        <RelatedPosts posts={relatedPosts} />
      </div>
    </div>
  );
}
