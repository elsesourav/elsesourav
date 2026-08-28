import { describe, it, expect } from 'vitest';
import {
  createTestUser,
  createTestAdmin,
  createTestApp,
  createTestCategory,
  createTestTag,
  createTestBlogPost,
  createTestHelpArticle,
  createTestHelpCategory,
  createTestSupportTicket,
  createTestSupportMessage,
  createTestAuditLog,
  createTestNotification,
} from '../test-data';

describe('Isolated Test Data Fixtures (Prompt 71)', () => {
  it('creates isolated regular user fixture with defaults and supports overrides', () => {
    const user = createTestUser();
    expect(user.id).toBe('test-user-id-001');
    expect(user.role).toBe('user');
    expect(user.email).toContain('@example.com');

    const customUser = createTestUser({ id: 'custom-id', displayName: 'Custom Name' });
    expect(customUser.id).toBe('custom-id');
    expect(customUser.displayName).toBe('Custom Name');
    expect(customUser.role).toBe('user');
  });

  it('creates isolated admin user fixture with admin role', () => {
    const admin = createTestAdmin();
    expect(admin.id).toBe('test-admin-id-001');
    expect(admin.role).toBe('admin');
  });

  it('creates isolated app fixture with published status and links', () => {
    const app = createTestApp();
    expect(app.id).toBe('app-terminal-pro');
    expect(app.status).toBe('published');
    expect(app.links.length).toBeGreaterThan(0);
    expect(app.stats.launches).toBeGreaterThan(0);
  });

  it('creates category, tag, blog, and help fixtures with valid slugs', () => {
    const cat = createTestCategory();
    const tag = createTestTag();
    const blog = createTestBlogPost();
    const helpCat = createTestHelpCategory();
    const helpArt = createTestHelpArticle();

    expect(cat.slug).toBe('developer-tools');
    expect(tag.slug).toBe('terminal');
    expect(blog.slug).toBe('modern-web-architecture-2026');
    expect(helpCat.slug).toBe('getting-started');
    expect(helpArt.slug).toBe('quickstart-guide');
  });

  it('creates support ticket and ticket message fixtures with consistent user reference', () => {
    const ticket = createTestSupportTicket();
    const msg = createTestSupportMessage();

    expect(ticket.userId).toBe('test-user-id-001');
    expect(msg.senderUserId).toBe('test-user-id-001');
  });

  it('creates audit log and notification fixtures with deterministic properties', () => {
    const log = createTestAuditLog();
    const notif = createTestNotification();

    expect(log.actorUserId).toBe('test-admin-id-001');
    expect(log.action).toBe('APP_PUBLISHED');
    expect(notif.userId).toBe('test-user-id-001');
    expect(notif.isRead).toBe(false);
  });
});
