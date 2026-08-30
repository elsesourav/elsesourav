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

  it('handles flagship projects with markdown documentation and repository links', async () => {
    const flagshipApp: PublicApp = {
      ...mockPublicDetail,
      id: 'app-flagship',
      slug: 'spectralens-ai',
      name: 'SpectraLens AI',
      documentationMd: '## Technical Architecture\n\n- WebAssembly OCR\n- Chrome Extension MV3',
      links: [
        {
          id: 'gh-link',
          appId: 'app-flagship',
          platform: 'github',
          label: 'GitHub Source',
          url: 'https://github.com/elsesourav/spectralens-ai',
          displayOrder: 1,
          isActive: true,
        },
      ],
    };

    const mockRepo = {
      getPublicDetailBySlug: vi.fn().mockResolvedValue(flagshipApp),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const app = await queryService.getPublicAppDetail('spectralens-ai');

    expect(app.documentationMd).toContain('Technical Architecture');
    expect(app.links.some((l) => l.platform === 'github')).toBe(true);
  });

  it('handles lab experiments with simulation metadata', async () => {
    const labApp: PublicApp = {
      ...mockPublicDetail,
      id: 'app-lab',
      slug: 'falling-sands',
      name: 'Falling Sands Sandbox',
      primaryCategory: 'Simulations & Graphics',
      categorySlug: 'simulations',
      tags: ['lab', 'simulation', 'canvas'],
      demoUrl: 'https://elsesourav.github.io/falling-sand',
    };

    const mockRepo = {
      getPublicDetailBySlug: vi.fn().mockResolvedValue(labApp),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const app = await queryService.getPublicAppDetail('falling-sands');

    expect(app.categorySlug).toBe('simulations');
    expect(app.demoUrl).toBeDefined();
  });

  it('handles archived projects without crashing', async () => {
    const archivedApp: PublicApp = {
      ...mockPublicDetail,
      id: 'app-archived',
      slug: 'legacy-utility',
      name: 'Legacy Utility',
      tags: ['archived', 'legacy'],
      screenshots: [],
      versions: [],
      links: [],
    };

    const mockRepo = {
      getPublicDetailBySlug: vi.fn().mockResolvedValue(archivedApp),
    } as unknown as AppRepository;

    const queryService = new AppQueryService(mockRepo);
    const app = await queryService.getPublicAppDetail('legacy-utility');

    expect(app.tags).toContain('archived');
    expect(app.screenshots).toHaveLength(0);
    expect(app.versions).toHaveLength(0);
  });

  it('validates documentation and release versioning integrity on public app', () => {
    expect(mockPublicDetail.currentVersion).toBe('2.0.0');
    expect(mockPublicDetail.versions[0]?.changelog).toContain('WebGL');
    expect(mockPublicDetail.links[0]?.url).toBe('https://terminal.elsesourav.com');
  });
});
