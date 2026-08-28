import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicHelpArticleBySlug, getRelatedHelpArticles } from '@/features/help/queries/get-help-article';
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
      title: 'Guide Not Found | ElseSourav Help Center',
      description: 'The requested documentation guide could not be found.',
    };
  }

  const title = article.seoTitle || `${article.title} | ElseSourav Help Center`;
  const description = article.seoDescription || article.excerpt || `Read the official guide on ${article.title}.`;
  const canonicalUrl = `https://elsesourav.com/help/${categorySlug}/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      modifiedTime: new Date(article.updatedAt).toISOString(),
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
  const articleUrl = `https://elsesourav.com/help/${categorySlug}/${article.slug}`;

  // JSON-LD structured data for article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    dateModified: new Date(article.updatedAt).toISOString(),
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author.displayName,
        }
      : {
          '@type': 'Organization',
          name: 'ElseSourav Documentation Team',
        },
    publisher: {
      '@type': 'Organization',
      name: 'ElseSourav',
      url: 'https://elsesourav.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
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
