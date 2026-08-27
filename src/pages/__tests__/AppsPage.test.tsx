import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppsPage } from '../AppsPage';
import * as useAppDiscoveryModule from '@/hooks/useAppDiscovery';
import { classificationService } from '@/services/classification.service';
import { ok } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { App } from '@/types/app.types';

const mockApps: App[] = [
  {
    id: 'app-1',
    slug: 'calc-pro',
    name: 'CalcPro Calculator',
    shortDescription: 'Advanced scientific calculation utility.',
    description: 'Full scientific calculator.',
    iconUrl: 'https://cdn.elsesourav.com/calc.png',
    primaryCategory: 'utilities',
    tags: ['math', 'calculator'],
    status: 'published',
    platforms: ['web'],
    links: [],
    screenshots: [],
    stats: { views: 50, launches: 20, libraryAdds: 5, ratingAverage: 4.8 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'app-2',
    slug: 'pixel-quest',
    name: 'Pixel Quest',
    shortDescription: 'Retro 2D puzzle arcade game.',
    description: 'Retro game.',
    iconUrl: 'https://cdn.elsesourav.com/pixel.png',
    primaryCategory: 'games',
    tags: ['game', 'arcade', 'retro'],
    status: 'published',
    platforms: ['web'],
    links: [],
    screenshots: [],
    stats: { views: 80, launches: 40, libraryAdds: 12, ratingAverage: 5.0 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 2,
    createdAt: 1700010000000,
    updatedAt: 1700010000000,
  },
];

describe('AppsPage Discovery Component', () => {
  const mockRefetch = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockSetSelectedCategory = vi.fn();
  const mockToggleTag = vi.fn();
  const mockSetSortBy = vi.fn();
  const mockSetFeaturedOnly = vi.fn();
  const mockClearAllFilters = vi.fn();
  const mockLoadMore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(classificationService, 'listActiveCategories').mockResolvedValue(
      ok({
        items: [
          {
            id: 'cat-1',
            slug: 'utilities',
            name: 'Utilities',
            description: 'Utility tools',
            orderIndex: 0,
            isActive: true,
            createdAt: 100,
            updatedAt: 100,
          },
          {
            id: 'cat-2',
            slug: 'games',
            name: 'Games',
            description: 'Web games',
            orderIndex: 1,
            isActive: true,
            createdAt: 100,
            updatedAt: 100,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(classificationService, 'listActiveTags').mockResolvedValue(
      ok({
        items: [
          {
            id: 'tag-1',
            slug: 'math',
            name: 'math',
            orderIndex: 0,
            isActive: true,
            createdAt: 100,
            updatedAt: 100,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(useAppDiscoveryModule, 'useAppDiscovery').mockReturnValue({
      searchQuery: '',
      debouncedQuery: '',
      selectedCategory: 'all',
      selectedTags: [],
      sortBy: 'featured',
      featuredOnly: false,
      activeFilterCount: 0,
      apps: mockApps,
      totalMatches: mockApps.length,
      hasMore: false,
      isLoading: false,
      isSearching: false,
      error: null,
      setSearchQuery: mockSetSearchQuery,
      setSelectedCategory: mockSetSelectedCategory,
      toggleTag: mockToggleTag,
      setSortBy: mockSetSortBy,
      setFeaturedOnly: mockSetFeaturedOnly,
      clearAllFilters: mockClearAllFilters,
      loadMore: mockLoadMore,
      refetch: mockRefetch,
    });
  });

  it('1. Renders page header, search input, sort selector, and category filters', async () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Explore Applications')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search by name, description, or tag...')
    ).toBeInTheDocument();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(await screen.findByText('Utilities')).toBeInTheDocument();
    expect(await screen.findByText('Games')).toBeInTheDocument();
  });

  it('2. Renders loading skeletons when isLoading is true and apps are empty', () => {
    vi.spyOn(useAppDiscoveryModule, 'useAppDiscovery').mockReturnValue({
      searchQuery: '',
      debouncedQuery: '',
      selectedCategory: 'all',
      selectedTags: [],
      sortBy: 'featured',
      featuredOnly: false,
      activeFilterCount: 0,
      apps: [],
      totalMatches: 0,
      hasMore: false,
      isLoading: true,
      isSearching: false,
      error: null,
      setSearchQuery: mockSetSearchQuery,
      setSelectedCategory: mockSetSelectedCategory,
      toggleTag: mockToggleTag,
      setSortBy: mockSetSortBy,
      setFeaturedOnly: mockSetFeaturedOnly,
      clearAllFilters: mockClearAllFilters,
      loadMore: mockLoadMore,
      refetch: mockRefetch,
    });

    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('apps-loading-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('app-card-skeleton')).toHaveLength(6);
  });

  it('3. Renders published apps in the grid', () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('CalcPro Calculator')).toBeInTheDocument();
    expect(screen.getByText('Pixel Quest')).toBeInTheDocument();
  });

  it('4. Updates search query when typing in search input', () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search by name, description, or tag...');
    fireEvent.change(searchInput, { target: { value: 'pixel' } });

    expect(mockSetSearchQuery).toHaveBeenCalledWith('pixel');
  });

  it('5. Filters apps when selecting a category pill', async () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    const gamesPill = await screen.findByRole('button', { name: 'Games' });
    fireEvent.click(gamesPill);

    expect(mockSetSelectedCategory).toHaveBeenCalledWith('games');
  });

  it('6. Renders EmptyState when search returns no matches and allows clearing filters', () => {
    vi.spyOn(useAppDiscoveryModule, 'useAppDiscovery').mockReturnValue({
      searchQuery: 'nonexistent-app',
      debouncedQuery: 'nonexistent-app',
      selectedCategory: 'all',
      selectedTags: [],
      sortBy: 'featured',
      featuredOnly: false,
      activeFilterCount: 1,
      apps: [],
      totalMatches: 0,
      hasMore: false,
      isLoading: false,
      isSearching: false,
      error: null,
      setSearchQuery: mockSetSearchQuery,
      setSelectedCategory: mockSetSelectedCategory,
      toggleTag: mockToggleTag,
      setSortBy: mockSetSortBy,
      setFeaturedOnly: mockSetFeaturedOnly,
      clearAllFilters: mockClearAllFilters,
      loadMore: mockLoadMore,
      refetch: mockRefetch,
    });

    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('No Applications Found')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: 'Clear All Filters' });
    fireEvent.click(clearBtn);

    expect(mockClearAllFilters).toHaveBeenCalled();
  });

  it('7. Renders ErrorState and allows retrying when an error occurs', () => {
    vi.spyOn(useAppDiscoveryModule, 'useAppDiscovery').mockReturnValue({
      searchQuery: '',
      debouncedQuery: '',
      selectedCategory: 'all',
      selectedTags: [],
      sortBy: 'featured',
      featuredOnly: false,
      activeFilterCount: 0,
      apps: [],
      totalMatches: 0,
      hasMore: false,
      isLoading: false,
      isSearching: false,
      error: AppError.internal('Database timeout'),
      setSearchQuery: mockSetSearchQuery,
      setSelectedCategory: mockSetSelectedCategory,
      toggleTag: mockToggleTag,
      setSortBy: mockSetSortBy,
      setFeaturedOnly: mockSetFeaturedOnly,
      clearAllFilters: mockClearAllFilters,
      loadMore: mockLoadMore,
      refetch: mockRefetch,
    });

    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Unable to Load Applications')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('8. Opens mobile filter drawer when clicking filter button', () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    const filterBtn = screen.getByLabelText(/open filters drawer/i);
    fireEvent.click(filterBtn);

    expect(screen.getByText('Filter Applications')).toBeInTheDocument();
  });
});
