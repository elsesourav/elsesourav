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
import { PageShell } from '@elsesourav/ui';
import { Tag } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { buildNoteMetadata } from '@/lib/seo-metadata';

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    return {
      title: `Article Not Found — ${SITE_CONFIG.name}`,
      description: 'The requested engineering note or article could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildNoteMetadata(post);
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
            name: 'Journal',
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
    <PageShell size="lg" glow>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-12">
        {/* Article Header */}
        <BlogArticleHeader post={post} postUrl={postUrl} />

        {/* Long-Form Article Content */}
        <article className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/20 p-6 sm:p-10 backdrop-blur-sm shadow-xl">
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
        </article>

        {/* Related Articles Section */}
        <RelatedPosts posts={relatedPosts} />
      </div>
    </PageShell>
  );
}
