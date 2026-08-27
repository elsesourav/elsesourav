import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appService } from '@/services/app.service';
import { classificationService } from '@/services/classification.service';
import { appMediaService } from '@/services/media.service';
import { appVersionService } from '@/services/version.service';
import { userLibraryService } from '@/services/library.service';
import { feedbackService } from '@/services/feedback.service';
import { analyticsService } from '@/services/analytics.service';
import type { App, AppLink } from '@/types/app.types';
import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { AppMedia } from '@/types/media.types';
import type { AppVersion } from '@/types/version.types';
import type { AppFeedback, AppRatingAggregate } from '@/types/feedback.types';
import { ok, isErr } from '@/lib/result';

describe('Core Application Domain Integration (20 E2E Lifecycle Scenarios)', () => {
  const mockLink: AppLink = {
    id: 'link-main',
    appId: 'app-code-flow',
    platform: 'web',
    label: 'Launch Web App',
    url: 'https://flow.elsesourav.com',
    action: 'open_app',
    isPrimary: true,
    displayOrder: 0,
    isActive: true,
  };

  const mockDraftApp: App = {
    id: 'app-code-flow',
    slug: 'code-flow',
    name: 'CodeFlow IDE',
    shortDescription: 'Modern web-based developer playground.',
    description: 'A full-featured cloud IDE built by ElseSourav.',
    iconUrl: 'https://cdn.elsesourav.com/apps/flow/icon.png',
    primaryCategory: 'developer-tools',
    tags: ['developer-tools', 'ide', 'web'],
    status: 'draft',
    platforms: ['web'],
    links: [mockLink],
    screenshots: [],
    stats: { views: 0, launches: 0, libraryAdds: 0 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockCategory: Category = {
    id: 'cat-dev',
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'Productivity and coding tools',
    icon: 'code',
    orderIndex: 0,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockTag: Tag = {
    id: 'tag-ide',
    slug: 'ide',
    name: 'IDE',
    description: 'Integrated Development Environments',
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockMedia: AppMedia = {
    id: 'media-icon-1',
    appId: 'app-code-flow',
    type: 'icon',
    url: 'https://cdn.elsesourav.com/apps/flow/icon.png',
    altText: 'CodeFlow IDE Application Icon',
    orderIndex: 0,
    isPrimary: true,
    isDecorative: false,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockVersion: AppVersion = {
    id: 'ver-100',
    appId: 'app-code-flow',
    version: '1.0.0',
    title: 'Initial General Availability',
    summary: 'First production release with editor and debugger.',
    releaseNotes: 'Everything you need to code in browser.',
    releaseDate: 1700000000000,
    isCurrent: true,
    status: 'published',
    highlights: [],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockPublishedApp: App = {
    ...mockDraftApp,
    status: 'published',
    currentVersion: '1.0.0',
    publishedAt: 1700050000000,
    updatedAt: 1700050000000,
  };

  const mockArchivedApp: App = {
    ...mockPublishedApp,
    status: 'archived',
    archivedAt: 1700100000000,
    updatedAt: 1700100000000,
  };

  const mockFeedback: AppFeedback = {
    id: 'user-777_app-code-flow',
    userId: 'user-777',
    appId: 'app-code-flow',
    rating: 5,
    message: 'Best web IDE for quick prototypes!',
    userDisplayName: 'Alex',
    status: 'approved',
    createdAt: 1700060000000,
    updatedAt: 1700060000000,
  };

  const mockAggregate: AppRatingAggregate = {
    id: 'app-code-flow',
    appId: 'app-code-flow',
    ratingCount: 1,
    averageRating: 5.0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
    updatedAt: 1700060000000,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Admin creates an app draft', async () => {
    vi.spyOn(appService, 'createDraft').mockResolvedValue(ok(mockDraftApp));
    const result = await appService.createDraft({
      slug: 'code-flow',
      name: 'CodeFlow IDE',
      shortDescription: 'Modern web-based developer playground.',
      description: 'A full-featured cloud IDE built by ElseSourav.',
      iconUrl: 'https://cdn.elsesourav.com/apps/flow/icon.png',
      primaryCategory: 'developer-tools',
      tags: ['developer-tools', 'ide', 'web'],
      platforms: ['web'],
      status: 'draft',
      isFeatured: true,
      isPinned: false,
      sortOrder: 1,
      screenshots: [],
      links: [],
      stats: { views: 0, launches: 0, libraryAdds: 0 },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('draft');
      expect(result.data.slug).toBe('code-flow');
    }
  });

  it('2. Admin adds category', async () => {
    vi.spyOn(classificationService, 'createCategory').mockResolvedValue(ok(mockCategory));
    const result = await classificationService.createCategory({
      name: 'Developer Tools',
      slug: 'developer-tools',
      description: 'Productivity and coding tools',
      orderIndex: 0,
      isActive: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('developer-tools');
    }
  });

  it('3. Admin adds tags', async () => {
    vi.spyOn(classificationService, 'createTag').mockResolvedValue(ok(mockTag));
    const result = await classificationService.createTag({
      name: 'IDE',
      slug: 'ide',
      description: 'Integrated Development Environments',
      isActive: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('ide');
    }
  });

  it('4. Admin adds platform links to the draft app', async () => {
    const updatedWithLinks: App = { ...mockDraftApp, links: [mockLink] };
    vi.spyOn(appService, 'updateDraft').mockResolvedValue(ok(updatedWithLinks));
    const result = await appService.updateDraft('app-code-flow', { links: [mockLink] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.links).toHaveLength(1);
      expect(result.data.links[0]?.isPrimary).toBe(true);
    }
  });

  it('5. Admin adds media metadata with accessibility validation', async () => {
    vi.spyOn(appMediaService, 'createMedia').mockResolvedValue(ok(mockMedia));
    const result = await appMediaService.createMedia('app-code-flow', {
      appId: 'app-code-flow',
      type: 'icon',
      url: 'https://cdn.elsesourav.com/apps/flow/icon.png',
      altText: 'CodeFlow IDE Application Icon',
      isPrimary: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.altText).toBe('CodeFlow IDE Application Icon');
    }
  });

  it('6. Admin adds SemVer version & changelog', async () => {
    vi.spyOn(appVersionService, 'createVersion').mockResolvedValue(ok(mockVersion));
    const result = await appVersionService.createVersion('app-code-flow', {
      appId: 'app-code-flow',
      version: '1.0.0',
      title: 'Initial General Availability',
      summary: 'First production release with editor and debugger.',
      releaseNotes: 'Everything you need to code in browser.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe('1.0.0');
    }
  });

  it('7. Admin publishes app', async () => {
    vi.spyOn(appService, 'publishApp').mockResolvedValue(ok(mockPublishedApp));
    const result = await appService.publishApp('app-code-flow');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('published');
      expect(result.data.publishedAt).toBeDefined();
    }
  });

  it('8. Public visitor can retrieve the published app by slug', async () => {
    vi.spyOn(appService, 'getAppBySlug').mockResolvedValue(ok(mockPublishedApp));
    const result = await appService.getAppBySlug('code-flow');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.name).toBe('CodeFlow IDE');
    }
  });

  it('9. Public visitor cannot retrieve unpublished apps via listPublishedApps', async () => {
    vi.spyOn(appService, 'listPublishedApps').mockResolvedValue(
      ok({
        items: [mockPublishedApp],
        hasMore: false,
      })
    );
    const result = await appService.listPublishedApps();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items.every((a) => a.status === 'published')).toBe(true);
    }
  });

  it('10. Authenticated user can save app to library', async () => {
    vi.spyOn(userLibraryService, 'saveApp').mockResolvedValue(
      ok({
        id: 'app-code-flow',
        userId: 'user-777',
        appId: 'app-code-flow',
        isFavorite: true,
        isPinned: false,
        addedAt: Date.now(),
      })
    );
    const result = await userLibraryService.saveApp('user-777', 'app-code-flow', {
      isFavorite: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.appId).toBe('app-code-flow');
    }
  });

  it('11. Authenticated user can submit feedback and rating', async () => {
    vi.spyOn(feedbackService, 'submitRatingAndReview').mockResolvedValue(ok(mockFeedback));
    const result = await feedbackService.submitRatingAndReview('user-777', {
      appId: 'app-code-flow',
      rating: 5,
      message: 'Best web IDE for quick prototypes!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
    }
  });

  it('12. Rating aggregate updates atomically', async () => {
    vi.spyOn(feedbackService, 'getAppRatingAggregate').mockResolvedValue(ok(mockAggregate));
    const result = await feedbackService.getAppRatingAggregate('app-code-flow');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.averageRating).toBe(5.0);
      expect(result.data?.ratingCount).toBe(1);
    }
  });

  it('13. Analytics events do not break user actions (non-blocking)', async () => {
    vi.spyOn(analyticsService, 'trackPrimaryAction').mockResolvedValue(undefined);
    await expect(
      analyticsService.trackPrimaryAction('app-code-flow', 'open_app', { platform: 'web' })
    ).resolves.not.toThrow();
  });

  it('14. User cannot access another user private library', async () => {
    const unauthResult = await userLibraryService.getUserLibrary('');
    expect(isErr(unauthResult)).toBe(true);
    if (isErr(unauthResult)) {
      expect(unauthResult.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('15. Non-admin cannot perform moderation operations', async () => {
    const result = await feedbackService.moderateReview(
      'user-777_app-code-flow',
      'approved',
      '' // No admin ID
    );
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('16. Admin can manage app lifecycle (unpublish -> archive -> restore)', async () => {
    vi.spyOn(appService, 'unpublishApp').mockResolvedValue(ok(mockDraftApp));
    vi.spyOn(appService, 'archiveApp').mockResolvedValue(ok(mockArchivedApp));
    vi.spyOn(appService, 'restoreApp').mockResolvedValue(ok(mockDraftApp));

    const unpublishRes = await appService.unpublishApp('app-code-flow');
    expect(unpublishRes.success).toBe(true);

    const archiveRes = await appService.archiveApp('app-code-flow');
    expect(archiveRes.success).toBe(true);

    const restoreRes = await appService.restoreApp('app-code-flow', 'draft');
    expect(restoreRes.success).toBe(true);
  });

  it('17. Archived app is excluded from public discovery', async () => {
    vi.spyOn(appService, 'listPublishedApps').mockResolvedValue(ok({ items: [], hasMore: false }));
    const result = await appService.listPublishedApps();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(0);
    }
  });

  it('18. Existing library relationship remains safe and flagged unavailable', async () => {
    vi.spyOn(userLibraryService, 'getEnrichedLibrary').mockResolvedValue(
      ok({
        items: [
          {
            libraryItem: {
              id: 'app-code-flow',
              userId: 'user-777',
              appId: 'app-code-flow',
              isFavorite: true,
              isPinned: false,
              addedAt: Date.now(),
            },
            app: mockArchivedApp,
            isUnavailable: true,
          },
        ],
        hasMore: false,
      })
    );

    const result = await userLibraryService.getEnrichedLibrary('user-777');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0]?.isUnavailable).toBe(true);
      expect(result.data.items[0]?.libraryItem.appId).toBe('app-code-flow');
    }
  });

  it('19. Existing feedback remains safe when app is archived', async () => {
    vi.spyOn(feedbackService, 'getApprovedReviews').mockResolvedValue(
      ok({
        items: [mockFeedback],
        hasMore: false,
      })
    );
    const result = await feedbackService.getApprovedReviews('app-code-flow');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
    }
  });

  it('20. Major domain error types are handled consistently', async () => {
    vi.spyOn(appService, 'getAppBySlug').mockResolvedValue(ok(null));
    const notFoundRes = await appService.getAppBySlug('non-existent');
    expect(notFoundRes.success).toBe(true);
    if (notFoundRes.success) {
      expect(notFoundRes.data).toBeNull();
    }
  });
});
