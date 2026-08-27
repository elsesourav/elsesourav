import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, RefreshCw, X } from 'lucide-react';
import { Input, Select, Badge, Button, EmptyState, ErrorState } from '@/components/ui';
import { AppCard, AppCardSkeleton } from '@/components/apps';
import { useApps } from '@/hooks/useApps';
import { classificationService } from '@/services/classification.service';
import type { Category } from '@/types/category.types';
import type { App } from '@/types/app.types';
import './AppsPage.css';

type SortOption = 'featured' | 'newest' | 'name' | 'rating';

export const AppsPage: React.FC = () => {
  const { apps, isLoading, error, refetch } = useApps();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // SEO setup
  useEffect(() => {
    document.title = 'Explore Applications | ElseSourav';
  }, []);

  // Fetch active categories
  useEffect(() => {
    let isMounted = true;
    void classificationService.listActiveCategories().then((res) => {
      if (isMounted && res.success) {
        setCategories([...res.data.items]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & sort apps
  const filteredApps = useMemo(() => {
    let result = [...apps];

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (app) => app.primaryCategory.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.shortDescription.toLowerCase().includes(q) ||
          app.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1;
          }
          return a.sortOrder - b.sortOrder;
        case 'newest':
          return (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating': {
          const ratingA = a.stats.ratingAverage ?? 5.0;
          const ratingB = b.stats.ratingAverage ?? 5.0;
          return ratingB - ratingA;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [apps, selectedCategory, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <main className="apps-page">
      <header className="apps-page__header">
        <div className="apps-page__title-row">
          <h1 className="apps-page__title">Explore Applications</h1>
          {!isLoading && !error && (
            <Badge variant="accent" size="md">
              {filteredApps.length} {filteredApps.length === 1 ? 'App' : 'Apps'}
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
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            options={[
              { value: 'featured', label: 'Featured First' },
              { value: 'newest', label: 'Newest Releases' },
              { value: 'name', label: 'Name (A to Z)' },
              { value: 'rating', label: 'Highest Rated' },
            ]}
            className="apps-page__sort-select"
            aria-label="Sort applications"
          />
        </div>

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
      </section>

      {/* Loading State */}
      {isLoading && (
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
      {!isLoading && !error && filteredApps.length === 0 && (
        <EmptyState
          icon={<Sparkles size={36} />}
          title="No Applications Found"
          description={
            searchQuery || selectedCategory !== 'all'
              ? `No apps match your search "${searchQuery}" or selected category.`
              : 'No applications have been published to the catalog yet.'
          }
          action={
            (searchQuery || selectedCategory !== 'all') && (
              <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            )
          }
        />
      )}

      {/* Application Grid */}
      {!isLoading && !error && filteredApps.length > 0 && (
        <div className="apps-page__grid" data-testid="apps-grid">
          {filteredApps.map((app: App) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </main>
  );
};
