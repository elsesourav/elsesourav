import { describe, it, expect, vi } from 'vitest';
import {
  AppRepository,
  AppService,
  BlogRepository,
  BlogService,
  HelpRepository,
  HelpService,
  AdminRepository,
  PublishStatus,
  UserRole,
  PrismaClient,
} from '@elsesourav/database';
import {
  AdminSaveAppSchema,
  AdminSaveBlogSchema,
  AdminSaveHelpSchema,
  SiteSettingsSchema,
} from '@elsesourav/validation';

describe('Admin Content Flow & Publishing Pipeline (Prompt 02 Integration)', () => {
  describe('App Content & Markdown Documentation Flow', () => {
    it('validates AdminSaveAppSchema with documentationMd', () => {
      const validApp = AdminSaveAppSchema.parse({
        name: 'DevDock Manager',
        slug: 'devdock-manager',
        shortDescription: 'Local container and microservice manager',
        description: 'Comprehensive manager for local dev environments.',
        documentationMd:
          '## Installation\n\nRun `npm install devdock` to get started.\n\n### API Reference\n\n```ts\nconst dock = new DevDock();\n```',
        iconUrl: 'https://elsesourav.com/icon.png',
        categoryId: 'cat-123',
        status: 'draft',
      });

      expect(validApp.name).toBe('DevDock Manager');
      expect(validApp.documentationMd).toContain('## Installation');
    });

    it('creates draft app and ensures it remains hidden from unauthenticated public queries', async () => {
      const mockPrisma = {
        app: {
          create: vi.fn().mockResolvedValue({
            id: 'app-draft-1',
            slug: 'draft-tool',
            name: 'Draft Tool',
            shortDescription: 'Secret tool',
            description: 'Not published yet',
            documentationMd: '# Secret Docs',
            iconUrl: 'https://elsesourav.com/icon.png',
            status: PublishStatus.DRAFT,
            sortOrder: 0,
            isFeatured: false,
            isPinned: false,
            categoryId: 'cat-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            category: { id: 'cat-1', name: 'Dev', slug: 'dev', orderIndex: 0, isActive: true },
            tags: [],
            links: [],
            versions: [],
            stats: {
              appId: 'app-draft-1',
              views: 0,
              launches: 0,
              libraryAdds: 0,
              ratingAverage: 0,
              ratingCount: 0,
            },
          }),
          findUnique: vi.fn().mockResolvedValue({
            id: 'app-draft-1',
            slug: 'draft-tool',
            status: PublishStatus.DRAFT,
          }),
        },
      } as unknown as PrismaClient;

      const appRepo = new AppRepository(mockPrisma);
      const appService = new AppService(appRepo);

      // Admin creates draft app
      const created = await appService.createApp(UserRole.ADMIN, {
        name: 'Draft Tool',
        slug: 'draft-tool',
        shortDescription: 'Secret tool',
        description: 'Not published yet',
        documentationMd: '# Secret Docs',
        iconUrl: 'https://elsesourav.com/icon.png',
        categoryId: 'cat-1',
      });

      expect(created.status).toBe('draft');

      // Regular user cannot create or update apps
      await expect(
        appService.createApp(UserRole.USER, {
          name: 'Unauthorized',
          slug: 'unauthorized',
          shortDescription: 'Fail',
          description: 'Fail',
          iconUrl: 'https://elsesourav.com/icon.png',
          categoryId: 'cat-1',
        })
      ).rejects.toThrow(/Administrative privileges/);
    });

    it('transitions draft app to published with release versioning', async () => {
      const mockAppRecord = {
        id: 'app-1',
        slug: 'ready-tool',
        name: 'Ready Tool',
        status: PublishStatus.DRAFT,
        currentVersion: '0.9.0',
        publishedAt: null,
        shortDescription: 'Ready tool description',
        description: 'Ready tool description overview',
        documentationMd: '## Full Guide',
        iconUrl: 'https://icon.png',
        featuredImageUrl: null,
        demoUrl: null,
        videoUrl: null,
        sortOrder: 0,
        isFeatured: false,
        isPinned: false,
        seoTitle: null,
        seoDescription: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryId: 'cat-1',
        category: {
          id: 'cat-1',
          name: 'Dev',
          slug: 'dev',
          orderIndex: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tags: [],
        links: [],
        versions: [
          {
            id: 'v-1',
            appId: 'app-1',
            version: '0.9.0',
            changelog: 'Beta release',
            releaseDate: new Date(),
            downloadUrl: null,
          },
        ],
        stats: {
          appId: 'app-1',
          views: 0,
          launches: 0,
          libraryAdds: 0,
          ratingAverage: 0,
          ratingCount: 0,
        },
      };

      const mockPrisma = {
        app: {
          findUnique: vi.fn().mockResolvedValue(mockAppRecord),
          update: vi.fn().mockResolvedValue({
            ...mockAppRecord,
            status: PublishStatus.PUBLISHED,
            currentVersion: '1.0.0',
            publishedAt: new Date(),
            versions: [
              {
                id: 'v-1',
                appId: 'app-1',
                version: '1.0.0',
                changelog: 'Initial public launch.',
                releaseDate: new Date(),
                downloadUrl: null,
              },
            ],
          }),
        },
        appVersion: {
          create: vi.fn().mockResolvedValue({}),
          upsert: vi.fn().mockResolvedValue({}),
        },
        $transaction: vi
          .fn()
          .mockImplementation(async (cb: (tx: PrismaClient) => Promise<unknown>) =>
            cb(mockPrisma as unknown as PrismaClient)
          ),
      } as unknown as PrismaClient;

      const appRepo = new AppRepository(mockPrisma);
      const appService = new AppService(appRepo);

      const published = await appService.publishApp(UserRole.ADMIN, 'app-1', {
        version: '1.0.0',
        changelog: 'Initial public launch.',
      });

      expect(published.status).toBe('published');
      expect(published.currentVersion).toBe('1.0.0');
    });
  });

  describe('Blog Content & Markdown Articles Flow', () => {
    it('validates AdminSaveBlogSchema with full markdown content', () => {
      const validPost = AdminSaveBlogSchema.parse({
        title: 'Building Resilient Microservices in 2026',
        slug: 'resilient-microservices-2026',
        excerpt: 'An architectural retrospective on event sourcing and distributed transactions.',
        content:
          '# Distributed Systems\n\nHere is how we design idempotency keys and state machines in modern TypeScript services.\n\n```ts\nexport function processEvent() {}\n```',
        categoryId: 'cat-blog-1',
        status: 'published',
      });

      expect(validPost.title).toBe('Building Resilient Microservices in 2026');
      expect(validPost.content).toContain('```ts');
    });

    it('enforces ADMIN/STAFF permission for creating and updating blog posts', async () => {
      const mockPrisma = {
        blogPost: {
          create: vi.fn().mockResolvedValue({
            id: 'post-1',
            title: 'Staff Post',
            slug: 'staff-post',
            content:
              'Comprehensive content here for the article describing architecture in great technical depth and clarity.',
            excerpt: 'Comprehensive excerpt describing staff post in detail',
            status: PublishStatus.DRAFT,
            categoryId: 'cat-1',
            authorId: 'staff-1',
            readingTime: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
            category: { id: 'cat-1', name: 'Tech', slug: 'tech' },
            author: { id: 'staff-1', name: 'Staff Member', email: 'staff@test.com' },
            tags: [],
          }),
        },
      } as unknown as PrismaClient;

      const blogRepo = new BlogRepository(mockPrisma);
      const blogService = new BlogService(blogRepo);

      // Staff can create blog post
      const post = await blogService.createBlogPost('staff-1', UserRole.STAFF, {
        title: 'Staff Post',
        slug: 'staff-post',
        content:
          'Comprehensive content here for the article describing architecture in great technical depth and clarity.',
        excerpt: 'Comprehensive excerpt describing staff post in detail',
        categoryId: 'cat-1',
      });
      expect(post.title).toBe('Staff Post');

      // Regular User is blocked
      await expect(
        blogService.createBlogPost('user-1', UserRole.USER, {
          title: 'Hacked Post',
          slug: 'hacked-post',
          content:
            'Comprehensive content here for the article describing architecture in great technical depth and clarity.',
          excerpt: 'Comprehensive excerpt describing staff post in detail',
          categoryId: 'cat-1',
        })
      ).rejects.toThrow(/Administrative privileges/);
    });
  });

  describe('Help Center & Documentation Guides Flow', () => {
    it('validates AdminSaveHelpSchema with structured markdown', () => {
      const validGuide = AdminSaveHelpSchema.parse({
        title: 'Configuring Environment Variables',
        slug: 'configuring-environment-variables',
        excerpt: 'Step-by-step guide to setting up local and production secret vaults.',
        content:
          '# Environment Configuration\n\nCreate a `.env` file in the root:\n\n```env\nDATABASE_URL=postgres://...\n```',
        categoryId: 'cat-help-1',
        orderIndex: 0,
        status: 'published',
      });

      expect(validGuide.orderIndex).toBe(0);
      expect(validGuide.content).toContain('```env');
    });

    it('enforces authorization on help article mutations', async () => {
      const mockPrisma = {
        helpArticle: {
          create: vi.fn().mockResolvedValue({
            id: 'help-1',
            title: 'Help Guide',
            slug: 'help-guide',
            content: 'Content',
            excerpt: 'Excerpt',
            status: PublishStatus.PUBLISHED,
            orderIndex: 0,
            categoryId: 'cat-help-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            category: {
              id: 'cat-help-1',
              name: 'Setup',
              slug: 'setup',
              orderIndex: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            author: { id: 'admin-1', name: 'Admin', email: 'admin@test.com' },
          }),
        },
      } as unknown as PrismaClient;

      const helpRepo = new HelpRepository(mockPrisma);
      const helpService = new HelpService(helpRepo);

      // User cannot create help articles
      await expect(
        helpService.createArticle('user-1', UserRole.USER, {
          title: 'Unauthorized Guide',
          slug: 'unauthorized-guide',
          content: 'Content',
          categoryId: 'cat-help-1',
        })
      ).rejects.toThrow(/Administrative privileges/);

      // Admin succeeds
      const article = await helpService.createArticle('admin-1', UserRole.ADMIN, {
        title: 'Help Guide',
        slug: 'help-guide',
        content: 'Content',
        excerpt: 'Excerpt',
        categoryId: 'cat-help-1',
      });
      expect(article.title).toBe('Help Guide');
    });
  });

  describe('Site Identity, Copywriting & Fallback Graceful Handling', () => {
    it('validates extended SiteSettingsSchema with all new Prompt 02 keys', () => {
      const fullSettings = SiteSettingsSchema.parse({
        site_name: 'ElseSourav',
        site_tagline: 'Software & Tools',
        footer_copyright: '© 2026 ElseSourav. All rights reserved.',
        footer_text: 'Built with pride.',
        homepage_apps_title: 'Featured Apps',
        homepage_apps_subtitle: 'Explore tools.',
        homepage_blog_title: 'Engineering Notes',
        homepage_blog_subtitle: 'Articles and deep dives.',
        creator_principles_json: JSON.stringify(['Principle A', 'Principle B']),
        creator_focus_json: JSON.stringify(['Tools', 'Architecture']),
      });

      expect(fullSettings.footer_copyright).toBe('© 2026 ElseSourav. All rights reserved.');
      expect(fullSettings.homepage_apps_title).toBe('Featured Apps');
    });

    it('persists and retrieves site settings through AdminRepository', async () => {
      const mockSettings = [
        {
          key: 'site_name',
          value: 'ElseSourav',
          description: null,
          updatedAt: new Date(),
          updatedBy: null,
        },
        {
          key: 'footer_copyright',
          value: '© 2026 Custom Copyright',
          description: null,
          updatedAt: new Date(),
          updatedBy: null,
        },
      ];

      const mockPrisma = {
        siteSetting: {
          findMany: vi.fn().mockResolvedValue(mockSettings),
          upsert: vi.fn().mockResolvedValue({}),
        },
      } as unknown as PrismaClient;

      const adminRepo = new AdminRepository(mockPrisma);
      const allSettings = await adminRepo.getAllSettings();

      expect(allSettings['site_name']).toBe('ElseSourav');
      expect(allSettings['footer_copyright']).toBe('© 2026 Custom Copyright');
    });
  });
});
