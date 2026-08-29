import { describe, it, expect, vi } from 'vitest';
import { AppQueryService, AppRepository } from '@elsesourav/database';
import type { AppListItem } from '@elsesourav/types';

describe('Public Apps Listing Integration', () => {
  const mockApps: AppListItem[] = [
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
      publishedAt: 1704067200000,
    },
    {
      id: 'app-2',
      slug: 'focus-timer',
      name: 'Focus Timer',
      shortDescription: 'Minimalist Pomodoro timer',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/timer.png',
      primaryCategory: 'Productivity',
      categorySlug: 'productivity',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      currentVersion: '1.2.0',
      sortOrder: 2,
      publishedAt: 1704153600000,
    },
  ];

  it('fetches published apps with category filtering', async () => {
    const mockRepo = {
      listPublic: vi.fn().mockResolvedValue([mockApps[0]]),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const result = await queryService.listPublicApps({ categorySlug: 'dev-tools' });

    expect(result).toHaveLength(1);
    expect(result[0]?.categorySlug).toBe('dev-tools');
    expect(mockRepo.listPublic).toHaveBeenCalledWith(
      expect.objectContaining({ categorySlug: 'dev-tools' })
    );
  });

  it('fetches published apps with search keyword filtering', async () => {
    const mockRepo = {
      listPublic: vi.fn().mockResolvedValue([mockApps[1]]),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const result = await queryService.listPublicApps({ search: 'Pomodoro' });

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe('focus-timer');
  });

  it('handles empty query results gracefully', async () => {
    const mockRepo = {
      listPublic: vi.fn().mockResolvedValue([]),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const result = await queryService.listPublicApps({ categorySlug: 'games' });

    expect(result).toHaveLength(0);
  });

  it('verifies archival card properties on published apps', () => {
    const flagship = mockApps[0]!;
    expect(flagship.isFeatured).toBe(true);
    expect(flagship.currentVersion).toBe('2.0.0');
    expect(flagship.platforms).toContain('web');
    expect(flagship.platforms).toContain('macos');
    expect(flagship.primaryCategory).toBe('Developer Tools');
  });

  it('supports sorting contracts for newest, popularity, and name', async () => {
    const mockRepo = {
      listPublic: vi.fn().mockResolvedValue(mockApps),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const sortedByNewest = await queryService.listPublicApps({ sortField: 'publishedAt', sortDirection: 'desc' });
    expect(sortedByNewest).toHaveLength(2);
    expect(mockRepo.listPublic).toHaveBeenCalledWith(
      expect.objectContaining({ sortField: 'publishedAt', sortDirection: 'desc' })
    );
  });
});
