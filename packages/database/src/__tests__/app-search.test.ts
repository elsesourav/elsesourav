import { describe, it, expect, vi } from 'vitest';
import { AppQueryService, AppRepository } from '../index';
import { AppError } from '@elsesourav/types';
import type { AppSearchResult, CategorySummary, TagSummary, AppListItem } from '@elsesourav/types';

describe('App Search & Discovery Domain Service', () => {
  const mockItems: AppListItem[] = [
    {
      id: 'app-1',
      slug: 'terminal-pro',
      name: 'Terminal Pro',
      shortDescription: 'Hardware accelerated terminal',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
      primaryCategory: 'Developer Tools',
      categorySlug: 'dev-tools',
      platforms: ['web', 'macos'],
      isFeatured: true,
      isPinned: false,
      currentVersion: '2.0.0',
      sortOrder: 1,
    },
    {
      id: 'app-2',
      slug: 'focus-timer',
      name: 'Focus Timer',
      shortDescription: 'Pomodoro timer app',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/timer.png',
      primaryCategory: 'Productivity',
      categorySlug: 'productivity',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      currentVersion: '1.0.0',
      sortOrder: 2,
    },
  ];

  const mockSearchResult: AppSearchResult = {
    items: mockItems,
    totalCount: 2,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasMore: false,
  };

  const mockCategories: CategorySummary[] = [
    { id: 'cat-1', name: 'Developer Tools', slug: 'dev-tools', orderIndex: 1, appCount: 5 },
    { id: 'cat-2', name: 'Productivity', slug: 'productivity', orderIndex: 2, appCount: 3 },
  ];

  const mockTags: TagSummary[] = [
    { id: 'tag-1', name: 'Terminal', slug: 'terminal', appCount: 2 },
    { id: 'tag-2', name: 'CLI', slug: 'cli', appCount: 4 },
  ];

  it('normalizes multi-space search queries and executes search', async () => {
    const mockRepo = {
      searchPublic: vi.fn().mockResolvedValue(mockSearchResult),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const result = await queryService.discoverApps({
      query: '   terminal    pro   ',
      sort: 'newest',
    });

    expect(result.totalCount).toBe(2);
    expect(mockRepo.searchPublic).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'terminal pro',
        sort: 'newest',
      })
    );
  });

  it('combines category, tag, sort, and pagination filters', async () => {
    const mockRepo = {
      searchPublic: vi.fn().mockResolvedValue(mockSearchResult),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    await queryService.discoverApps({
      query: 'code',
      filters: {
        categorySlug: 'dev-tools',
        tagSlug: 'cli',
      },
      sort: 'popularity',
      page: 2,
      limit: 10,
    });

    expect(mockRepo.searchPublic).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'code',
        filters: {
          categorySlug: 'dev-tools',
          tagSlug: 'cli',
        },
        sort: 'popularity',
        page: 2,
        limit: 10,
      })
    );
  });

  it('retrieves active public categories and tags with counts', async () => {
    const mockRepo = {
      listPublicCategories: vi.fn().mockResolvedValue(mockCategories),
      listPublicTags: vi.fn().mockResolvedValue(mockTags),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const categories = await queryService.listPublicCategories();
    const tags = await queryService.listPublicTags();

    expect(categories).toHaveLength(2);
    expect(categories[0]?.slug).toBe('dev-tools');
    expect(tags).toHaveLength(2);
    expect(tags[0]?.name).toBe('Terminal');
  });

  it('rejects invalid search inputs with control characters or excessive length', async () => {
    const mockRepo = {
      searchPublic: vi.fn(),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);

    await expect(
      queryService.discoverApps({
        query: 'x'.repeat(100),
      })
    ).rejects.toThrowError(AppError);
  });
});
