import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Search, FileQuestion, BookOpen } from 'lucide-react';
import { Button, Badge, Skeleton, ErrorState, Input } from '@/components';
import { HelpArticleCard } from '@/components/help';
import { helpService } from '@/services/help.service';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import { ROUTES } from '@/constants/routes';
import './HelpCategoryPage.css';

export const HelpCategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [articles, setArticles] = useState<readonly HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load category and its articles
  const loadCategoryData = useCallback(async () => {
    if (!categorySlug) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const catRes = await helpService.getCategoryBySlug(categorySlug);
      if (!catRes.success) {
        setError('Failed to load category.');
        setIsLoading(false);
        return;
      }

      if (!catRes.data || !catRes.data.isActive) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      const cat = catRes.data;
      setCategory(cat);

      const articlesRes = await helpService.listArticlesByCategory(cat.id, { limit: 20 });
      if (articlesRes.success) {
        setArticles(articlesRes.data.items);
      } else {
        setArticles([]);
      }
    } catch {
      setError('An unexpected error occurred while loading category.');
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    void loadCategoryData();
  }, [loadCategoryData]);

  // Dynamic SEO
  useEffect(() => {
    if (category) {
      document.title = `${category.name} — Help Center — ElseSourav`;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && category.description) {
        metaDesc.setAttribute('content', category.description);
      }

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://elsesourav.com/help/${category.slug}`);
    }
  }, [category]);

  // Client-side quick filter
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase().trim();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        a.content.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  if (isNotFound) {
    return (
      <main className="help-category-page" role="main">
        <div className="help-not-found-card" data-testid="help-category-not-found">
          <div className="help-not-found-card__icon" aria-hidden="true">
            <FileQuestion size={40} />
          </div>
          <h1 className="help-not-found-card__title">Category Not Found</h1>
          <p className="help-not-found-card__desc">
            The help category you are looking for does not exist, has been renamed, or is currently
            inactive.
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

  return (
    <main className="help-category-page" role="main">
      {/* Breadcrumb Navigation */}
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
          <li className="help-breadcrumbs__separator" aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className="help-breadcrumbs__item help-breadcrumbs__item--active" aria-current="page">
            <span>{category ? category.name : 'Category'}</span>
          </li>
        </ol>
      </nav>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="help-category-loading" data-testid="help-category-skeleton">
          <Skeleton variant="rounded" height={100} />
          <div className="help-category-grid-skeleton">
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
            title="Category Unavailable"
            description={error}
            action={
              <Button variant="secondary" size="md" onClick={() => void loadCategoryData()}>
                Retry Loading
              </Button>
            }
          />
        </div>
      )}

      {!isLoading && !error && category && (
        <>
          {/* Category Header */}
          <header className="help-category-header">
            <div className="help-category-header__top">
              <Badge variant="accent" size="sm" icon={<BookOpen size={14} />}>
                Topic Guides
              </Badge>
              <span className="help-category-header__count">
                {articles.length} {articles.length === 1 ? 'article' : 'articles'}
              </span>
            </div>

            <h1 className="help-category-header__title">{category.name}</h1>

            {category.description && (
              <p className="help-category-header__desc">{category.description}</p>
            )}

            {/* Quick in-category search */}
            {articles.length > 0 && (
              <div className="help-category-search">
                <Input
                  type="search"
                  placeholder={`Search within ${category.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={16} />}
                  aria-label={`Search within ${category.name}`}
                />
              </div>
            )}
          </header>

          {/* Articles Grid / List */}
          <section className="help-category-articles" aria-label={`Articles in ${category.name}`}>
            {filteredArticles.length === 0 ? (
              <div className="help-category-empty" data-testid="help-category-empty">
                <p className="help-category-empty__title">
                  {searchQuery ? 'No matching articles' : 'No articles available yet'}
                </p>
                <p className="help-category-empty__desc">
                  {searchQuery
                    ? `No articles match "${searchQuery}". Try a different keyword or browse other categories.`
                    : 'Check back soon as new documentation is continuously added.'}
                </p>
                {searchQuery && (
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="help-category-grid">
                {filteredArticles.map((article) => (
                  <HelpArticleCard
                    key={article.id}
                    article={article}
                    categorySlug={category.slug}
                    categoryName={category.name}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Back Link */}
          <div className="help-category-footer">
            <Link to={ROUTES.HELP} style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
                All Help Topics
              </Button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
};
