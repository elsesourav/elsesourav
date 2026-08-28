import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirestoreAppSearchProvider } from '../app-search.service';
import type { IAppRepository } from '@/repositories/interfaces';
import type { App } from '@/types/app.types';
import { ok } from '@/lib/result';

const mockPublishedApps: App[] = [
  {
    id: 'app-ide',
    slug: 'code-editor',
    name: 'CodeFlow Editor',
    shortDescription: 'In-browser IDE and code editor for developers.',
    description: 'Cloud based coding platform with modern compiler tools.',
    iconUrl: 'https://cdn.elsesourav.com/icon1.png',
    primaryCategory: 'developer-tools',
    tags: ['ide', 'editor', 'code'],
    status: 'published',
    platforms: ['web'],
    links: [],
    screenshots: [],
    stats: { views: 500, launches: 200, libraryAdds: 50, ratingAverage: 4.9 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700005000000,
    publishedAt: 1700001000000,
  },
  {
    id: 'app-calc',
    slug: 'quick-calc',
    name: 'Quick Calc Extension',
    shortDescription: 'Lightweight popup calculator for browser tabs.',
    description: 'Perform math equations instantly inside Chrome.',
    iconUrl: 'https://cdn.elsesourav.com/icon2.png',
    primaryCategory: 'utilities',
    tags: ['calculator', 'math', 'chrome-extension'],
    status: 'published',
    platforms: ['chrome'],
    links: [],
    screenshots: [],
    stats: { views: 200, launches: 80, libraryAdds: 15, ratingAverage: 4.5 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 2,
    createdAt: 1700002000000,
    updatedAt: 1700002000000,
    publishedAt: 1700002000000,
  },
  {
    id: 'app-focus',
    slug: 'zen-focus',
    name: 'Zen Focus Timer',
    shortDescription: 'Pomodoro timer and task manager.',
    description: 'Minimalist timer to boost productivity and focus.',
    iconUrl: 'https://cdn.elsesourav.com/icon3.png',
    primaryCategory: 'productivity',
    tags: ['timer', 'pomodoro', 'focus'],
    status: 'published',
    platforms: ['web', 'android'],
    links: [],
    screenshots: [],
    stats: { views: 300, launches: 150, libraryAdds: 40, ratingAverage: 4.8 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 3,
    createdAt: 1700003000000,
    updatedAt: 1700006000000,
    publishedAt: 1700003000000,
  },
];

describe('FirestoreAppSearchProvider (app-search.service.ts)', () => {
  let mockAppRepo: IAppRepository;
  let searchProvider: FirestoreAppSearchProvider;

  beforeEach(() => {
    mockAppRepo = {
      listPublished: vi.fn().mockResolvedValue(
        ok({
          items: mockPublishedApps,
          hasMore: false,
          total: mockPublishedApps.length,
        })
      ),
    } as unknown as IAppRepository;

    searchProvider = new FirestoreAppSearchProvider(mockAppRepo);
  });

  it('1. Searches apps by text token across name, description, and tags', async () => {
    const result = await searchProvider.searchApps({ query: 'calculator' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]?.id).toBe('app-calc');
    }
  });

  it('2. Filters apps by category', async () => {
    const result = await searchProvider.searchApps({ category: 'developer-tools' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]?.id).toBe('app-ide');
    }
  });

  it('3. Filters apps by multiple tags', async () => {
    const result = await searchProvider.searchApps({ tags: ['timer', 'focus'] });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]?.id).toBe('app-focus');
    }
  });

  it('4. Filters apps by featuredOnly', async () => {
    const result = await searchProvider.searchApps({ featuredOnly: true });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(2);
      expect(result.data.items.every((a) => a.isFeatured)).toBe(true);
    }
  });

  it('5. Sorts apps by newest', async () => {
    const result = await searchProvider.searchApps({ sortBy: 'newest' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0]?.id).toBe('app-focus');
    }
  });

  it('6. Sorts apps by rating descending', async () => {
    const result = await searchProvider.searchApps({ sortBy: 'rating' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0]?.id).toBe('app-ide'); // 4.9
      expect(result.data.items[1]?.id).toBe('app-focus'); // 4.8
      expect(result.data.items[2]?.id).toBe('app-calc'); // 4.5
    }
  });

  it('7. Enforces public security by only querying listPublished repository method', async () => {
    await searchProvider.searchApps({ query: 'anything' });
    expect(mockAppRepo.listPublished).toHaveBeenCalled();
  });

  it('8. Paginates results based on limit option', async () => {
    const result = await searchProvider.searchApps({ limit: 2 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(2);
      expect(result.data.hasMore).toBe(true);
      expect(result.data.totalMatches).toBe(3);
    }
  });
});
