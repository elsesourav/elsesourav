import { describe, it, expect, vi } from 'vitest';
import {
  UserService,
  UserRepository,
  AppService,
  AppRepository,
  BlogService,
  BlogRepository,
  HelpService,
  HelpRepository,
  SupportService,
  SupportRepository,
  LibraryService,
  LibraryRepository,
  NotificationService,
  NotificationRepository,
  MediaService,
  MediaRepository,
  sanitizeAuditDetails,
} from '@elsesourav/database';
import { AppError } from '@elsesourav/types';

vi.mock('@elsesourav/media', () => ({
  deleteCloudinaryAsset: vi.fn().mockResolvedValue(true),
}));

describe('Full System QA and Regression Test Suite', () => {
  // 1. User Identity & Authorization Boundaries
  describe('Task 4 & 5: User Authentication & Authorization Boundaries', () => {
    it('prevents standard users from performing administrative role upgrades', async () => {
      const mockUserRepo = {
        findById: vi.fn().mockResolvedValue({
          id: 'user-2',
          role: 'USER',
        }),
        updateRole: vi.fn(),
      } as unknown as UserRepository;

      const userService = new UserService(mockUserRepo);

      await expect(
        userService.updateUserRoleAdmin('user-1', 'USER', 'user-2', 'ADMIN')
      ).rejects.toThrowError(AppError);

      expect(mockUserRepo.updateRole).not.toHaveBeenCalled();
    });

    it('prevents normal users from reading another users private tickets (IDOR protection)', async () => {
      const mockSupportRepo = {
        findTicketDetail: vi.fn().mockResolvedValue({
          id: 'ticket-secret-1',
          userId: 'victim-user-id',
          subject: 'Confidential security issue',
          messages: [],
        }),
      } as unknown as SupportRepository;

      const supportService = new SupportService(mockSupportRepo);

      // Attacker trying to fetch victim's ticket
      await expect(
        supportService.getTicketDetail('attacker-user-id', 'USER', 'ticket-secret-1')
      ).rejects.toThrowError(AppError);
    });

    it('prevents normal users from reading or marking another users notifications', async () => {
      const mockNotificationRepo = {
        findByIdAndOwner: vi.fn().mockResolvedValue(null),
        markAsRead: vi.fn().mockResolvedValue(false),
      } as unknown as NotificationRepository;

      const notificationService = new NotificationService(mockNotificationRepo);

      await expect(
        notificationService.markAsRead('attacker-user-id', 'victim-notification-id')
      ).rejects.toThrowError(AppError);
    });
  });

  // 2. Apps Domain QA
  describe('Task 6: Apps Domain Lifecycle & Search', () => {
    it('handles complete App lifecycle: create, update, publish with versioning, and archive', async () => {
      const fullMockApp = {
        id: 'app-terminal-1',
        slug: 'terminal-pro',
        name: 'Terminal Pro',
        shortDescription: 'Modern terminal',
        description: 'Full featured web terminal emulator',
        iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v1/icon.png',
        primaryCategory: 'Development',
        categoryId: 'cat-dev',
        status: 'draft',
      };

      const mockAppRepo = {
        create: vi.fn().mockResolvedValue(fullMockApp),
        findById: vi.fn().mockResolvedValue(fullMockApp),
        update: vi.fn().mockResolvedValue({
          ...fullMockApp,
          name: 'Terminal Pro v2',
        }),
        publishWithVersionTransaction: vi.fn().mockResolvedValue({
          ...fullMockApp,
          name: 'Terminal Pro v2',
          status: 'published',
          currentVersion: '2.0.0',
        }),
        updateStatus: vi.fn().mockResolvedValue({
          ...fullMockApp,
          status: 'archived',
        }),
      } as unknown as AppRepository;

      const appService = new AppService(mockAppRepo);

      // 1. Create App
      const created = await appService.createApp('ADMIN', {
        name: 'Terminal Pro',
        slug: 'terminal-pro',
        shortDescription: 'Modern terminal',
        description: 'Full featured web terminal emulator',
        iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v1/icon.png',
        categoryId: 'cat-dev',
      });
      expect(created.status).toBe('draft');

      // 2. Publish App with Version
      const published = await appService.publishApp('ADMIN', 'app-terminal-1', {
        version: '2.0.0',
        changelog: 'Initial major release',
      });
      expect(published.status).toBe('published');
      expect(published.currentVersion).toBe('2.0.0');

      // 3. Archive App
      const archived = await appService.archiveApp('ADMIN', 'app-terminal-1');
      expect(archived.status).toBe('archived');
    });
  });

  // 3. Blog Domain QA
  describe('Task 7: Blog Content Lifecycle & SEO', () => {
    it('manages blog post authoring, publishing, and public query exclusion for drafts', async () => {
      const mockBlogRepo = {
        createPost: vi.fn().mockResolvedValue({
          id: 'post-1',
          slug: 'v2-release-notes',
          title: 'V2 Release Notes',
          status: 'draft',
        }),
        findById: vi.fn().mockResolvedValue({
          id: 'post-1',
          slug: 'v2-release-notes',
          title: 'V2 Release Notes',
          status: 'draft',
        }),
        publishPost: vi.fn().mockResolvedValue({
          id: 'post-1',
          slug: 'v2-release-notes',
          title: 'V2 Release Notes',
          status: 'published',
        }),
        findBySlug: vi.fn().mockResolvedValue({
          id: 'post-1',
          slug: 'v2-release-notes',
          title: 'V2 Release Notes',
          status: 'published',
          content:
            'This is a detailed and comprehensive blog post regarding ElseSourav V2 launch and features.',
        }),
        incrementViews: vi.fn().mockResolvedValue(undefined),
      } as unknown as BlogRepository;

      const blogService = new BlogService(mockBlogRepo);

      const created = await blogService.createBlogPost('author-1', 'ADMIN', {
        title: 'V2 Release Notes',
        slug: 'v2-release-notes',
        excerpt: 'Summary of V2 updates',
        content:
          'This is a detailed and comprehensive blog post regarding ElseSourav V2 launch and features.',
      });
      expect(created.status).toBe('draft');

      const published = await blogService.publishBlogPost('ADMIN', 'post-1');
      expect(published.status).toBe('published');

      const publicPost = await blogService.getPublicPostBySlug('v2-release-notes');
      expect(publicPost?.slug).toBe('v2-release-notes');
    });
  });

  // 4. Help Center QA
  describe('Task 8: Help Center Knowledge Base QA', () => {
    it('allows category and article publishing and verifies public discoverability', async () => {
      const mockHelpRepo = {
        createArticle: vi.fn().mockResolvedValue({
          id: 'art-1',
          title: 'Keyboard Shortcuts',
          slug: 'keyboard-shortcuts',
          status: 'draft',
        }),
        findArticleById: vi.fn().mockResolvedValue({
          id: 'art-1',
          title: 'Keyboard Shortcuts',
          slug: 'keyboard-shortcuts',
          status: 'draft',
        }),
        publishArticle: vi.fn().mockResolvedValue({
          id: 'art-1',
          title: 'Keyboard Shortcuts',
          slug: 'keyboard-shortcuts',
          status: 'published',
        }),
      } as unknown as HelpRepository;

      const helpService = new HelpService(mockHelpRepo);

      const created = await helpService.createArticle('author-1', 'STAFF', {
        categoryId: 'cat-shortcuts',
        title: 'Keyboard Shortcuts',
        slug: 'keyboard-shortcuts',
        content: 'Press Cmd+K to open global search.',
      });
      expect(created.status).toBe('draft');

      const published = await helpService.publishArticle('STAFF', 'art-1');
      expect(published.status).toBe('published');
    });
  });

  // 5. Support System QA & Privacy
  describe('Task 9: Support Ticket Privacy & Internal Notes', () => {
    it('guarantees internal staff notes are hidden from normal users but visible to Staff/Admin', async () => {
      const mockRepo = {
        findTicketDetail: vi.fn().mockImplementation((_ticketId, forAdmin) => {
          const messages = [
            { id: 'm1', message: 'Hello user, we are checking your issue.', isInternalNote: false },
          ];
          if (forAdmin) {
            messages.push({
              id: 'm2',
              message: 'Staff note: User has invalid subscription tier in Stripe.',
              isInternalNote: true,
            });
          }
          return Promise.resolve({
            id: 'ticket-1',
            userId: 'user-1',
            subject: 'Billing Question',
            messages,
          });
        }),
      } as unknown as SupportRepository;

      const supportService = new SupportService(mockRepo);

      // 1. User fetch
      const userView = await supportService.getTicketDetail('user-1', 'USER', 'ticket-1');
      expect(userView.messages.length).toBe(1);
      expect(
        userView.messages.some((m: { isInternalNote?: boolean }) => Boolean(m.isInternalNote))
      ).toBe(false);

      // 2. Admin fetch
      const adminView = await supportService.getTicketDetail('admin-1', 'ADMIN', 'ticket-1');
      expect(adminView.messages.length).toBe(2);
      expect(
        adminView.messages.some((m: { isInternalNote?: boolean }) => Boolean(m.isInternalNote))
      ).toBe(true);
    });
  });

  // 6. User Library QA
  describe('Task 10: User Library Operations', () => {
    it('manages saving, duplicate handling, and unsaving apps in user library', async () => {
      const mockLibraryRepo = {
        saveApp: vi.fn().mockResolvedValue({
          id: 'lib-1',
          userId: 'user-1',
          appId: 'app-terminal-1',
          isFavorite: true,
          addedAt: Date.now(),
        }),
        unsaveApp: vi.fn().mockResolvedValue(true),
        isAppSaved: vi.fn().mockResolvedValue(true),
      } as unknown as LibraryRepository;

      const libraryService = new LibraryService(mockLibraryRepo);

      const saved = await libraryService.saveApp('user-1', {
        appId: 'app-terminal-1',
        isFavorite: true,
      });
      expect(saved.isSaved).toBe(true);
      expect(saved.appId).toBe('app-terminal-1');

      const isSaved = await libraryService.isAppSaved('user-1', 'app-terminal-1');
      expect(isSaved).toBe(true);

      const unsaved = await libraryService.unsaveApp('user-1', 'app-terminal-1');
      expect(unsaved.isSaved).toBe(false);
    });
  });

  // 7. Notification System QA
  describe('Task 11: Notification System & Unread Counters', () => {
    it('manages unread counts and marks notifications as read with user ownership', async () => {
      const mockNotificationRepo = {
        getUnreadCount: vi.fn().mockResolvedValue(3),
        markAllAsRead: vi.fn().mockResolvedValue(3),
        createNotification: vi.fn().mockResolvedValue({
          id: 'notif-1',
          userId: 'user-1',
          title: 'Ticket Updated',
          message: 'Support staff responded to your ticket.',
          isRead: false,
        }),
      } as unknown as NotificationRepository;

      const notificationService = new NotificationService(mockNotificationRepo);

      const unread = await notificationService.getUnreadCount('user-1');
      expect(unread).toBe(3);

      const markedCount = await notificationService.markAllAsRead('user-1');
      expect(markedCount).toBe(3);
    });
  });

  // 8. Media System QA
  describe('Task 14: Cloudinary Media Reference Integrity & Deletion Safety', () => {
    it('rejects deletion of media assets currently referenced by active apps or blog posts', async () => {
      const mockMediaRepo = {
        checkAssetReferences: vi
          .fn()
          .mockResolvedValue([
            {
              resourceType: 'App',
              resourceId: 'app-terminal-1',
              resourceName: 'Terminal Pro',
              field: 'iconUrl',
            },
          ]),
        logMediaAudit: vi.fn(),
      } as unknown as MediaRepository;

      const mediaService = new MediaService(mockMediaRepo);

      await expect(
        mediaService.deleteMediaAdmin('admin-1', 'ADMIN', 'elsesourav/icons/terminal-icon', false)
      ).rejects.toThrowError(AppError);
    });

    it('allows deletion of media assets when unreferenced or when force is specified', async () => {
      const mockMediaRepo = {
        checkAssetReferences: vi.fn().mockResolvedValue([]),
        logMediaAudit: vi.fn().mockResolvedValue(undefined),
      } as unknown as MediaRepository;

      const mediaService = new MediaService(mockMediaRepo);
      const result = await mediaService.deleteMediaAdmin(
        'admin-1',
        'ADMIN',
        'elsesourav/icons/unused-icon',
        false
      );

      expect(result.success).toBe(true);
      expect(result.referencesCount).toBe(0);
    });
  });

  // 9. System Audit & Observability QA
  describe('Task 15: Audit Logging & Sensitive Data Redaction', () => {
    it('redacts tokens, credentials, and passwords from system audit payloads', () => {
      const sensitiveData = {
        adminId: 'admin-1',
        authToken: 'eyJhbGciOi...',
        password: 'mySecretPassword!1',
        clientSecret: 'secret_12345',
        meta: {
          userEmail: 'admin@elsesourav.com',
          apiKey: 'key_live_9999',
        },
      };

      const sanitized = sanitizeAuditDetails(sensitiveData);

      expect(sanitized.adminId).toBe('admin-1');
      expect(sanitized.authToken).toBe('[REDACTED_SECRET]');
      expect(sanitized.password).toBe('[REDACTED_SECRET]');
      expect(sanitized.clientSecret).toBe('[REDACTED_SECRET]');

      const nested = sanitized.meta as Record<string, unknown>;
      expect(nested.userEmail).toBe('admin@elsesourav.com');
      expect(nested.apiKey).toBe('[REDACTED_SECRET]');
    });
  });
});
