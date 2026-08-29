import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_CONFIG } from '@elsesourav/config';
import {
  getPublicHelpArticleBySlug,
  getRelatedHelpArticles,
} from '@/features/help/queries/get-help-article';
import { HelpArticleHeader } from '@/features/help/components/HelpArticleHeader';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import { HelpArticleFeedback } from '@/features/help/components/HelpArticleFeedback';
import { RelatedHelpArticles } from '@/features/help/components/RelatedHelpArticles';
import { HelpSupportCTA } from '@/features/help/components/HelpSupportCTA';

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
      title: 'Guide Not Found',
      description: 'The requested documentation guide could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.excerpt || `Read the official guide on ${article.title}.`;
  const canonicalUrl = `${SITE_CONFIG.url}/help/${categorySlug}/${article.slug}`;

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
      modifiedTime: new Date(article.updatedAt).toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
    },
  };
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { categorySlug, articleSlug } = await params;
  const article = await getPublicHelpArticleBySlug(articleSlug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedHelpArticles(article.id, article.category.id, 3);
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Article Header */}
        <HelpArticleHeader article={article} categorySlug={categorySlug} />

        {/* Article Body */}
        <main className="max-w-4xl mx-auto space-y-10">
          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/20 p-6 sm:p-10 backdrop-blur-sm">
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
    </div>
  );
}
