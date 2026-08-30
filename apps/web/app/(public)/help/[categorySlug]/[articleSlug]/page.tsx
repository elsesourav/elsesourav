import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_CONFIG } from '@elsesourav/config';
import { buildHelpArticleMetadata } from '@/lib/seo-metadata';
import {
  getPublicHelpArticleBySlug,
  getRelatedHelpArticles,
} from '@/features/help/queries/get-help-article';
import { HelpArticleHeader } from '@/features/help/components/HelpArticleHeader';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import { HelpArticleFeedback } from '@/features/help/components/HelpArticleFeedback';
import { RelatedHelpArticles } from '@/features/help/components/RelatedHelpArticles';
import { HelpSupportCTA } from '@/features/help/components/HelpSupportCTA';
import { PageShell } from '@elsesourav/ui';

interface HelpArticlePageProps {
  params: Promise<{
    categorySlug: string;
    articleSlug: string;
  }>;
}

export async function generateMetadata({ params }: HelpArticlePageProps): Promise<Metadata> {
  const { categorySlug, articleSlug } = await params;
  const article = await getPublicHelpArticleBySlug(articleSlug);

  if (!article) {
    return {
      title: `Guide Not Found — ${SITE_CONFIG.name}`,
      description: 'The requested documentation guide could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildHelpArticleMetadata({
    title: article.seoTitle || article.title,
    slug: article.slug,
    categorySlug,
    summary: article.seoDescription || article.excerpt,
    updatedAt: article.updatedAt,
  });
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { categorySlug, articleSlug } = await params;
  const article = await getPublicHelpArticleBySlug(articleSlug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedHelpArticles(article.id, article.category?.id, 3);
  const articleUrl = `${SITE_CONFIG.url}/help/${categorySlug}/${article.slug}`;

  // JSON-LD structured data for article & breadcrumbs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${articleUrl}/#article`,
        headline: article.title,
        description: article.excerpt,
        datePublished: article.publishedAt
          ? new Date(article.publishedAt).toISOString()
          : undefined,
        dateModified: new Date(article.updatedAt).toISOString(),
        author: article.author
          ? {
              '@type': 'Person',
              name: article.author.displayName,
            }
          : {
              '@type': 'Organization',
              name: `${SITE_CONFIG.name} Documentation Team`,
            },
        publisher: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${articleUrl}/#breadcrumb`,
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
            name: 'Help Center',
            item: `${SITE_CONFIG.url}/help`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.category.name,
            item: `${SITE_CONFIG.url}/help/${categorySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: article.title,
            item: articleUrl,
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
        <HelpArticleHeader article={article} categorySlug={categorySlug} />

        {/* Article Body */}
        <main className="max-w-4xl mx-auto space-y-10">
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-10 backdrop-blur-sm shadow-xl">
            <BlogContentRenderer content={article.content} />
          </div>

          {/* Helpfulness Feedback Vote */}
          <HelpArticleFeedback
            articleId={article.id}
            initialHelpfulCount={article.helpfulCount}
            initialUnhelpfulCount={article.unhelpfulCount}
          />
        </main>

        {/* Related Guides in this Category */}
        <RelatedHelpArticles articles={relatedArticles} />

        {/* Support CTA */}
        <HelpSupportCTA />
      </div>
    </PageShell>
  );
}
