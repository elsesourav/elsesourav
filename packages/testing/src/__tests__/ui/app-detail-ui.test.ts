import { describe, it, expect, vi } from 'vitest';
import { AppQueryService, AppRepository } from '@elsesourav/database';
import type { PublicApp, AppListItem } from '@elsesourav/types';

describe('Public App Details Integration & Related Apps', () => {
  const mockPublicDetail: PublicApp = {
    id: 'app-1',
    slug: 'terminal-pro',
    name: 'Terminal Pro',
    shortDescription: 'Hardware accelerated terminal',
    description: 'A full featured terminal emulator.',
    iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
    screenshots: ['https://res.cloudinary.com/elsesourav/image/upload/v2/shots/term1.png'],
    primaryCategory: 'Developer Tools',
    categorySlug: 'dev-tools',
    tags: ['cli', 'terminal'],
    platforms: ['web', 'macos'],
    links: [
      {
        id: 'link-1',
        appId: 'app-1',
        platform: 'web',
        label: 'Open Web App',
        url: 'https://terminal.elsesourav.com',
        displayOrder: 1,
        isActive: true,
      },
    ],
    versions: [
      {
        id: 'v-1',
        appId: 'app-1',
        version: '2.0.0',
        releaseDate: 1704067200000,
        changelog: 'Initial v2 release with WebGL canvas rendering',
      },
    ],
    currentVersion: '2.0.0',
    isFeatured: true,
    isPinned: false,
    stats: { views: 1000, launches: 400, libraryAdds: 120 },
    updatedAt: 1704067200000,
  };

  const mockRelatedApps: AppListItem[] = [
    {
      id: 'app-1',
      slug: 'terminal-pro',
      name: 'Terminal Pro',
      shortDescription: 'Hardware accelerated terminal',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
      primaryCategory: 'Developer Tools',
      categorySlug: 'dev-tools',
      platforms: ['web'],
      isFeatured: true,
      isPinned: false,
      sortOrder: 1,
    },
    {
      id: 'app-2',
      slug: 'regex-engine',
      name: 'Regex Engine',
      shortDescription: 'Visual regular expression tester',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/regex.png',
      primaryCategory: 'Developer Tools',
      categorySlug: 'dev-tools',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      sortOrder: 2,
    },
  ];

  it('fetches full public app detail with versions and screenshots', async () => {
    const mockRepo = {
      getPublicDetailBySlug: vi.fn().mockResolvedValue(mockPublicDetail),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const app = await queryService.getPublicAppDetail('terminal-pro');

    expect(app.id).toBe('app-1');
    expect(app.screenshots).toHaveLength(1);
    expect(app.versions).toHaveLength(1);
    expect(app.links).toHaveLength(1);
  });

  it('filters out current app from related category results', async () => {
    const mockRepo = {
      listPublic: vi.fn().mockResolvedValue(mockRelatedApps),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const related = await queryService.listPublicApps({ categorySlug: 'dev-tools', limit: 4 });

    const filtered = related
      .filter((item: { id: string; slug: string }) => item.id !== 'app-1')
      .slice(0, 3);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe('regex-engine');
  });
});
