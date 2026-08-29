import { describe, it, expect, vi } from 'vitest';
import { HelpService, HelpRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import type {
  HelpCategoryWithArticles,
  HelpSearchResult,
} from '@elsesourav/types';

describe('Help Center Listing, Category Discovery & Search UI Pipeline', () => {
  const mockCategoryWithArticles: HelpCategoryWithArticles = {
    id: 'cat-getting-started',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Onboarding guides and platform fundamentals',
    icon: 'compass',
    orderIndex: 1,
    articleCount: 2,
    createdAt: 1704067000000,
    updatedAt: 1704067000000,
    articles: [
      {
        id: 'art-1',
        slug: 'quickstart-guide',
        title: 'Quickstart Guide to ElseSourav',
        excerpt: 'Get up and running in under 5 minutes.',
        categoryId: 'cat-getting-started',
        categorySlug: 'getting-started',
        categoryName: 'Getting Started',
        orderIndex: 1,
        publishedAt: 1704067100000,
        updatedAt: 1704067100000,
      },
      {
        id: 'art-2',
        slug: 'account-security',
        title: 'Securing Your ElseSourav Account',
        excerpt: 'Enable multi-factor authentication and manage active sessions.',
        categoryId: 'cat-getting-started',
        categorySlug: 'getting-started',
        categoryName: 'Getting Started',
        orderIndex: 2,
        publishedAt: 1704067200000,
        updatedAt: 1704067200000,
      },
    ],
  };

  it('retrieves public categories with published article counts and previews', async () => {
    const mockRepo = {
      findPublicCategories: vi.fn().mockResolvedValue([mockCategoryWithArticles]),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const categories = await service.listPublicCategories();

    expect(categories).toHaveLength(1);
    expect(categories[0]?.slug).toBe('getting-started');
    expect(categories[0]?.articles).toHaveLength(2);
    expect(mockRepo.findPublicCategories).toHaveBeenCalled();
  });

  it('retrieves category by slug with published articles', async () => {
    const mockRepo = {
      findCategoryBySlug: vi.fn().mockResolvedValue(mockCategoryWithArticles),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const category = await service.getCategoryBySlug('getting-started');

    expect(category.name).toBe('Getting Started');
    expect(category.articles).toHaveLength(2);
    expect(mockRepo.findCategoryBySlug).toHaveBeenCalledWith('getting-started');
  });

  it('throws notFound for non-existent category slugs', async () => {
    const mockRepo = {
      findCategoryBySlug: vi.fn().mockResolvedValue(null),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    await expect(service.getCategoryBySlug('non-existent-cat')).rejects.toThrowError(AppError);
  });

  it('performs keyword search across published help articles', async () => {
    const mockSearchResult: HelpSearchResult = {
      items: [mockCategoryWithArticles.articles[0]!],
      totalCount: 1,
      query: 'quickstart',
    };

    const mockRepo = {
      searchPublicArticles: vi.fn().mockResolvedValue(mockSearchResult),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const result = await service.searchArticles({ query: 'quickstart' });

    expect(result.totalCount).toBe(1);
    expect(result.items[0]?.slug).toBe('quickstart-guide');
    expect(mockRepo.searchPublicArticles).toHaveBeenCalledWith({ query: 'quickstart' });
  });

  it('returns empty result safely for blank query strings without querying repository', async () => {
    const mockRepo = {
      searchPublicArticles: vi.fn(),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const result = await service.searchArticles({ query: '   ' });

    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(mockRepo.searchPublicArticles).not.toHaveBeenCalled();
  });
});
