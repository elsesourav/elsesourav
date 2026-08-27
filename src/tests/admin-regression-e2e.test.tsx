import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/app/auth-context';
import { ThemeProvider } from '@/app/theme';
import { ToastProvider } from '@/components';
import { AppRoutes } from '@/routes/AppRoutes';

import { appService } from '@/services/app.service';
import { classificationService } from '@/services/classification.service';
import { appVersionService } from '@/services/version.service';
import { blogService } from '@/services/blog.service';
import { helpService } from '@/services/help.service';
import { supportService } from '@/services/support.service';
import { auditService } from '@/services/audit.service';

import {
  appRepository,
  categoryRepository,
  tagRepository,
  appVersionRepository,
  blogRepository,
  blogCategoryRepository,
  blogTagRepository,
  helpCategoryRepository,
  helpArticleRepository,
  supportRepository,
  auditLogRepository,
  analyticsRepository,
  feedbackRepository,
} from '@/repositories';

import {
  createTestUser,
  createTestAdmin,
  createTestApp,
  createTestCategory,
  createTestTag,
  createTestBlogPost,
  createTestHelpCategory,
  createTestHelpArticle,
  createTestSupportTicket,
  createTestSupportMessage,
  createTestAuditLog,
  createTestAppVersion,
} from './fixtures/test-data';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import type { App } from '@/types/app.types';

describe('Complete Admin Regression Test Suite (Prompt 73)', () => {
  const mockAdmin = createTestAdmin();
  const mockUser = createTestUser();

  const mockAdminAuthUser: AuthUser = {
    uid: mockAdmin.id,
    email: mockAdmin.email,
    emailVerified: true,
    displayName: mockAdmin.displayName,
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: mockAdmin.createdAt,
  };

  const mockUserAuthUser: AuthUser = {
    uid: mockUser.id,
    email: mockUser.email,
    emailVerified: true,
    displayName: mockUser.displayName,
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: mockUser.createdAt,
  };

  const adminContext = {
    id: mockAdmin.id,
    email: mockAdmin.email,
    name: mockAdmin.displayName,
    role: 'admin' as const,
  };

  const userContext = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.displayName,
    role: 'user' as const,
  };

  const mockApp = createTestApp();
  const mockCategory = createTestCategory();
  const mockTag = createTestTag();
  const mockBlog = createTestBlogPost();
  const mockHelpCat = createTestHelpCategory();
  const mockHelpArt = createTestHelpArticle();
  const mockTicket = createTestSupportTicket();
  const mockMessage = createTestSupportMessage();
  const mockAuditLog = createTestAuditLog();
  const mockVersion = createTestAppVersion();

  const createAuthMock = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
    authUser: mockAdminAuthUser,
    user: mockAdmin,
    role: 'admin',
    isAuthenticated: true,
    isAdmin: true,
    isLoading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signUp: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signInWithGoogle: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signOut: vi.fn().mockResolvedValue(ok(undefined)),
    sendPasswordReset: vi.fn().mockResolvedValue(ok(undefined)),
    sendVerificationEmail: vi.fn().mockResolvedValue(ok(undefined)),
    changePassword: vi.fn().mockResolvedValue(ok(undefined)),
    deleteAccount: vi.fn().mockResolvedValue(ok(undefined)),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderAdminApp = (initialRoute = '/admin', authOverrides?: Partial<AuthContextValue>) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>
          <AuthContext.Provider value={createAuthMock(authOverrides)}>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default App Repositories
    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockApp], totalCount: 1, hasMore: false })
    );
    vi.spyOn(appRepository, 'findById').mockResolvedValue(ok(mockApp));
    vi.spyOn(appRepository, 'findBySlug').mockResolvedValue(ok(mockApp));
    vi.spyOn(appRepository, 'checkSlugUnique').mockResolvedValue(ok(true));
    vi.spyOn(appRepository, 'createDraft').mockImplementation(async (dto) =>
      ok({ ...mockApp, ...dto, id: 'app-draft-1', status: 'draft' as const })
    );
    vi.spyOn(appRepository, 'update').mockImplementation(async (id, dto) =>
      ok({ ...mockApp, ...dto, id })
    );
    vi.spyOn(appRepository, 'publish').mockImplementation(async (id) =>
      ok({ ...mockApp, id, status: 'published' as const, publishedAt: Date.now() })
    );
    vi.spyOn(appRepository, 'unpublish').mockImplementation(async (id) =>
      ok({ ...mockApp, id, status: 'draft' as const })
    );
    vi.spyOn(appRepository, 'archive').mockImplementation(async (id) =>
      ok({ ...mockApp, id, status: 'archived' as const })
    );
    vi.spyOn(appRepository, 'restore').mockImplementation(async (id, targetStatus) =>
      ok({ ...mockApp, id, status: targetStatus || 'draft' })
    );

    // Classification (Category & Tag) Repositories
    vi.spyOn(categoryRepository, 'findById').mockResolvedValue(ok(mockCategory));
    vi.spyOn(categoryRepository, 'findBySlug').mockResolvedValue(ok(mockCategory));
    vi.spyOn(categoryRepository, 'findActive').mockResolvedValue(
      ok({ items: [mockCategory], totalCount: 1, hasMore: false })
    );
    vi.spyOn(categoryRepository, 'checkSlugUnique').mockResolvedValue(ok(true));
    vi.spyOn(categoryRepository, 'create').mockImplementation(async (dto) =>
      ok({ ...mockCategory, ...dto, id: 'cat-new-1' })
    );
    vi.spyOn(categoryRepository, 'update').mockImplementation(async (id, dto) =>
      ok({ ...mockCategory, ...dto, id })
    );
    vi.spyOn(categoryRepository, 'deactivate').mockImplementation(async (id) =>
      ok({ ...mockCategory, id, isActive: false })
    );

    vi.spyOn(tagRepository, 'findById').mockResolvedValue(ok(mockTag));
    vi.spyOn(tagRepository, 'findBySlug').mockResolvedValue(ok(mockTag));
    vi.spyOn(tagRepository, 'findActive').mockResolvedValue(
      ok({ items: [mockTag], totalCount: 1, hasMore: false })
    );
    vi.spyOn(tagRepository, 'checkSlugUnique').mockResolvedValue(ok(true));
    vi.spyOn(tagRepository, 'create').mockImplementation(async (dto) =>
      ok({ ...mockTag, ...dto, id: 'tag-new-1' })
    );
    vi.spyOn(tagRepository, 'update').mockImplementation(async (id, dto) =>
      ok({ ...mockTag, ...dto, id })
    );
    vi.spyOn(tagRepository, 'deactivate').mockImplementation(async (id) =>
      ok({ ...mockTag, id, isActive: false })
    );

    // Version Repository
    vi.spyOn(appVersionRepository, 'findById').mockResolvedValue(ok(mockVersion));
    vi.spyOn(appVersionRepository, 'findByVersion').mockResolvedValue(ok(mockVersion));
    vi.spyOn(appVersionRepository, 'listByApp').mockResolvedValue(
      ok({ items: [mockVersion], totalCount: 1, hasMore: false })
    );
    vi.spyOn(appVersionRepository, 'checkVersionUnique').mockResolvedValue(ok(true));
    vi.spyOn(appVersionRepository, 'create').mockImplementation(async (appId, dto) =>
      ok({ ...mockVersion, ...dto, appId, id: 'ver-new-1', status: 'draft' as const })
    );
    vi.spyOn(appVersionRepository, 'update').mockImplementation(async (appId, versionId, dto) =>
      ok({ ...mockVersion, ...dto, appId, id: versionId })
    );
    vi.spyOn(appVersionRepository, 'setCurrentVersion').mockImplementation(async (appId, versionId) =>
      ok({ ...mockVersion, appId, id: versionId, isCurrent: true })
    );

    // Blog Repositories
    vi.spyOn(blogRepository, 'findById').mockResolvedValue(ok(mockBlog));
    vi.spyOn(blogRepository, 'findBySlug').mockResolvedValue(ok(mockBlog));
    vi.spyOn(blogRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockBlog], totalCount: 1, hasMore: false })
    );
    vi.spyOn(blogRepository, 'listPublished').mockResolvedValue(
      ok({ items: [mockBlog], totalCount: 1, hasMore: false })
    );
    vi.spyOn(blogRepository, 'checkSlugUnique').mockResolvedValue(ok(true));
    vi.spyOn(blogRepository, 'createDraft').mockImplementation(async (dto) =>
      ok({ ...mockBlog, ...dto, id: 'blog-draft-1', status: 'draft' as const })
    );
    vi.spyOn(blogRepository, 'update').mockImplementation(async (id, dto) =>
      ok({ ...mockBlog, ...dto, id })
    );
    vi.spyOn(blogRepository, 'publish').mockImplementation(async (id) =>
      ok({ ...mockBlog, id, status: 'published' as const, publishedAt: Date.now() })
    );
    vi.spyOn(blogRepository, 'unpublish').mockImplementation(async (id) =>
      ok({ ...mockBlog, id, status: 'draft' as const })
    );
    vi.spyOn(blogRepository, 'archive').mockImplementation(async (id) =>
      ok({ ...mockBlog, id, status: 'archived' as const })
    );
    vi.spyOn(blogCategoryRepository, 'findActive').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(blogTagRepository, 'findActive').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );

    // Help Repositories
    vi.spyOn(helpCategoryRepository, 'findById').mockResolvedValue(ok(mockHelpCat));
    vi.spyOn(helpCategoryRepository, 'findBySlug').mockResolvedValue(ok(mockHelpCat));
    vi.spyOn(helpCategoryRepository, 'listActive').mockResolvedValue(
      ok({ items: [mockHelpCat], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpArticleRepository, 'findById').mockResolvedValue(ok(mockHelpArt));
    vi.spyOn(helpArticleRepository, 'findBySlug').mockResolvedValue(ok(mockHelpArt));
    vi.spyOn(helpArticleRepository, 'listPublished').mockResolvedValue(
      ok({ items: [mockHelpArt], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpArticleRepository, 'checkSlugUnique').mockResolvedValue(ok(true));
    vi.spyOn(helpArticleRepository, 'createDraft').mockImplementation(async (dto) =>
      ok({ ...mockHelpArt, ...dto, id: 'help-draft-1', status: 'draft' as const })
    );
    vi.spyOn(helpArticleRepository, 'update').mockImplementation(async (id, dto) =>
      ok({ ...mockHelpArt, ...dto, id })
    );
    vi.spyOn(helpArticleRepository, 'publish').mockImplementation(async (id) =>
      ok({ ...mockHelpArt, id, status: 'published' as const })
    );
    vi.spyOn(helpArticleRepository, 'unpublish').mockImplementation(async (id) =>
      ok({ ...mockHelpArt, id, status: 'draft' as const })
    );
    vi.spyOn(helpArticleRepository, 'archive').mockImplementation(async (id) =>
      ok({ ...mockHelpArt, id, status: 'archived' as const })
    );

    // Support Repository
    vi.spyOn(supportRepository, 'getTicket').mockResolvedValue(ok(mockTicket));
    vi.spyOn(supportRepository, 'listAdminTickets').mockResolvedValue(
      ok({ items: [mockTicket], totalCount: 1, hasMore: false })
    );
    vi.spyOn(supportRepository, 'listUserTickets').mockResolvedValue(
      ok({ items: [mockTicket], totalCount: 1, hasMore: false })
    );
    vi.spyOn(supportRepository, 'listMessages').mockResolvedValue(
      ok({ items: [mockMessage], totalCount: 1, hasMore: false })
    );
    vi.spyOn(supportRepository, 'addMessage').mockImplementation(async (dto) =>
      ok({ ...mockMessage, ...dto, id: 'msg-new-1', createdAt: Date.now() })
    );
    vi.spyOn(supportRepository, 'updateTicketStatus').mockImplementation(async (ticketId, status) =>
      ok({ ...mockTicket, id: ticketId, status })
    );
    vi.spyOn(supportRepository, 'updatePriority').mockImplementation(async (ticketId, priority) =>
      ok({ ...mockTicket, id: ticketId, priority })
    );
    vi.spyOn(supportRepository, 'reopenTicket').mockImplementation(async (ticketId) =>
      ok({ ...mockTicket, id: ticketId, status: 'open' })
    );

    // Audit Log Repository
    vi.spyOn(auditLogRepository, 'listLogs').mockResolvedValue(
      ok({ items: [mockAuditLog], totalCount: 1, hasMore: false })
    );
    vi.spyOn(auditLogRepository, 'createLog').mockImplementation(async (dto) =>
      ok({ ...mockAuditLog, ...dto, id: 'audit-log-new', createdAt: Date.now() })
    );

    // Analytics & Feedback Repositories
    vi.spyOn(analyticsRepository, 'listEvents').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(feedbackRepository, 'listAllForModeration').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
  });

  // ===========================================================================
  // TASK 1 — ADMIN LOGIN & ACCESS GUARD
  // ===========================================================================
  describe('Task 1: Admin Authentication & Access Guard', () => {
    it('allows verified admin to reach /admin dashboard', async () => {
      renderAdminApp('/admin');

      expect(
        await screen.findByRole('heading', { level: 1, name: /Admin Dashboard/i }, { timeout: 5000 })
      ).toBeInTheDocument();
      expect(await screen.findByText('Terminal Pro')).toBeInTheDocument();
    });

    it('blocks authenticated normal user from accessing /admin with security error state', async () => {
      renderAdminApp('/admin', {
        authUser: mockUserAuthUser,
        user: mockUser,
        role: 'user',
        isAdmin: false,
      });

      expect(await screen.findByText(/Admin Access Required/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Return to Home/i })).toBeInTheDocument();
    });

    it('redirects anonymous visitor attempting to access /admin to /login', async () => {
      renderAdminApp('/admin', {
        authUser: null,
        user: null,
        role: undefined,
        isAuthenticated: false,
        isAdmin: false,
      });

      // Anonymous should be redirected to Login page
      expect(await screen.findByRole('heading', { name: /Sign In|Welcome Back|Login/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 2 — APP LIFECYCLE MANAGEMENT
  // ===========================================================================
  describe('Task 2: Complete App Lifecycle (Draft -> Publish -> Public -> Archive -> Restore)', () => {
    it('executes full App lifecycle mutations cleanly', async () => {
      // 1. Create App Draft
      const draftResult = await appService.createDraft({
        slug: 'quantum-editor',
        name: 'Quantum Editor',
        shortDescription: 'Next-generation IDE for quantum circuits',
        description: 'Complete suite of simulation tools for quantum computing algorithms.',
        iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        primaryCategory: 'developer-tools',
        tags: ['quantum', 'ide'],
        platforms: ['web', 'macos'],
        links: [
          {
            id: 'link-1',
            appId: 'quantum-editor',
            platform: 'web',
            label: 'Launch Web Studio',
            url: 'https://quantum.elsesourav.com',
            action: 'open_app',
            isPrimary: true,
            displayOrder: 1,
            isActive: true,
          },
        ],
        screenshots: [],
        currentVersion: '0.1.0',
        status: 'draft',
        stats: { views: 0, launches: 0, libraryAdds: 0 },
        isFeatured: false,
        isPinned: false,
        sortOrder: 0,
      });

      expect(draftResult.success).toBe(true);
      if (!draftResult.success) return;
      const createdApp = draftResult.data;
      expect(createdApp.status).toBe('draft');
      expect(createdApp.name).toBe('Quantum Editor');

      // 2. Edit App Draft
      const updateResult = await appService.updateDraft(createdApp.id, {
        shortDescription: 'Updated quantum circuit simulation IDE',
      });
      expect(updateResult.success).toBe(true);
      if (updateResult.success) {
        expect(updateResult.data.shortDescription).toBe('Updated quantum circuit simulation IDE');
      }

      // 3. Validate Publication readiness
      const validationResult = appService.validateForPublish(createdApp);
      expect(validationResult.success).toBe(true);

      // 4. Publish App
      const publishResult = await appService.publishApp(createdApp.id);
      expect(publishResult.success).toBe(true);
      if (publishResult.success) {
        expect(publishResult.data.status).toBe('published');
      }

      // 5. Verify Public Discovery of Published App
      const publicLookup = await appService.getAppBySlug('quantum-editor');
      expect(publicLookup.success).toBe(true);

      // 6. Edit Published App
      const editPublished = await appService.updateApp(createdApp.id, {
        currentVersion: '0.2.0',
      });
      expect(editPublished.success).toBe(true);

      // 7. Unpublish App
      const unpublishResult = await appService.unpublishApp(createdApp.id);
      expect(unpublishResult.success).toBe(true);
      if (unpublishResult.success) {
        expect(unpublishResult.data.status).toBe('draft');
      }

      // 8. Archive App
      const archiveResult = await appService.archiveApp(createdApp.id);
      expect(archiveResult.success).toBe(true);
      if (archiveResult.success) {
        expect(archiveResult.data.status).toBe('archived');
      }

      // 9. Restore App
      const restoreResult = await appService.restoreApp(createdApp.id, 'draft');
      expect(restoreResult.success).toBe(true);
      if (restoreResult.success) {
        expect(restoreResult.data.status).toBe('draft');
      }
    });
  });

  // ===========================================================================
  // TASK 3 — CATEGORY MANAGEMENT
  // ===========================================================================
  describe('Task 3: Category Management (Create, Edit, Deactivate, Collision Guard)', () => {
    it('manages categories and prevents duplicate slug creation', async () => {
      // 1. Create Category
      const createRes = await classificationService.createCategory({
        name: 'Artificial Intelligence',
        slug: 'ai-tools',
        description: 'Machine learning models and AI-assisted workflows',
        icon: 'cpu',
        orderIndex: 2,
        isActive: true,
      });

      expect(createRes.success).toBe(true);
      if (!createRes.success) return;
      const cat = createRes.data;
      expect(cat.slug).toBe('ai-tools');

      // 2. Edit Category
      const editRes = await classificationService.updateCategory(cat.id, {
        description: 'Updated AI workflows and cognitive tools',
      });
      expect(editRes.success).toBe(true);

      // 3. Deactivate Category
      const deactRes = await classificationService.deactivateCategory(cat.id);
      expect(deactRes.success).toBe(true);
      if (deactRes.success) {
        expect(deactRes.data.isActive).toBe(false);
      }

      // 4. Duplicate slug collision rejection
      vi.spyOn(categoryRepository, 'checkSlugUnique').mockResolvedValueOnce(ok(false));
      const dupRes = await classificationService.createCategory({
        name: 'Duplicate AI',
        slug: 'ai-tools',
        description: 'Duplicate category',
        orderIndex: 3,
        isActive: true,
      });
      expect(dupRes.success).toBe(false);
      if (!dupRes.success) {
        expect(dupRes.error.message).toMatch(/already exists/i);
      }
    });
  });

  // ===========================================================================
  // TASK 4 — TAG MANAGEMENT
  // ===========================================================================
  describe('Task 4: Tag Management (Create, Edit, Duplicate Prevention, Deactivate)', () => {
    it('manages tags and enforces uniqueness constraints', async () => {
      // 1. Create Tag
      const createRes = await classificationService.createTag({
        name: 'Machine Learning',
        slug: 'machine-learning',
        description: 'Neural networks and deep learning pipelines',
        isActive: true,
      });

      expect(createRes.success).toBe(true);
      if (!createRes.success) return;
      const tag = createRes.data;
      expect(tag.slug).toBe('machine-learning');

      // 2. Edit Tag
      const updateRes = await classificationService.updateTag(tag.id, {
        description: 'Expanded ML tag description',
      });
      expect(updateRes.success).toBe(true);

      // 3. Deactivate Tag
      const deactRes = await classificationService.deactivateTag(tag.id);
      expect(deactRes.success).toBe(true);
      if (deactRes.success) {
        expect(deactRes.data.isActive).toBe(false);
      }

      // 4. Duplicate Tag prevention
      vi.spyOn(tagRepository, 'checkSlugUnique').mockResolvedValueOnce(ok(false));
      const dupRes = await classificationService.createTag({
        name: 'Duplicate ML',
        slug: 'machine-learning',
        isActive: true,
      });
      expect(dupRes.success).toBe(false);
      if (!dupRes.success) {
        expect(dupRes.error.message).toMatch(/already exists/i);
      }
    });
  });

  // ===========================================================================
  // TASK 5 — VERSION MANAGEMENT
  // ===========================================================================
  describe('Task 5: Version & Release Management', () => {
    it('validates semantic versions and manages releases', async () => {
      // 1. Create valid release version
      const verRes = await appVersionService.createVersion('app-terminal-pro', {
        appId: 'app-terminal-pro',
        version: '1.3.0',
        title: 'Terminal Pro 1.3.0 Release',
        summary: 'Added split pane support and GPU acceleration.',
        releaseNotes: '### New in 1.3.0\n- Split pane layouts\n- Performance enhancements',
        highlights: ['Split panes', 'GPU rendering'],
        releaseDate: Date.now(),
        status: 'draft',
        isCurrent: false,
      });

      expect(verRes.success).toBe(true);
      if (!verRes.success) return;
      const ver = verRes.data;
      expect(ver.version).toBe('1.3.0');

      // 2. Reject invalid semver formats
      const invalidVerRes = await appVersionService.createVersion('app-terminal-pro', {
        appId: 'app-terminal-pro',
        version: 'invalid_version_string',
        title: 'Bad version',
        summary: 'bad',
        releaseNotes: 'bad',
        highlights: [],
        releaseDate: Date.now(),
        status: 'draft',
        isCurrent: false,
      });

      expect(invalidVerRes.success).toBe(false);
      if (!invalidVerRes.success) {
        expect(invalidVerRes.error.message).toMatch(/Semantic Version/i);
      }

      // 3. Publish Version
      const publishRes = await appVersionService.publishVersion('app-terminal-pro', ver.id);
      expect(publishRes.success).toBe(true);

      // 4. Set as Current Version
      const currentRes = await appVersionService.setCurrentVersion('app-terminal-pro', ver.id);
      expect(currentRes.success).toBe(true);
      if (currentRes.success) {
        expect(currentRes.data.isCurrent).toBe(true);
      }

      // 5. Verify public list of versions
      const listRes = await appVersionService.listVersions('app-terminal-pro');
      expect(listRes.success).toBe(true);
      if (listRes.success) {
        expect(listRes.data.items.length).toBeGreaterThan(0);
      }
    });
  });

  // ===========================================================================
  // TASK 6 — BLOG MANAGEMENT
  // ===========================================================================
  describe('Task 6: Blog Management (Draft, Edit, Preview, Publish, Unpublish, Archive)', () => {
    it('manages blog lifecycle and protects draft privacy', async () => {
      // 1. Create Blog Post Draft
      const draftRes = await blogService.createDraft({
        title: 'Building Resilient Offline Systems',
        slug: 'building-resilient-offline-systems',
        excerpt: 'Comprehensive guide to offline-first architectures in 2026.',
        content: '# Offline Systems\n\nDesigning resilient client architectures that persist state.',
        authorId: mockAdmin.id,
        authorName: mockAdmin.displayName,
        category: 'Engineering',
        tags: ['offline', 'architecture'],
      });

      expect(draftRes.success).toBe(true);
      if (!draftRes.success) return;
      const post = draftRes.data;
      expect(post.status).toBe('draft');
      expect(post.readingTimeMinutes).toBeGreaterThanOrEqual(1);

      // 2. Edit Draft
      const updateRes = await blogService.updatePost(post.id, {
        title: 'Building Resilient Offline Systems in 2026',
      });
      expect(updateRes.success).toBe(true);

      // 3. Validate for Publish
      const valRes = blogService.validateForPublish(post);
      expect(valRes.success).toBe(true);

      // 4. Publish Post
      const pubRes = await blogService.publishPost(post.id);
      expect(pubRes.success).toBe(true);
      if (pubRes.success) {
        expect(pubRes.data.status).toBe('published');
      }

      // 5. Verify Public Discovery
      const publicRes = await blogService.getPostBySlug('building-resilient-offline-systems');
      expect(publicRes.success).toBe(true);

      // 6. Unpublish Post
      const unpubRes = await blogService.unpublishPost(post.id);
      expect(unpubRes.success).toBe(true);

      // 7. Archive Post
      const archRes = await blogService.archivePost(post.id);
      expect(archRes.success).toBe(true);
    });
  });

  // ===========================================================================
  // TASK 7 — HELP MANAGEMENT
  // ===========================================================================
  describe('Task 7: Help Management (Draft, Edit, Publish, Unpublish, Archive)', () => {
    it('manages help knowledge base lifecycle', async () => {
      // 1. Create Help Article Draft
      const draftRes = await helpService.createDraft({
        title: 'Configuring Custom Terminal Keybindings',
        slug: 'configuring-custom-terminal-keybindings',
        categoryId: 'hcat-getting-started',
        excerpt: 'Step by step instructions for customizing keyboard shortcuts.',
        content: '## Shortcuts\n\nEdit your configuration to remap default bindings.',
        orderIndex: 2,
        featured: false,
      });

      expect(draftRes.success).toBe(true);
      if (!draftRes.success) return;
      const art = draftRes.data;
      expect(art.status).toBe('draft');

      // 2. Edit Help Article
      const updateRes = await helpService.updateDraft(art.id, {
        title: 'Customizing All Terminal Shortcuts',
      });
      expect(updateRes.success).toBe(true);

      // 3. Publish Article
      const pubRes = await helpService.publishArticle(art.id);
      expect(pubRes.success).toBe(true);
      if (pubRes.success) {
        expect(pubRes.data.status).toBe('published');
      }

      // 4. Verify Public Retrieval
      const publicRes = await helpService.getArticleBySlug('configuring-custom-terminal-keybindings');
      expect(publicRes.success).toBe(true);

      // 5. Unpublish & Archive
      const unpubRes = await helpService.unpublishArticle(art.id);
      expect(unpubRes.success).toBe(true);

      const archRes = await helpService.archiveArticle(art.id);
      expect(archRes.success).toBe(true);
    });
  });

  // ===========================================================================
  // TASK 8 — SUPPORT ADMIN WORKFLOW
  // ===========================================================================
  describe('Task 8: Support Admin Workflow (Read, Reply, Priority, Status, Resolve, Reopen)', () => {
    it('executes full support ticket moderation cycle', async () => {
      // 1. Admin views ticket
      const ticketRes = await supportService.getTicket('ticket-001', adminContext);
      expect(ticketRes.success).toBe(true);
      if (!ticketRes.success || !ticketRes.data) return;
      const ticket = ticketRes.data;

      // 2. Admin reads messages
      const msgRes = await supportService.listMessages(ticket.id, adminContext);
      expect(msgRes.success).toBe(true);

      // 3. Admin replies to ticket
      const replyRes = await supportService.addMessage(
        {
          ticketId: ticket.id,
          message: 'Hello! Vim mode is fully supported under Settings -> Keybindings.',
        },
        adminContext
      );
      expect(replyRes.success).toBe(true);

      // 4. Update Priority (Admin only)
      const prioRes = await supportService.updateTicketPriority(ticket.id, 'high', adminContext);
      expect(prioRes.success).toBe(true);
      if (prioRes.success) {
        expect(prioRes.data.priority).toBe('high');
      }

      // 5. Update Status to Resolved
      const resolveRes = await supportService.updateTicketStatus(ticket.id, 'resolved', adminContext);
      expect(resolveRes.success).toBe(true);

      // 6. Close Ticket
      const closeRes = await supportService.closeTicket(ticket.id, adminContext);
      expect(closeRes.success).toBe(true);

      // 7. Reopen Ticket (Admin only)
      const reopenRes = await supportService.reopenTicket(ticket.id, adminContext);
      expect(reopenRes.success).toBe(true);
      if (reopenRes.success) {
        expect(reopenRes.data.status).toBe('open');
      }
    });
  });

  // ===========================================================================
  // TASK 9 — ANALYTICS
  // ===========================================================================
  describe('Task 9: Analytics Dashboard & Metric Verification', () => {
    it('renders platform metrics correctly for admin and handles empty state gracefully', async () => {
      renderAdminApp('/admin/analytics');

      expect(
        await screen.findByRole('heading', { name: /Platform Analytics & Engagement/i }, { timeout: 5000 })
      ).toBeInTheDocument();

      // Verify aggregate metric cards render
      expect(screen.getByText(/Total App Views/i)).toBeInTheDocument();
      expect(screen.getByText(/App Launches & Actions/i)).toBeInTheDocument();
      expect(screen.getByText(/Library Bookmarks/i)).toBeInTheDocument();
    });

    it('handles empty / zero data state without errors', async () => {
      vi.spyOn(appRepository, 'findMany').mockResolvedValueOnce(
        ok({ items: [], totalCount: 0, hasMore: false })
      );

      renderAdminApp('/admin/analytics');

      expect(
        await screen.findByRole('heading', { name: /Platform Analytics & Engagement/i }, { timeout: 5000 })
      ).toBeInTheDocument();
      expect(await screen.findByText(/No application performance data registered yet/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 10 — AUDIT LOGS
  // ===========================================================================
  describe('Task 10: Audit Logs Verification', () => {
    it('records and lists audit events for administrative actions', async () => {
      // 1. Record App Publish Audit
      const auditRes = await auditService.recordAction(
        {
          actorUserId: mockAdmin.id,
          actorEmail: mockAdmin.email,
          action: 'APP_PUBLISHED',
          entityType: 'app',
          entityId: 'app-terminal-pro',
          metadata: { name: 'Terminal Pro', version: '1.2.0' },
        },
        adminContext
      );

      expect(auditRes.success).toBe(true);
      if (auditRes.success) {
        expect(auditRes.data.action).toBe('APP_PUBLISHED');
        expect(auditRes.data.entityType).toBe('app');
      }

      // 2. List Audit Logs in Admin Portal
      const listRes = await auditService.listLogs(adminContext);
      expect(listRes.success).toBe(true);
      if (listRes.success) {
        expect(listRes.data.items.length).toBeGreaterThan(0);
      }

      // 3. Render Audit Logs Page
      renderAdminApp('/admin/audit-logs');
      expect(
        await screen.findByRole('heading', { name: /Security & Audit Trail/i }, { timeout: 5000 })
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 11 — SECURITY REGRESSION
  // ===========================================================================
  describe('Task 11: Security Regression (Unauthorized Actor Rejections)', () => {
    it('strictly denies administrative actions to non-admin actors', async () => {
      // 1. Audit Log Creation Denied
      const auditDenied = await auditService.recordAction(
        {
          actorUserId: mockUser.id,
          actorEmail: mockUser.email,
          action: 'APP_PUBLISHED',
          entityType: 'app',
          entityId: 'app-terminal-pro',
        },
        userContext
      );
      expect(auditDenied.success).toBe(false);

      // 2. Audit Log Listing Denied
      const auditListDenied = await auditService.listLogs(userContext);
      expect(auditListDenied.success).toBe(false);

      // 3. Admin Ticket Listing Denied
      const ticketListDenied = await supportService.listAdminTickets(userContext);
      expect(ticketListDenied.success).toBe(false);

      // 4. Ticket Priority Update Denied
      const prioDenied = await supportService.updateTicketPriority('ticket-001', 'high', userContext);
      expect(prioDenied.success).toBe(false);

      // 5. Ticket Reopen Denied to non-admin
      const reopenDenied = await supportService.reopenTicket('ticket-001', userContext);
      expect(reopenDenied.success).toBe(false);
    });
  });

  // ===========================================================================
  // TASK 12 — MOBILE ADMIN VIEWPORT
  // ===========================================================================
  describe('Task 12: Mobile Admin Viewport Responsiveness', () => {
    it('renders admin dashboard and management pages on mobile viewport without crashing', async () => {
      // Simulate mobile screen dimensions
      window.innerWidth = 375;
      window.innerHeight = 667;

      renderAdminApp('/admin');

      expect(
        await screen.findByRole('heading', { level: 1, name: /Admin Dashboard/i }, { timeout: 5000 })
      ).toBeInTheDocument();

      // Verify quick navigation links are accessible on mobile
      expect(screen.getAllByRole('link', { name: /Manage Apps/i })[0]).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^Dashboard$/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 14 — FAILURE & RESILIENCE TESTS
  // ===========================================================================
  describe('Task 14: Failure Tests & Graceful Error Handling', () => {
    it('rejects publishing an incomplete app draft missing required fields', () => {
      const incompleteApp: App = {
        ...mockApp,
        name: '',
        shortDescription: '',
        links: [],
      };

      const validation = appService.validateForPublish(incompleteApp);
      expect(validation.success).toBe(false);
      if (!validation.success) {
        expect(validation.error.message).toMatch(/required|incomplete/i);
      }
    });

    it('gracefully handles repository network / database failures', async () => {
      vi.spyOn(appRepository, 'findMany').mockResolvedValueOnce(
        err(AppError.internal('Database connection timed out'))
      );

      const res = await appService.listPublishedApps();
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toBe('Database connection timed out');
      }
    });
  });
});
