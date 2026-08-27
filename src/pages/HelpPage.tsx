import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Sparkles, MessageSquareHeart } from 'lucide-react';
import { Button, Badge, Skeleton, ErrorState, SEO } from '@/components';
import { HelpCategoryCard, HelpArticleCard, HelpSearch } from '@/components/help';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import { ROUTES } from '@/constants/routes';
import './HelpPage.css';

export const HelpPage: React.FC = () => {
  const [categories, setCategories] = useState<readonly HelpCategory[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<readonly HelpArticle[]>([]);
  const [popularArticles, setPopularArticles] = useState<readonly HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHelpData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [categoriesRes, featuredRes, popularRes] = await Promise.all([
        helpService.listActiveCategories({ limit: 12 }),
        helpService.listFeaturedArticles(6),
        helpService.listPublishedArticles({ limit: 6 }),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data.items);
      }
      if (featuredRes.success) {
        setFeaturedArticles(featuredRes.data.items);
      }
      if (popularRes.success) {
        setPopularArticles(popularRes.data.items);
      }

      if (!categoriesRes.success && !popularRes.success) {
        setError('Failed to load help center topics. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred while loading help center.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadHelpData();
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Merge featured & published without duplicates for the popular section
  const displayedArticles = featuredArticles.length > 0 ? featuredArticles : popularArticles;

  return (
    <main className="help-home-page" role="main">
      <SEO
        title="Help Center & Knowledge Base"
        description="Find guides, FAQs, troubleshooting tips, and documentation for ElseSourav applications and utilities."
        canonicalPath="/help"
      />
      {/* Hero Section */}
      <section className="help-hero" aria-labelledby="help-hero-title">
        <div className="help-hero__badge-wrapper">
          <Badge variant="accent" size="sm" icon={<LifeBuoy size={14} />}>
            Help Center & Knowledge Base
          </Badge>
        </div>

        <h1 id="help-hero-title" className="help-hero__title">
          How can we help you?
        </h1>

        <p className="help-hero__subtitle">
          Guides, FAQs, troubleshooting advice, and documentation for ElseSourav tools.
        </p>

        <div className="help-hero__search">
          <HelpSearch categories={categories} />
        </div>
      </section>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="help-loading-state" data-testid="help-loading-skeleton">
          <div className="help-category-skeleton-grid">
            <Skeleton variant="rounded" height={110} />
            <Skeleton variant="rounded" height={110} />
            <Skeleton variant="rounded" height={110} />
            <Skeleton variant="rounded" height={110} />
          </div>
          <div className="help-articles-skeleton-grid">
            <Skeleton variant="rounded" height={140} />
            <Skeleton variant="rounded" height={140} />
            <Skeleton variant="rounded" height={140} />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="help-error-container">
          <ErrorState
            title="Help Center Unavailable"
            description={error}
            action={
              <Button variant="secondary" size="md" onClick={() => void loadHelpData()}>
                Retry Loading
              </Button>
            }
          />
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Categories Grid */}
          <section className="help-section" aria-labelledby="help-categories-heading">
            <div className="help-section__header">
              <h2 id="help-categories-heading" className="help-section__title">
                Browse by Topic
              </h2>
              <p className="help-section__subtitle">
                Explore documentation organized by product and topic.
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="help-empty-categories">
                <p>No help categories available at this moment.</p>
              </div>
            ) : (
              <div className="help-categories-grid">
                {categories.map((cat) => (
                  <HelpCategoryCard key={cat.id} category={cat} />
                ))}
              </div>
            )}
          </section>

          {/* Featured & Popular Articles */}
          {displayedArticles.length > 0 && (
            <section className="help-section" aria-labelledby="help-articles-heading">
              <div className="help-section__header">
                <div className="help-section__title-group">
                  <Badge variant="mono" size="sm" icon={<Sparkles size={12} />}>
                    Popular Articles
                  </Badge>
                  <h2 id="help-articles-heading" className="help-section__title">
                    Frequently Asked & Featured Guides
                  </h2>
                </div>
              </div>

              <div className="help-articles-grid">
                {displayedArticles.map((article) => {
                  const cat = categoryMap.get(article.categoryId);
                  return (
                    <HelpArticleCard
                      key={article.id}
                      article={article}
                      categorySlug={cat ? cat.slug : 'general'}
                      categoryName={cat ? cat.name : undefined}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Support CTA Banner */}
          <section className="help-support-banner" aria-label="Contact Support">
            <div className="help-support-banner__content">
              <h3 className="help-support-banner__title">Still have questions?</h3>
              <p className="help-support-banner__desc">
                If you couldn&apos;t find an answer in our knowledge base, get in touch with Sourav
                directly.
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
        </>
      )}
    </main>
  );
};
