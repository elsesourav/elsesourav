import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appSearchService } from '@/services/app-search.service';
import type { AppSearchSortOption } from '@/types/search.types';
import type { App } from '@/types/app.types';
import type { AppError } from '@/lib/errors';
import { isErr } from '@/lib/result';

export interface UseAppDiscoveryReturn {
  searchQuery: string;
  debouncedQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  sortBy: AppSearchSortOption;
  featuredOnly: boolean;
  activeFilterCount: number;
  apps: App[];
  totalMatches: number;
  hasMore: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: AppError | null;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
  toggleTag: (tag: string) => void;
  setSortBy: (sort: AppSearchSortOption) => void;
  setFeaturedOnly: (featured: boolean) => void;
  clearAllFilters: () => void;
  loadMore: () => void;
  refetch: () => Promise<void>;
}

export function useAppDiscovery(initialLimit = 12): UseAppDiscoveryReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL state
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || 'all';
  const urlTags = searchParams.get('tags')
    ? searchParams.get('tags')!.split(',').filter(Boolean)
    : [];
  const urlSort = (searchParams.get('sort') as AppSearchSortOption) || 'featured';
  const urlFeatured = searchParams.get('featured') === 'true';

  const [searchQuery, setSearchQueryState] = useState<string>(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(urlQuery);
  const [selectedCategory, setSelectedCategoryState] = useState<string>(urlCategory);
  const [selectedTags, setSelectedTagsState] = useState<string[]>(urlTags);
  const [sortBy, setSortByState] = useState<AppSearchSortOption>(urlSort);
  const [featuredOnly, setFeaturedOnlyState] = useState<boolean>(urlFeatured);

  const [displayLimit, setDisplayLimit] = useState<number>(initialLimit);
  const [apps, setApps] = useState<App[]>([]);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state changes to URL query parameters
  const updateUrlParams = useCallback(
    (q: string, cat: string, tags: string[], sort: AppSearchSortOption, featured: boolean) => {
      const nextParams = new URLSearchParams();
      if (q.trim()) nextParams.set('q', q.trim());
      if (cat && cat !== 'all') nextParams.set('category', cat);
      if (tags.length > 0) nextParams.set('tags', tags.join(','));
      if (sort !== 'featured') nextParams.set('sort', sort);
      if (featured) nextParams.set('featured', 'true');

      setSearchParams(nextParams, { replace: true });
    },
    [setSearchParams]
  );

  const setSearchQuery = useCallback(
    (q: string) => {
      setSearchQueryState(q);
      setDisplayLimit(initialLimit);
      updateUrlParams(q, selectedCategory, selectedTags, sortBy, featuredOnly);
    },
    [selectedCategory, selectedTags, sortBy, featuredOnly, initialLimit, updateUrlParams]
  );

  const setSelectedCategory = useCallback(
    (cat: string) => {
      setSelectedCategoryState(cat);
      setDisplayLimit(initialLimit);
      updateUrlParams(searchQuery, cat, selectedTags, sortBy, featuredOnly);
    },
    [searchQuery, selectedTags, sortBy, featuredOnly, initialLimit, updateUrlParams]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      const nextTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];

      setSelectedTagsState(nextTags);
      setDisplayLimit(initialLimit);
      updateUrlParams(searchQuery, selectedCategory, nextTags, sortBy, featuredOnly);
    },
    [
      selectedTags,
      searchQuery,
      selectedCategory,
      sortBy,
      featuredOnly,
      initialLimit,
      updateUrlParams,
    ]
  );

  const setSortBy = useCallback(
    (sort: AppSearchSortOption) => {
      setSortByState(sort);
      updateUrlParams(searchQuery, selectedCategory, selectedTags, sort, featuredOnly);
    },
    [searchQuery, selectedCategory, selectedTags, featuredOnly, updateUrlParams]
  );

  const setFeaturedOnly = useCallback(
    (featured: boolean) => {
      setFeaturedOnlyState(featured);
      setDisplayLimit(initialLimit);
      updateUrlParams(searchQuery, selectedCategory, selectedTags, sortBy, featured);
    },
    [searchQuery, selectedCategory, selectedTags, sortBy, initialLimit, updateUrlParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchQueryState('');
    setDebouncedQuery('');
    setSelectedCategoryState('all');
    setSelectedTagsState([]);
    setSortByState('featured');
    setFeaturedOnlyState(false);
    setDisplayLimit(initialLimit);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [initialLimit, setSearchParams]);

  const loadMore = useCallback(() => {
    setDisplayLimit((prev) => prev + initialLimit);
  }, [initialLimit]);

  // Execute search query
  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await appSearchService.searchApps({
        query: debouncedQuery,
        category: selectedCategory,
        tags: selectedTags,
        sortBy,
        featuredOnly,
        limit: displayLimit,
      });

      if (isErr(result)) {
        setError(result.error);
      } else {
        setApps([...result.data.items]);
        setTotalMatches(result.data.totalMatches);
        setHasMore(result.data.hasMore);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedCategory, selectedTags, sortBy, featuredOnly, displayLimit]);

  useEffect(() => {
    void executeSearch();
  }, [executeSearch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'all') count++;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (featuredOnly) count++;
    return count;
  }, [searchQuery, selectedCategory, selectedTags, featuredOnly]);

  return {
    searchQuery,
    debouncedQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    featuredOnly,
    activeFilterCount,
    apps,
    totalMatches,
    hasMore,
    isLoading,
    isSearching,
    error,
    setSearchQuery,
    setSelectedCategory,
    toggleTag,
    setSortBy,
    setFeaturedOnly,
    clearAllFilters,
    loadMore,
    refetch: executeSearch,
  };
}
