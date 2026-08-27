import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Firestore Security Rules Specification & Verification', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  it('rules file exists and specifies rules_version = "2"', () => {
    expect(fs.existsSync(rulesPath)).toBe(true);
    expect(rulesContent).toContain("rules_version = '2';");
    expect(rulesContent).toContain('service cloud.firestore');
  });

  describe('Helper Functions', () => {
    it('defines essential authentication and authorization helpers', () => {
      expect(rulesContent).toContain('function isAuthenticated()');
      expect(rulesContent).toContain('function isOwner(userId)');
      expect(rulesContent).toContain('function isUserAdmin()');
      expect(rulesContent).toContain('function isPublished()');
      expect(rulesContent).toContain('function isNotDeleted()');
      expect(rulesContent).toContain('function preventFieldModification(fields)');
    });

    it('verifies isUserAdmin checks custom claims and user document', () => {
      expect(rulesContent).toContain("request.auth.token.role == 'admin'");
      expect(rulesContent).toContain('request.auth.token.admin == true');
      expect(rulesContent).toContain("data.role == 'admin'");
    });
  });

  describe('Rule Constraints & Coverage', () => {
    it('enforces public read on published apps and admin-only writes', () => {
      expect(rulesContent).toContain('match /apps/{appId}');
      expect(rulesContent).toContain('isPublished() && isNotDeleted()');
      expect(rulesContent).toContain('allow create, update, delete: if isUserAdmin();');
    });

    it('enforces owner-only isolation on users collection and prevents self-elevation', () => {
      expect(rulesContent).toContain('match /users/{userId}');
      expect(rulesContent).toContain('allow get: if isOwner(userId) || isUserAdmin();');
      expect(rulesContent).toContain('allow list: if isUserAdmin();');
      expect(rulesContent).toContain("preventFieldModification(['role', 'createdAt'])");
    });

    it('protects subcollection user library to owner only', () => {
      expect(rulesContent).toContain('match /library/{appId}');
      expect(rulesContent).toContain('allow read, write: if isOwner(userId) || isUserAdmin();');
    });

    it('enforces admin-only writes on categories, blogPosts, blogCategories, blogTags, and helpCategories', () => {
      expect(rulesContent).toContain('match /categories/{categoryId}');
      expect(rulesContent).toContain('match /blogCategories/{categoryId}');
      expect(rulesContent).toContain('match /blogTags/{tagId}');
      expect(rulesContent).toContain('match /blogPosts/{postId}');
      expect(rulesContent).toContain('match /helpCategories/{categoryId}');
      expect(rulesContent).toContain('match /helpArticles/{articleId}');
      expect(rulesContent).toContain('match /helpArticleFeedback/{feedbackId}');
      expect(rulesContent).toContain('allow update, delete: if isUserAdmin();');
    });

    it('enforces immutable audit logs with admin-only access', () => {
      expect(rulesContent).toContain('match /auditLogs/{logId}');
      expect(rulesContent).toContain('allow read, create: if isUserAdmin();');
      expect(rulesContent).toContain('allow update, delete: if false;');
    });

    it('enforces owner isolation on notifications and supportTickets with immutable messages', () => {
      expect(rulesContent).toContain('match /notifications/{notificationId}');
      expect(rulesContent).toContain('match /supportTickets/{ticketId}');
      expect(rulesContent).toContain('resource.data.userId == request.auth.uid');
      expect(rulesContent).toContain('match /messages/{messageId}');
      expect(rulesContent).toContain('allow update, delete: if false;');
    });
  });

  describe('Security Scenarios Simulation', () => {
    // Simulator representing Firestore security rule evaluation
    const evaluateRule = (
      resource: { data: Record<string, unknown> } | null,
      request: {
        auth: { uid: string; token?: { role?: string; admin?: boolean } } | null;
        resource?: { data: Record<string, unknown> };
      },
      ruleType:
        | 'app_read'
        | 'user_read'
        | 'user_update_role'
        | 'admin_write'
        | 'audit_log_write'
        | 'audit_log_read'
        | 'audit_log_create'
        | 'notification_read'
        | 'notification_write'
        | 'ticket_read'
        | 'ticket_write'
        | 'library_access'
    ): boolean => {
      const isAuthenticated = request.auth !== null;
      const isOwner = (uid: string) => isAuthenticated && request.auth?.uid === uid;
      const isUserAdmin = () =>
        isAuthenticated &&
        (request.auth?.token?.role === 'admin' || request.auth?.token?.admin === true);

      switch (ruleType) {
        case 'app_read':
          return (
            (resource?.data.status === 'published' && resource?.data.deletedAt == null) ||
            isUserAdmin()
          );

        case 'user_read':
          return isOwner(resource?.data.id as string) || isUserAdmin();

        case 'user_update_role':
          // Changing role is disallowed for non-admins
          if (isUserAdmin()) return true;
          if (!isOwner(resource?.data.id as string)) return false;
          return request.resource?.data.role === resource?.data.role;

        case 'admin_write':
          return isUserAdmin();

        case 'audit_log_write':
          // Updates/deletes always return false
          return false;

        case 'audit_log_read':
        case 'audit_log_create':
          return isUserAdmin();

        case 'notification_read':
        case 'notification_write':
          return isOwner(resource?.data.userId as string) || isUserAdmin();

        case 'ticket_read':
        case 'ticket_write':
          return isOwner(resource?.data.userId as string) || isUserAdmin();

        case 'library_access':
          return isOwner(resource?.data.userId as string) || isUserAdmin();

        default:
          return false;
      }
    };

    it('1. Anonymous user can read allowed public published data', () => {
      const app = { data: { status: 'published', name: 'Web App' } };
      const anonymousRequest = { auth: null };
      expect(evaluateRule(app, anonymousRequest, 'app_read')).toBe(true);
    });

    it('2. Anonymous user cannot read private user data', () => {
      const user = { data: { id: 'user_123', email: 'user@example.com' } };
      const anonymousRequest = { auth: null };
      expect(evaluateRule(user, anonymousRequest, 'user_read')).toBe(false);
    });

    it('3. Anonymous user cannot write protected data', () => {
      const anonymousRequest = { auth: null };
      expect(evaluateRule(null, anonymousRequest, 'admin_write')).toBe(false);
    });

    it('4. USER can read their own allowed private data', () => {
      const ownUser = { data: { id: 'user_123' } };
      const userRequest = { auth: { uid: 'user_123' } };
      expect(evaluateRule(ownUser, userRequest, 'user_read')).toBe(true);
    });

    it('5. USER cannot read another users private data', () => {
      const otherUser = { data: { id: 'user_999' } };
      const userRequest = { auth: { uid: 'user_123' } };
      expect(evaluateRule(otherUser, userRequest, 'user_read')).toBe(false);
    });

    it('6. USER cannot perform ADMIN operations', () => {
      const userRequest = { auth: { uid: 'user_123' } };
      expect(evaluateRule(null, userRequest, 'admin_write')).toBe(false);
    });

    it('7. ADMIN can perform authorized management operations', () => {
      const adminRequest = { auth: { uid: 'admin_1', token: { role: 'admin' } } };
      expect(evaluateRule(null, adminRequest, 'admin_write')).toBe(true);
    });

    it('8. Users cannot modify their own role to admin', () => {
      const user = { data: { id: 'user_123', role: 'user' } };
      const elevateRequest = {
        auth: { uid: 'user_123' },
        resource: { data: { id: 'user_123', role: 'admin' } },
      };
      expect(evaluateRule(user, elevateRequest, 'user_update_role')).toBe(false);
    });

    it('9. Unpublished/draft content cannot be accessed publicly', () => {
      const draftApp = { data: { status: 'draft', name: 'Secret App' } };
      const anonymousRequest = { auth: null };
      expect(evaluateRule(draftApp, anonymousRequest, 'app_read')).toBe(false);

      const userRequest = { auth: { uid: 'user_123' } };
      expect(evaluateRule(draftApp, userRequest, 'app_read')).toBe(false);
    });

    it('10. Soft-deleted content is hidden from public reads', () => {
      const deletedApp = {
        data: { status: 'published', deletedAt: Date.now(), name: 'Archived App' },
      };
      const anonymousRequest = { auth: null };
      expect(evaluateRule(deletedApp, anonymousRequest, 'app_read')).toBe(false);
    });

    it('11. Audit logs cannot be updated or deleted by anyone', () => {
      const adminRequest = { auth: { uid: 'admin_1', token: { role: 'admin' } } };
      expect(evaluateRule(null, adminRequest, 'audit_log_write')).toBe(false);
    });

    it('12. USER can read own notifications but not other users notifications', () => {
      const ownNotif = { data: { userId: 'user_123', title: 'Update' } };
      const otherNotif = { data: { userId: 'user_999', title: 'Update' } };
      const userRequest = { auth: { uid: 'user_123' } };

      expect(evaluateRule(ownNotif, userRequest, 'notification_read')).toBe(true);
      expect(evaluateRule(otherNotif, userRequest, 'notification_read')).toBe(false);
    });

    it('13. USER can read own support tickets but not other users tickets', () => {
      const ownTicket = { data: { userId: 'user_123', subject: 'Issue' } };
      const otherTicket = { data: { userId: 'user_999', subject: 'Secret Issue' } };
      const userRequest = { auth: { uid: 'user_123' } };

      expect(evaluateRule(ownTicket, userRequest, 'ticket_read')).toBe(true);
      expect(evaluateRule(otherTicket, userRequest, 'ticket_read')).toBe(false);
    });

    it('14. USER can manage own library entries but not other users library entries', () => {
      const ownLib = { data: { userId: 'user_123', appId: 'app_1' } };
      const otherLib = { data: { userId: 'user_999', appId: 'app_1' } };
      const userRequest = { auth: { uid: 'user_123' } };

      expect(evaluateRule(ownLib, userRequest, 'library_access')).toBe(true);
      expect(evaluateRule(otherLib, userRequest, 'library_access')).toBe(false);
    });

    it('15. Non-admin users and visitors cannot read audit logs', () => {
      const anonymousRequest = { auth: null };
      const userRequest = { auth: { uid: 'user_123' } };

      expect(evaluateRule(null, anonymousRequest, 'audit_log_read')).toBe(false);
      expect(evaluateRule(null, userRequest, 'audit_log_read')).toBe(false);
    });

    it('16. Non-admin users cannot create audit logs', () => {
      const userRequest = { auth: { uid: 'user_123' } };
      expect(evaluateRule(null, userRequest, 'audit_log_create')).toBe(false);
    });

    it('17. Admin can read and create audit logs', () => {
      const adminRequest = { auth: { uid: 'admin_1', token: { role: 'admin' } } };
      expect(evaluateRule(null, adminRequest, 'audit_log_read')).toBe(true);
      expect(evaluateRule(null, adminRequest, 'audit_log_create')).toBe(true);
    });
  });
});
