import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  Clock,
  FileQuestion,
  MessageSquareHeart,
  BookOpen,
} from 'lucide-react';
import { Button, Badge, Skeleton, ErrorState, SEO } from '@/components';
import { BlogContentRenderer } from '@/components/blog';
import { HelpArticleCard, ArticleHelpfulness } from '@/components/help';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import { buildHelpArticleSEO } from '@/utils/seo.utils';
import { ROUTES } from '@/constants/routes';
import './HelpArticlePage.css';

export const HelpArticlePage: React.FC = () => {
  const { articleSlug } = useParams<{
    articleSlug: string;
  }>();

  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<readonly HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const loadArticleData = useCallback(async () => {
    if (!articleSlug) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const artRes = await helpService.getArticleBySlug(articleSlug);
      if (!artRes.success) {
        setError('Failed to load article.');
        setIsLoading(false);
        return;
      }

      if (!artRes.data || artRes.data.status !== 'published') {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      const art = artRes.data;
      setArticle(art);

      // Load category
      const catRes = await helpService.getCategoryById(art.categoryId);
      if (catRes.success && catRes.data) {
        setCategory(catRes.data);

        // Load related articles in this category
        const relatedRes = await helpService.listArticlesByCategory(art.categoryId, { limit: 4 });
        if (relatedRes.success) {
          const others = relatedRes.data.items.filter((item) => item.id !== art.id).slice(0, 3);
          setRelatedArticles(others);
        }
      }
    } catch {
      setError('An unexpected error occurred while loading article.');
    } finally {
      setIsLoading(false);
    }
  }, [articleSlug]);

  useEffect(() => {
    void loadArticleData();
  }, [loadArticleData]);

  const seoConfig = buildHelpArticleSEO(article);

  if (isNotFound) {
    return (
      <main className="help-article-page" role="main">
        <SEO
          title="Help Article Not Found"
          description="The requested documentation guide could not be found."
          noIndex
        />
        <div className="help-not-found-card" data-testid="help-article-not-found">
          <div className="help-not-found-card__icon" aria-hidden="true">
            <FileQuestion size={40} />
          </div>
          <h1 className="help-not-found-card__title">Article Not Found</h1>
          <p className="help-not-found-card__desc">
            The help article you requested does not exist, is in draft mode, or has been relocated.
          </p>
          <Link to={ROUTES.HELP}>
            <Button variant="primary" size="md" leftIcon={<ArrowLeft size={16} />}>
              Back to Help Center
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate = article
    ? new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <main className="help-article-page" role="main">
      <SEO {...seoConfig} />
      {/* Breadcrumbs */}
      <nav className="help-breadcrumbs" aria-label="Breadcrumb">
        <ol className="help-breadcrumbs__list">
          <li className="help-breadcrumbs__item">
            <Link to={ROUTES.HOME} className="help-breadcrumbs__link">
              Home
            </Link>
          </li>
          <li className="help-breadcrumbs__separator" aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className="help-breadcrumbs__item">
            <Link to={ROUTES.HELP} className="help-breadcrumbs__link">
              Help Center
            </Link>
          </li>
          {category && (
            <>
              <li className="help-breadcrumbs__separator" aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li className="help-breadcrumbs__item">
                <Link to={`/help/${category.slug}`} className="help-breadcrumbs__link">
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <li className="help-breadcrumbs__separator" aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className="help-breadcrumbs__item help-breadcrumbs__item--active" aria-current="page">
            <span>{article ? article.title : 'Article'}</span>
          </li>
        </ol>
      </nav>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="help-article-loading" data-testid="help-article-skeleton">
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={24} width="40%" />
          <Skeleton variant="rounded" height={300} />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="help-error-container">
          <ErrorState
            title="Article Unavailable"
            description={error}
            action={
              <Button variant="secondary" size="md" onClick={() => void loadArticleData()}>
                Retry Loading
              </Button>
            }
          />
        </div>
      )}

      {!isLoading && !error && article && (
        <article className="help-article-container">
          {/* Article Header */}
          <header className="help-article-header">
            {category && (
              <div className="help-article-header__badge">
                <Link to={`/help/${category.slug}`}>
                  <Badge variant="accent" size="sm" icon={<BookOpen size={13} />}>
                    {category.name}
                  </Badge>
                </Link>
              </div>
            )}

            <h1 className="help-article-header__title">{article.title}</h1>

            {article.excerpt && <p className="help-article-header__excerpt">{article.excerpt}</p>}

            <div className="help-article-header__meta">
              <span className="help-article-meta-item">
                <Clock size={14} aria-hidden="true" />
                <span>Last updated on {formattedDate}</span>
              </span>
            </div>
          </header>

          {/* Article Markdown Body */}
          <div className="help-article-body">
            <BlogContentRenderer content={article.content} />
          </div>

          {/* Helpfulness / Feedback Section */}
          <ArticleHelpfulness article={article} />

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="help-related-section" aria-labelledby="related-heading">
              <h2 id="related-heading" className="help-related-section__title">
                Related Help Articles
              </h2>

              <div className="help-related-grid">
                {relatedArticles.map((rel) => (
                  <HelpArticleCard
                    key={rel.id}
                    article={rel}
                    categorySlug={category ? category.slug : 'general'}
                    categoryName={category ? category.name : undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Support CTA */}
          <section className="help-support-banner" aria-label="Contact Support">
            <div className="help-support-banner__content">
              <h3 className="help-support-banner__title">Still need assistance?</h3>
              <p className="help-support-banner__desc">
                We are happy to answer any questions about our tools, extensions, and web apps.
              </p>
            </div>

            <div className="help-support-banner__action">
              <Link to={ROUTES.SUPPORT}>
                <Button variant="primary" size="md" leftIcon={<MessageSquareHeart size={16} />}>
                  Contact Support
                </Button>
              </Link>
            </div>
          </section>
        </article>
      )}
    </main>
  );
};
