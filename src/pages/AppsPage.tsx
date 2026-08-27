import React, { useState, useEffect } from 'react';
import { Search, Sparkles, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import { Input, Select, Badge, Button, EmptyState, ErrorState, Drawer } from '@/components/ui';
import { AppCard, AppCardSkeleton } from '@/components/apps';
import { useAppDiscovery } from '@/hooks/useAppDiscovery';
import { classificationService } from '@/services/classification.service';
import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { AppSearchSortOption } from '@/types/search.types';
import './AppsPage.css';

export const AppsPage: React.FC = () => {
  const {
    searchQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    activeFilterCount,
    apps,
    totalMatches,
    hasMore,
    isLoading,
    error,
    setSearchQuery,
    setSelectedCategory,
    toggleTag,
    setSortBy,
    clearAllFilters,
    loadMore,
    refetch,
  } = useAppDiscovery(12);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // SEO setup
  useEffect(() => {
    document.title = 'Explore Applications | ElseSourav';
  }, []);

  // Fetch active categories and tags
  useEffect(() => {
    let isMounted = true;
    void Promise.all([
      classificationService.listActiveCategories(),
      classificationService.listActiveTags(),
    ]).then(([catRes, tagRes]) => {
      if (isMounted) {
        if (catRes.success) setCategories([...catRes.data.items]);
        if (tagRes.success) setTags([...tagRes.data.items]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="apps-page">
      <header className="apps-page__header">
        <div className="apps-page__title-row">
          <h1 className="apps-page__title">Explore Applications</h1>
          {!isLoading && !error && (
            <Badge variant="accent" size="md">
              {totalMatches} {totalMatches === 1 ? 'App' : 'Apps'}
            </Badge>
          )}
        </div>
        <p className="apps-page__description">
          Browse the complete catalog of web applications, browser extensions, developer tools, and
          software created by ElseSourav.
        </p>
      </header>

      <section className="apps-page__controls" aria-label="Search and filter applications">
        <div className="apps-page__search-sort-row">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description, or tag..."
            leftIcon={<Search size={16} />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : undefined
            }
            className="apps-page__search-input"
            aria-label="Search applications"
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as AppSearchSortOption)}
            options={[
              { value: 'featured', label: 'Featured First' },
              { value: 'newest', label: 'Newest Releases' },
              { value: 'updated', label: 'Recently Updated' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'popularity', label: 'Most Popular' },
              { value: 'name', label: 'Name (A to Z)' },
            ]}
            className="apps-page__sort-select"
            aria-label="Sort applications"
          />

          <Button
            variant="secondary"
            className="apps-page__filter-toggle-btn"
            leftIcon={<SlidersHorizontal size={16} />}
            onClick={() => setIsDrawerOpen(true)}
            aria-label={`Open filters drawer (${activeFilterCount} active)`}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>

        {/* Desktop Category Filter Pills */}
        <nav className="apps-page__categories" aria-label="Filter by category">
          <button
            type="button"
            className={`apps-page__category-pill ${selectedCategory === 'all' ? 'apps-page__category-pill--active' : ''}`}
            onClick={() => setSelectedCategory('all')}
            aria-pressed={selectedCategory === 'all'}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`apps-page__category-pill ${selectedCategory === cat.slug ? 'apps-page__category-pill--active' : ''}`}
              onClick={() => setSelectedCategory(cat.slug)}
              aria-pressed={selectedCategory === cat.slug}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {/* Active Filters Row */}
        {activeFilterCount > 0 && (
          <div className="apps-page__active-filters-row" aria-label="Active filters">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Active filters:
            </span>

            {searchQuery && (
              <span className="apps-page__filter-chip">
                Search: "{searchQuery}"
                <button
                  type="button"
                  className="apps-page__filter-chip-remove"
                  onClick={() => setSearchQuery('')}
                  aria-label="Remove search query filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="apps-page__filter-chip">
                Category: {selectedCategory}
                <button
                  type="button"
                  className="apps-page__filter-chip-remove"
                  onClick={() => setSelectedCategory('all')}
                  aria-label="Remove category filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedTags.map((tag) => (
              <span key={tag} className="apps-page__filter-chip">
                #{tag}
                <button
                  type="button"
                  className="apps-page__filter-chip-remove"
                  onClick={() => toggleTag(tag)}
                  aria-label={`Remove tag #${tag} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', height: 'auto' }}
            >
              Clear All
            </Button>
          </div>
        )}
      </section>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Filter Applications"
        placement="right"
      >
        <div className="apps-page__drawer-content">
          <div>
            <h4 className="apps-page__drawer-section-title">Category</h4>
            <div className="apps-page__drawer-categories">
              <Button
                variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setIsDrawerOpen(false);
                }}
              >
                All Categories
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setIsDrawerOpen(false);
                  }}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <h4 className="apps-page__drawer-section-title">Popular Tags</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {tags.slice(0, 15).map((t) => {
                  const isSelected = selectedTags.includes(t.slug);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`apps-page__category-pill ${isSelected ? 'apps-page__category-pill--active' : ''}`}
                      onClick={() => toggleTag(t.slug)}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearAllFilters();
                setIsDrawerOpen(false);
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </Drawer>

      {/* Loading State */}
      {isLoading && apps.length === 0 && (
        <div className="apps-page__grid" data-testid="apps-loading-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <AppCardSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <ErrorState
          title="Unable to Load Applications"
          description="A network or database error occurred while fetching the application catalog."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={15} />}
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          }
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && apps.length === 0 && (
        <EmptyState
          icon={<Sparkles size={36} />}
          title="No Applications Found"
          description={
            searchQuery
              ? `No applications match your search for "${searchQuery}".`
              : selectedCategory !== 'all' || selectedTags.length > 0
                ? 'No applications match the selected filters.'
                : 'No applications have been published to the catalog yet.'
          }
          action={
            activeFilterCount > 0 && (
              <Button variant="secondary" size="sm" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )
          }
        />
      )}

      {/* Application Grid */}
      {!error && apps.length > 0 && (
        <>
          <div className="apps-page__grid" data-testid="apps-grid">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>

          {/* Pagination / Load More */}
          {hasMore && (
            <div className="apps-page__pagination">
              <Button variant="secondary" size="md" onClick={loadMore}>
                Load More Applications
              </Button>
              <span className="apps-page__pagination-info">
                Showing {apps.length} of {totalMatches} applications
              </span>
            </div>
          )}
        </>
      )}
    </main>
  );
};
