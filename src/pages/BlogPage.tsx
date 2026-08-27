import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, BookOpen, X } from 'lucide-react';
import { Badge, Button, Input, Skeleton, EmptyState, ErrorState } from '@/components';
import { BlogCard } from '@/components/blog';
import { blogService } from '@/services/blog.service';
import type { BlogPost, BlogCategory } from '@/types/blog.types';
import './BlogPage.css';

const PAGE_SIZE = 9;

export const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const activeTag = searchParams.get('tag') || '';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // SEO metadata management
  useEffect(() => {
    document.title = 'Engineering Journal & Devlogs — ElseSourav';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Engineering insights, architecture deep-dives, and devlogs on building zero-bloat software by Sourav.'
    );

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://elsesourav.com/blog');
  }, []);

  // Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      const result = await blogService.listActiveCategories();
      if (result.success) {
        setCategories([...result.data.items]);
      }
    };
    void loadCategories();
  }, []);

  // Fetch Featured Spotlight
  useEffect(() => {
    const loadFeatured = async () => {
      const result = await blogService.listFeaturedPosts(1);
      if (result.success && result.data.items.length > 0) {
        setFeaturedPost(result.data.items[0] || null);
      }
    };
    void loadFeatured();
  }, []);

  // Fetch Posts with Filter
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let result;
    if (activeTag) {
      result = await blogService.listPostsByTag(activeTag, { limit: PAGE_SIZE });
    } else if (activeCategory && activeCategory !== 'all') {
      result = await blogService.listPostsByCategory(activeCategory, { limit: PAGE_SIZE });
    } else {
      result = await blogService.listPublishedPosts({ limit: PAGE_SIZE });
    }

    if (result.success) {
      setPosts([...result.data.items]);
      setNextCursor(result.data.nextCursor);
      setHasMore(Boolean(result.data.hasMore));
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  }, [activeCategory, activeTag]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  // Load More Handler (Cursor-Based)
  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    let result;

    if (activeTag) {
      result = await blogService.listPostsByTag(activeTag, {
        limit: PAGE_SIZE,
        startAfterCursor: nextCursor,
      });
    } else if (activeCategory && activeCategory !== 'all') {
      result = await blogService.listPostsByCategory(activeCategory, {
        limit: PAGE_SIZE,
        startAfterCursor: nextCursor,
      });
    } else {
      result = await blogService.listPublishedPosts({
        limit: PAGE_SIZE,
        startAfterCursor: nextCursor,
      });
    }

    if (result.success) {
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = result.data.items.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newItems];
      });
      setNextCursor(result.data.nextCursor);
      setHasMore(Boolean(result.data.hasMore));
    }
    setIsLoadingMore(false);
  };

  // Category filter click
  const handleSelectCategory = (catSlug: string) => {
    const params = new URLSearchParams(searchParams);
    if (catSlug === 'all') {
      params.delete('category');
    } else {
      params.set('category', catSlug);
    }
    params.delete('tag');
    setSearchParams(params);
  };

  // Clear Tag filter
  const handleClearTag = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tag');
    setSearchParams(params);
  };

  // Real-time client search filter on active page items
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <main className="blog-page">
      {/* Editorial Header */}
      <header className="blog-page__header">
        <Badge variant="accent" size="sm">
          Journal & Devlogs
        </Badge>
        <h1 className="blog-page__title">Engineering Notes & Articles</h1>
        <p className="blog-page__subtitle">
          Essays on building zero-bloat software, modern web architectures, and system design
          principles.
        </p>
      </header>

      {/* Featured Spotlight (Only on All view with no search/tag) */}
      {!isLoading &&
        !error &&
        featuredPost &&
        activeCategory === 'all' &&
        !activeTag &&
        !searchQuery && (
          <section className="blog-page__featured" aria-label="Featured Article">
            <BlogCard post={featuredPost} featured />
          </section>
        )}

      {/* Filter and Search Bar */}
      <div className="blog-page__controls">
        <div
          className="blog-page__categories"
          role="tablist"
          aria-label="Filter Articles by Category"
        >
          <button
            role="tab"
            aria-selected={activeCategory === 'all' && !activeTag}
            className={`blog-category-pill ${
              activeCategory === 'all' && !activeTag ? 'blog-category-pill--active' : ''
            }`}
            onClick={() => handleSelectCategory('all')}
          >
            All Articles
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.slug}
              className={`blog-category-pill ${
                activeCategory === cat.slug ? 'blog-category-pill--active' : ''
              }`}
              onClick={() => handleSelectCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="blog-page__search">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
            inputSize="sm"
            aria-label="Search articles"
          />
        </div>
      </div>

      {/* Active Tag Filter Banner */}
      {activeTag && (
        <div className="blog-page__active-tag-banner">
          <span>
            Filtering by tag: <strong>#{activeTag}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={handleClearTag} leftIcon={<X size={14} />}>
            Clear Filter
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="blog-page__grid" data-testid="blog-loading-skeleton">
          <Skeleton variant="rounded" height={360} />
          <Skeleton variant="rounded" height={360} />
          <Skeleton variant="rounded" height={360} />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState
          title="Failed to Load Articles"
          description={error}
          action={
            <Button variant="secondary" size="sm" onClick={() => void fetchPosts()}>
              Retry
            </Button>
          }
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPosts.length === 0 && (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No Articles Found"
          description={
            searchQuery
              ? `No articles match "${searchQuery}".`
              : activeTag
                ? `No articles tagged with #${activeTag}.`
                : 'Articles will appear here once published.'
          }
          action={
            activeCategory !== 'all' || activeTag || searchQuery ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  handleSelectCategory('all');
                }}
              >
                View All Articles
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Article Grid */}
      {!isLoading && !error && filteredPosts.length > 0 && (
        <>
          <section className="blog-page__grid" aria-label="Articles Grid">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </section>

          {/* Cursor Pagination Action */}
          {hasMore && !searchQuery && (
            <div className="blog-page__pagination">
              <Button
                variant="secondary"
                size="md"
                onClick={() => void handleLoadMore()}
                isLoading={isLoadingMore}
              >
                Load More Articles
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
};
