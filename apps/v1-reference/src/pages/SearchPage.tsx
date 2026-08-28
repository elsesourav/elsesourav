import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Tag,
  Calendar,
} from 'lucide-react';
import { Badge, Button, Skeleton, SEO } from '@/components';
import { AppIcon } from '@/components/apps';
import { GlobalSearchInput } from '@/components/search/GlobalSearchInput';
import { globalSearchService } from '@/services/global-search.service';
import type { GlobalSearchResult } from '@/types/search.types';
import { formatDate } from '@/utils/format';
import './SearchPage.css';

type SearchTab = 'all' | 'apps' | 'blog' | 'help';

const SUGGESTED_TAGS = [
  'Developer Tools',
  'Chrome Extension',
  'Web Apps',
  'Architecture',
  'Authentication',
  'Troubleshooting',
  'Release Notes',
  'Productivity',
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || searchParams.get('tab') || 'all';

  const [activeTab, setActiveTab] = useState<SearchTab>(
    ['all', 'apps', 'blog', 'help'].includes(typeParam) ? (typeParam as SearchTab) : 'all'
  );
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync tab with URL
  const handleTabChange = (newTab: SearchTab) => {
    setActiveTab(newTab);
    const newParams = new URLSearchParams(searchParams);
    if (newTab === 'all') {
      newParams.delete('type');
      newParams.delete('tab');
    } else {
      newParams.set('type', newTab);
      newParams.delete('tab');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Perform search
  const performSearch = useCallback(async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await globalSearchService.search({
      query: cleanQuery,
      limit: 30,
    });

    if (res.success) {
      setResults(res.data);
    } else {
      setError(res.error.message);
      setResults(null);
    }

    setIsLoading(false);
  }, []);

  // Trigger search on query param change
  useEffect(() => {
    if (queryParam.trim()) {
      void performSearch(queryParam);
    } else {
      setResults(null);
      setIsLoading(false);
    }
  }, [queryParam, performSearch]);

  const handleSearchSubmit = (newQuery: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newQuery.trim()) {
      newParams.set('q', newQuery.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleTagClick = (tag: string) => {
    handleSearchSubmit(tag);
  };

  // Category Counts
  const appsCount = results?.apps.length || 0;
  const blogCount = results?.blogPosts.length || 0;
  const helpCount = results?.helpArticles.length || 0;
  const totalCount = results?.totalCount || 0;

  return (
    <div className="search-page">
      <SEO
        title={queryParam.trim() ? `Search: "${queryParam}"` : 'Search Applications & Articles'}
        description="Search across all published applications, engineering devlogs, and documentation on ElseSourav."
        canonicalPath="/search"
        noIndex
      />
      {/* Search Header Banner */}
      <section className="search-header" aria-labelledby="search-header-title">
        <div className="search-header__content">
          <div className="search-header__badge">
            <Sparkles size={14} aria-hidden="true" />
            <span>Unified Platform Discovery</span>
          </div>

          <h1 id="search-header-title" className="search-header__title">
            Search ElseSourav
          </h1>
          <p className="search-header__subtitle">
            Find developer tools, web applications, technical engineering blogs, and documentation
            guides.
          </p>

          <div className="search-header__input-container">
            <GlobalSearchInput
              initialValue={queryParam}
              onSearch={handleSearchSubmit}
              placeholder="Search by keyword, tool name, topic, or technology..."
              autoFocus
              className="search-header__input"
            />
          </div>

          {/* Quick Suggestions / Popular Tags */}
          <div className="search-header__tags" aria-label="Suggested search tags">
            <span className="search-header__tags-label">Try searching:</span>
            <div className="search-header__tags-list">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="search-tag-chip"
                >
                  <Tag size={12} aria-hidden="true" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Container */}
      <main className="search-main" role="main">
        {/* Results Navigation Tabs (Only shown when query exists) */}
        {queryParam.trim() && (
          <nav className="search-tabs" aria-label="Search Result Categories">
            <button
              type="button"
              className={`search-tab ${activeTab === 'all' ? 'search-tab--active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              <span>All Results</span>
              <span className="search-tab__count">{totalCount}</span>
            </button>

            <button
              type="button"
              className={`search-tab ${activeTab === 'apps' ? 'search-tab--active' : ''}`}
              onClick={() => handleTabChange('apps')}
            >
              <Package size={15} aria-hidden="true" />
              <span>Applications</span>
              <span className="search-tab__count">{appsCount}</span>
            </button>

            <button
              type="button"
              className={`search-tab ${activeTab === 'blog' ? 'search-tab--active' : ''}`}
              onClick={() => handleTabChange('blog')}
            >
              <BookOpen size={15} aria-hidden="true" />
              <span>Articles</span>
              <span className="search-tab__count">{blogCount}</span>
            </button>

            <button
              type="button"
              className={`search-tab ${activeTab === 'help' ? 'search-tab--active' : ''}`}
              onClick={() => handleTabChange('help')}
            >
              <HelpCircle size={15} aria-hidden="true" />
              <span>Help & Guides</span>
              <span className="search-tab__count">{helpCount}</span>
            </button>
          </nav>
        )}

        {/* Loading State */}
        {isLoading && (
          <div
            className="search-loading-state"
            aria-busy="true"
            aria-label="Loading search results"
          >
            <div className="search-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="search-skeleton-card">
                  <Skeleton variant="rectangular" width="48px" height="48px" className="mb-3" />
                  <Skeleton variant="text" width="60%" height="24px" className="mb-2" />
                  <Skeleton variant="text" width="90%" height="16px" className="mb-2" />
                  <Skeleton variant="text" width="40%" height="14px" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="search-error-state" role="alert">
            <p>{error}</p>
            <Button variant="secondary" size="sm" onClick={() => void performSearch(queryParam)}>
              Retry Search
            </Button>
          </div>
        )}

        {/* Empty State: No Query */}
        {!queryParam.trim() && !isLoading && (
          <section className="search-empty-prompt" aria-label="Search prompt">
            <div className="search-empty-prompt__icon">
              <Search size={48} aria-hidden="true" />
            </div>
            <h2 className="search-empty-prompt__title">Discover the Entire Ecosystem</h2>
            <p className="search-empty-prompt__desc">
              Type a search query above or pick one of the recommended topics to find software,
              tutorials, and support articles.
            </p>
          </section>
        )}

        {/* Empty State: No Results Found */}
        {queryParam.trim() && !isLoading && totalCount === 0 && (
          <section className="search-no-results" aria-label="No results found">
            <div className="search-no-results__icon">
              <Search size={44} aria-hidden="true" />
            </div>
            <h2 className="search-no-results__title">
              No results found for &ldquo;{queryParam}&rdquo;
            </h2>
            <p className="search-no-results__desc">
              We couldn&apos;t find any published software, blog posts, or help articles matching
              your terms. Try using broader keywords or explore categories.
            </p>
            <div className="search-no-results__actions">
              <Button variant="secondary" size="sm" onClick={() => handleSearchSubmit('')}>
                Clear Search Query
              </Button>
              <Link to="/apps" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm">
                  Browse All Apps
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Results List */}
        {queryParam.trim() && !isLoading && totalCount > 0 && (
          <div className="search-results-content" aria-live="polite">
            {/* Priority 1: Applications */}
            {(activeTab === 'all' || activeTab === 'apps') && appsCount > 0 && (
              <section className="search-section" aria-labelledby="section-apps-title">
                <div className="search-section__header">
                  <div className="search-section__title-group">
                    <Package
                      size={20}
                      className="search-section__icon search-section__icon--app"
                      aria-hidden="true"
                    />
                    <h2 id="section-apps-title" className="search-section__title">
                      Applications ({appsCount})
                    </h2>
                  </div>
                  {activeTab === 'all' && appsCount > 3 && (
                    <button
                      type="button"
                      className="search-section__view-all"
                      onClick={() => handleTabChange('apps')}
                    >
                      <span>View all {appsCount} apps</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="search-apps-grid">
                  {results?.apps.map((app) => (
                    <Link
                      key={app.id}
                      to={app.destination}
                      className="search-app-card"
                      aria-label={`View application ${app.title}`}
                    >
                      <div className="search-app-card__header">
                        <AppIcon
                          iconUrl={app.iconUrl}
                          name={app.title}
                          size="md"
                          className="search-app-card__app-icon"
                        />
                        <div className="search-app-card__title-meta">
                          <h3 className="search-app-card__title">{app.title}</h3>
                          {app.category && (
                            <span className="search-app-card__category">
                              {app.category.replace(/-/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="search-app-card__desc">{app.description}</p>

                      <div className="search-app-card__footer">
                        <div className="search-app-card__badges">
                          {app.badges?.slice(0, 2).map((b) => (
                            <Badge key={b} variant="default" size="sm">
                              {b}
                            </Badge>
                          ))}
                        </div>
                        <span className="search-app-card__cta">
                          Open <ArrowRight size={13} aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Priority 2: Blog & Engineering Articles */}
            {(activeTab === 'all' || activeTab === 'blog') && blogCount > 0 && (
              <section className="search-section" aria-labelledby="section-blog-title">
                <div className="search-section__header">
                  <div className="search-section__title-group">
                    <BookOpen
                      size={20}
                      className="search-section__icon search-section__icon--blog"
                      aria-hidden="true"
                    />
                    <h2 id="section-blog-title" className="search-section__title">
                      Engineering Articles ({blogCount})
                    </h2>
                  </div>
                  {activeTab === 'all' && blogCount > 3 && (
                    <button
                      type="button"
                      className="search-section__view-all"
                      onClick={() => handleTabChange('blog')}
                    >
                      <span>View all {blogCount} articles</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="search-articles-list">
                  {results?.blogPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={post.destination}
                      className="search-article-item"
                      aria-label={`Read article ${post.title}`}
                    >
                      <div className="search-article-item__body">
                        <div className="search-article-item__meta">
                          {post.category && (
                            <Badge variant="accent" size="sm">
                              {post.category}
                            </Badge>
                          )}
                          {post.publishedAt && (
                            <span className="search-article-item__date">
                              <Calendar size={12} aria-hidden="true" />
                              {formatDate(post.publishedAt)}
                            </span>
                          )}
                        </div>
                        <h3 className="search-article-item__title">{post.title}</h3>
                        <p className="search-article-item__excerpt">{post.description}</p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="search-article-item__arrow"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Priority 3: Help Documentation */}
            {(activeTab === 'all' || activeTab === 'help') && helpCount > 0 && (
              <section className="search-section" aria-labelledby="section-help-title">
                <div className="search-section__header">
                  <div className="search-section__title-group">
                    <HelpCircle
                      size={20}
                      className="search-section__icon search-section__icon--help"
                      aria-hidden="true"
                    />
                    <h2 id="section-help-title" className="search-section__title">
                      Help & Documentation ({helpCount})
                    </h2>
                  </div>
                  {activeTab === 'all' && helpCount > 3 && (
                    <button
                      type="button"
                      className="search-section__view-all"
                      onClick={() => handleTabChange('help')}
                    >
                      <span>View all {helpCount} guides</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="search-help-list">
                  {results?.helpArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={article.destination}
                      className="search-help-item"
                      aria-label={`Read guide ${article.title}`}
                    >
                      <div className="search-help-item__icon">
                        <HelpCircle size={18} aria-hidden="true" />
                      </div>
                      <div className="search-help-item__content">
                        <div className="search-help-item__category">
                          <span>Help Center</span>
                          {article.category && (
                            <>
                              <span>/</span>
                              <span>{article.category}</span>
                            </>
                          )}
                        </div>
                        <h3 className="search-help-item__title">{article.title}</h3>
                        <p className="search-help-item__desc">{article.description}</p>
                      </div>
                      <ArrowRight
                        size={15}
                        className="search-help-item__arrow"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Specific Category Tab Empty State */}
            {activeTab === 'apps' && appsCount === 0 && (
              <div className="search-tab-empty">
                <p>No applications matched &ldquo;{queryParam}&rdquo;.</p>
                <Button variant="secondary" size="sm" onClick={() => handleTabChange('all')}>
                  Show All Results
                </Button>
              </div>
            )}
            {activeTab === 'blog' && blogCount === 0 && (
              <div className="search-tab-empty">
                <p>No articles matched &ldquo;{queryParam}&rdquo;.</p>
                <Button variant="secondary" size="sm" onClick={() => handleTabChange('all')}>
                  Show All Results
                </Button>
              </div>
            )}
            {activeTab === 'help' && helpCount === 0 && (
              <div className="search-tab-empty">
                <p>No help guides matched &ldquo;{queryParam}&rdquo;.</p>
                <Button variant="secondary" size="sm" onClick={() => handleTabChange('all')}>
                  Show All Results
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
