import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppsPage } from '../AppsPage';
import * as useAppsModule from '@/hooks/useApps';
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

describe('AppsPage Component', () => {
  const mockRefetch = vi.fn();

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

    vi.spyOn(useAppsModule, 'useApps').mockReturnValue({
      apps: mockApps,
      hasMore: false,
      nextCursor: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('renders page header, search input, sort selector, and category filters', async () => {
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

  it('renders loading skeletons when isLoading is true', () => {
    vi.spyOn(useAppsModule, 'useApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: true,
      error: null,
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

  it('renders published apps in the grid', () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('CalcPro Calculator')).toBeInTheDocument();
    expect(screen.getByText('Pixel Quest')).toBeInTheDocument();
  });

  it('filters apps when typing in search input', () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search by name, description, or tag...');
    fireEvent.change(searchInput, { target: { value: 'pixel' } });

    expect(screen.getByText('Pixel Quest')).toBeInTheDocument();
    expect(screen.queryByText('CalcPro Calculator')).not.toBeInTheDocument();
  });

  it('filters apps when selecting a category pill', async () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    const gamesPill = await screen.findByRole('button', { name: 'Games' });
    fireEvent.click(gamesPill);

    expect(screen.getByText('Pixel Quest')).toBeInTheDocument();
    expect(screen.queryByText('CalcPro Calculator')).not.toBeInTheDocument();
  });

  it('renders EmptyState when search returns no matches and allows clearing filters', () => {
    render(
      <BrowserRouter>
        <AppsPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search by name, description, or tag...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent-app' } });

    expect(screen.getByText('No Applications Found')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: 'Clear All Filters' });
    fireEvent.click(clearBtn);

    expect(screen.getByText('CalcPro Calculator')).toBeInTheDocument();
    expect(screen.getByText('Pixel Quest')).toBeInTheDocument();
  });

  it('renders ErrorState and allows retrying when an error occurs', () => {
    vi.spyOn(useAppsModule, 'useApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: false,
      error: AppError.internal('Database timeout'),
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
});
