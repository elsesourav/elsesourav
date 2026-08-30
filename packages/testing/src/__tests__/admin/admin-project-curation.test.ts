import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppService, AppRepository } from '@elsesourav/database';
import { AdminSaveAppSchema, PublishAppSchema } from '@elsesourav/validation';
import { AppError, type App, type UserRole } from '@elsesourav/types';

describe('Admin Project Curation System (Prompt 27)', () => {
  let appRepo: AppRepository;
  let appService: AppService;

  beforeEach(() => {
    vi.clearAllMocks();
    appRepo = new AppRepository();
    appService = new AppService(appRepo);
  });

  describe('Canonical Project Controls & Schema Validation', () => {
    it('validates a complete project curation payload via AdminSaveAppSchema', () => {
      const payload = {
        name: 'SpectraLens AI',
        slug: 'spectralens-ai',
        shortDescription: 'Computer vision analysis tool with on-device WebAssembly pipeline.',
        description: 'Advanced computer vision analysis with WebAssembly and WebGL acceleration.',
        documentationMd: '### Architecture\n\nSpectraLens uses WebAssembly to run vision models locally in the browser.\n\n```ts\nconst model = await loadModel();\n```',
        iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
        featuredImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
        demoUrl: 'https://spectralens.app',
        videoUrl: 'https://youtube.com/watch?v=example',
        categoryId: 'cat-ai',
        isFeatured: true,
        isPinned: true,
        sortOrder: 1,
        seoTitle: 'SpectraLens AI — On-Device Computer Vision',
        seoDescription: 'Perform local computer vision analysis directly in modern browsers.',
      };

      const result = AdminSaveAppSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid project slug formats (uppercase, spaces, special characters)', () => {
      const invalidSlugPayload = {
        name: 'Invalid App',
        slug: 'Invalid App Slug!',
        shortDescription: 'Short desc',
        description: 'Full desc',
        iconUrl: 'https://example.com/icon.png',
        categoryId: 'cat-1',
      };

      const result = AdminSaveAppSchema.safeParse(invalidSlugPayload);
      expect(result.success).toBe(false);
    });

    it('validates publication release payload via PublishAppSchema', () => {
      const publishPayload = {
        version: '1.2.0',
        changelog: 'Added WebAssembly acceleration and export presets.',
        downloadUrl: 'https://github.com/elsesourav/spectralens/releases/v1.2.0',
      };

      const result = PublishAppSchema.safeParse(publishPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('Status Transitions & Discovery Routing (Work, Lab, Archive, Draft)', () => {
    it('allows Admin to transition project to ARCHIVED status preserving history without deletion', async () => {
      const mockApp: Partial<App> = {
        id: 'app-old-1',
        name: 'Old Portfolio Attempt',
        slug: 'old-portfolio-attempt',
        status: 'published',
        primaryCategory: 'utilities',
      };

      vi.spyOn(appRepo, 'findById').mockResolvedValue(mockApp as App);
      vi.spyOn(appRepo, 'updateStatus').mockResolvedValue({ ...mockApp, status: 'archived' } as App);

      const archived = await appService.archiveApp('ADMIN', 'app-old-1');
      expect(archived.status).toBe('archived');
      expect(appRepo.updateStatus).toHaveBeenCalledWith('app-old-1', 'ARCHIVED');
    });

    it('prevents non-admin callers from viewing draft or archived projects via standard slug query', async () => {
      const draftApp: Partial<App> = {
        id: 'app-draft-1',
        name: 'Unreleased Experiment',
        slug: 'unreleased-experiment',
        status: 'draft',
      };

      vi.spyOn(appRepo, 'findBySlug').mockResolvedValue(draftApp as App);

      await expect(
        appService.getAppBySlug('unreleased-experiment', undefined)
      ).rejects.toThrow(AppError);
    });

    it('allows ADMIN callers to view draft projects via getAppBySlug', async () => {
      const draftApp: Partial<App> = {
        id: 'app-draft-1',
        name: 'Unreleased Experiment',
        slug: 'unreleased-experiment',
        status: 'draft',
      };

      vi.spyOn(appRepo, 'findBySlug').mockResolvedValue(draftApp as App);

      const app = await appService.getAppBySlug('unreleased-experiment', 'ADMIN');
      expect(app.slug).toBe('unreleased-experiment');
    });
  });

  describe('Security & RBAC Controls', () => {
    it('rejects unauthenticated and non-admin roles from creating applications', async () => {
      await expect(
        appService.createApp(undefined as unknown as UserRole, {
          name: 'Hacker App',
          slug: 'hacker-app',
          shortDescription: 'Desc',
          description: 'Full desc',
          iconUrl: 'https://example.com/icon.png',
          categoryId: 'cat-1',
        })
      ).rejects.toThrow(AppError);
    });

    it('rejects regular USER role from archiving or deleting applications', async () => {
      await expect(
        appService.archiveApp('USER', 'app-123')
      ).rejects.toThrow(AppError);

      await expect(
        appService.deleteApp('USER', 'app-123')
      ).rejects.toThrow(AppError);
    });
  });

  describe('Destructive Action Safety & Soft Deletion', () => {
    it('executes soft delete preserving relations when authorized admin deletes an app', async () => {
      const mockApp: Partial<App> = {
        id: 'app-del-1',
        name: 'Temporary Project',
        slug: 'temporary-project',
      };

      vi.spyOn(appRepo, 'findById').mockResolvedValue(mockApp as App);
      vi.spyOn(appRepo, 'softDelete').mockResolvedValue(undefined);

      await appService.deleteApp('ADMIN', 'app-del-1');
      expect(appRepo.softDelete).toHaveBeenCalledWith('app-del-1');
    });
  });
});
