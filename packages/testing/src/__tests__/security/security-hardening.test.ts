import { describe, it, expect, vi } from 'vitest';
import {
  AppService,
  BlogService,
  HelpService,
  SupportService,
  UserService,
  MediaService,
  AppRepository,
  BlogRepository,
  HelpRepository,
  SupportRepository,
  UserRepository,
  MediaRepository,
} from '@elsesourav/database';
import { sanitizeHtml, sanitizePlainText, checkRateLimit } from '@elsesourav/utils';
import type { UserRole } from '@elsesourav/types';

describe('Security Hardening Test Suite (Prompt 37)', () => {
  describe('1. Input Sanitization & XSS Prevention', () => {
    it('should strip dangerous script tags and event handlers from HTML content', () => {
      const maliciousHtml = `
        <div>
          <h1>Safe Title</h1>
          <script>alert('xss')</script>
          <img src="x" onerror="alert('xss')" />
          <a href="javascript:stealCookies()">Click me</a>
          <p>Legitimate paragraph content with <strong>bold</strong> and <em>emphasis</em>.</p>
        </div>
      `;

      const sanitized = sanitizeHtml(maliciousHtml);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).not.toContain('onerror=');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('<h1>Safe Title</h1>');
      expect(sanitized).toContain('<strong>bold</strong>');
    });

    it('should sanitize plain text inputs and strip all HTML markup', () => {
      const dirtyInput = `<script>malicious()</script>Hello <b>World</b> & "quotes"`;
      const clean = sanitizePlainText(dirtyInput);
      expect(clean).toBe('Hello World & "quotes"');
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('<b>');
    });
  });

  describe('2. Rate Limiting Engine', () => {
    it('should allow requests under rate limit threshold and block once exceeded', () => {
      const testIp = '192.168.1.100';
      const action = 'test_action';
      const limit = 3;
      const windowMs = 5000;

      const r1 = checkRateLimit(`rate:${action}:${testIp}`, limit, windowMs);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit(`rate:${action}:${testIp}`, limit, windowMs);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit(`rate:${action}:${testIp}`, limit, windowMs);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);

      // Exceeded
      const r4 = checkRateLimit(`rate:${action}:${testIp}`, limit, windowMs);
      expect(r4.success).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe('3. Multi-Domain Server-Side Authorization Barrier', () => {
    it('AppService: forbids normal users from modifying or deleting apps', async () => {
      const mockRepo: Partial<AppRepository> = {
        softDelete: vi.fn(),
        create: vi.fn(),
      };
      const appService = new AppService(mockRepo as AppRepository);

      await expect(
        appService.createApp('USER' as UserRole, {
          name: 'Hacked App',
          slug: 'hacked-app',
          shortDescription: 'desc',
          description: 'desc',
          iconUrl: 'https://example.com/icon.png',
          categoryId: 'cat-1',
        })
      ).rejects.toThrow(/privileges/i);

      await expect(
        appService.deleteApp('USER' as UserRole, 'app-123')
      ).rejects.toThrow(/privileges/i);
    });

    it('BlogService: forbids normal users from creating, updating or deleting articles', async () => {
      const mockRepo: Partial<BlogRepository> = {
        createPost: vi.fn(),
        deletePost: vi.fn(),
      };
      const blogService = new BlogService(mockRepo as BlogRepository);

      await expect(
        blogService.createBlogPost('user-1', 'USER' as UserRole, {
          title: 'Unauthorized Post',
          slug: 'unauthorized-post',
          excerpt: 'excerpt',
          content: 'content',
        })
      ).rejects.toThrow(/privileges/i);

      await expect(
        blogService.deleteBlogPost('USER' as UserRole, 'post-123')
      ).rejects.toThrow(/privileges/i);
    });

    it('HelpService: forbids normal users from mutating help knowledge base', async () => {
      const mockRepo: Partial<HelpRepository> = {
        createArticle: vi.fn(),
        deleteArticle: vi.fn(),
      };
      const helpService = new HelpService(mockRepo as HelpRepository);

      await expect(
        helpService.createArticle('USER' as UserRole, 'user-1', {
          title: 'Unauthorized Guide',
          slug: 'unauthorized-guide',
          content: 'content',
          categoryId: 'cat-1',
        })
      ).rejects.toThrow(/privileges/i);

      await expect(
        helpService.deleteArticle('USER' as UserRole, 'art-123')
      ).rejects.toThrow(/privileges/i);
    });

    it('SupportService: prevents normal users from viewing all tickets or internal notes', async () => {
      const mockRepo: Partial<SupportRepository> = {
        findAllTickets: vi.fn(),
        findTicketDetail: vi.fn().mockImplementation((_id: string, forAdmin: boolean = false) => {
          const rawMessages = [
            {
              id: 'msg-1',
              ticketId: 'ticket-1',
              authorId: 'staff-1',
              message: 'Public reply',
              isInternalNote: false,
              createdAt: new Date(),
            },
            {
              id: 'msg-2',
              ticketId: 'ticket-1',
              authorId: 'staff-1',
              message: 'CONFIDENTIAL INTERNAL NOTE',
              isInternalNote: true,
              createdAt: new Date(),
            },
          ];

          return Promise.resolve({
            id: 'ticket-1',
            userId: 'user-other',
            ticketNumber: 'TICK-100',
            subject: 'Issue',
            description: 'Desc',
            category: 'general',
            priority: 'medium',
            status: 'OPEN',
            messages: forAdmin ? rawMessages : rawMessages.filter((m) => !m.isInternalNote),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }),
      };
      const supportService = new SupportService(mockRepo as SupportRepository);

      // Normal user cannot list all tickets
      await expect(
        supportService.getAllTicketsAdmin('USER' as UserRole)
      ).rejects.toThrow(/privileges/i);

      // Normal user reading another user ticket
      await expect(
        supportService.getTicketDetail('user-hacker', 'USER' as UserRole, 'ticket-1')
      ).rejects.toThrow(/permission/i);

      // Ticket owner reading ticket: internal notes MUST be stripped
      const ticketForOwner = await supportService.getTicketDetail('user-other', 'USER' as UserRole, 'ticket-1');
      expect(ticketForOwner.messages).toHaveLength(1);
      expect(ticketForOwner.messages[0]?.message).toBe('Public reply');
      expect(ticketForOwner.messages.some((m: { isInternalNote?: boolean }) => Boolean(m.isInternalNote))).toBe(false);
    });

    it('UserService: prevents privilege escalation and unauthorized account tampering', async () => {
      const mockRepo: Partial<UserRepository> = {
        updateRole: vi.fn(),
        adminDeleteUser: vi.fn(),
      };
      const userService = new UserService(mockRepo as UserRepository);

      // Normal user attempting to elevate role to ADMIN
      await expect(
        userService.updateUserRoleAdmin('user-1', 'USER' as UserRole, 'user-1', 'ADMIN')
      ).rejects.toThrow(/privileges/i);

      // Normal user attempting to delete another user account
      await expect(
        userService.deleteUserAccountAdmin('user-1', 'USER' as UserRole, 'user-2')
      ).rejects.toThrow(/privileges/i);
    });

    it('MediaService: prevents normal users from deleting cloud media assets', async () => {
      const mockRepo: Partial<MediaRepository> = {
        getReferencedMediaMap: vi.fn(),
      };
      const mediaService = new MediaService(mockRepo as MediaRepository);

      await expect(
        mediaService.deleteMediaAdmin('user-1', 'USER' as UserRole, 'v2/apps/icon_123')
      ).rejects.toThrow(/privileges/i);
    });
  });
});
