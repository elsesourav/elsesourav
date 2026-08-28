import { describe, it, expect } from 'vitest';
import { validateDatasetIntegrity } from '../data-integrity';
import type { App } from '@/types/app.types';
import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import type { SupportTicket } from '@/types/support.types';
import type { AuditLog } from '@/types/audit.types';

describe('Data Backup & Integrity Validation (Prompt 69)', () => {
  const mockCategory: Category = {
    id: 'cat-1',
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'Tools for software engineering',
    icon: 'code',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockTag: Tag = {
    id: 'tag-1',
    slug: 'terminal',
    name: 'Terminal',
    description: 'Command line utilities',
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockApp: App = {
    id: 'app-term',
    slug: 'terminal-pro',
    name: 'Terminal Pro',
    shortDescription: 'Modern terminal',
    description: 'Full featured terminal app',
    iconUrl: 'https://example.com/icon.png',
    primaryCategory: 'developer-tools',
    tags: ['terminal'],
    platforms: ['macos'],
    links: [],
    screenshots: [],
    currentVersion: '1.0.0',
    stats: { views: 10, launches: 5, libraryAdds: 2 },
    status: 'published',
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockHelpCategory: HelpCategory = {
    id: 'hcat-1',
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Basic onboarding',
    icon: 'book',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockHelpArticle: HelpArticle = {
    id: 'art-1',
    slug: 'quickstart-guide',
    title: 'Quickstart Guide',
    excerpt: 'Getting started fast',
    content: 'Full guide text',
    categoryId: 'hcat-1',
    orderIndex: 1,
    status: 'published',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockBlogPost: BlogPost = {
    id: 'blog-1',
    slug: 'clean-architecture-2026',
    title: 'Clean Architecture in 2026',
    excerpt: 'Deep dive into clean architecture',
    content: 'Full content',
    authorId: 'user-sourav',
    authorName: 'Sourav',
    category: 'Engineering',
    tags: ['architecture'],
    status: 'published',
    readingTimeMinutes: 5,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockTicket: SupportTicket = {
    id: 'tick-1',
    ticketNumber: 'TICK-1001',
    userId: 'user-123',
    userEmail: 'user@example.com',
    userName: 'User 123',
    subject: 'Feature request',
    description: 'Please add dark theme to terminal',
    category: 'general',
    priority: 'normal',
    status: 'open',
    lastMessageAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockAuditLog: AuditLog = {
    id: 'log-1',
    actorUserId: 'admin-sourav',
    actorEmail: 'sourav@example.com',
    action: 'APP_PUBLISHED',
    entityType: 'app',
    entityId: 'app-term',
    createdAt: 1700000000000,
  };

  describe('validateDatasetIntegrity', () => {
    it('passes completely for valid cross-referenced datasets', () => {
      const report = validateDatasetIntegrity({
        apps: [mockApp],
        categories: [mockCategory],
        tags: [mockTag],
        blogPosts: [mockBlogPost],
        helpArticles: [mockHelpArticle],
        helpCategories: [mockHelpCategory],
        supportTickets: [mockTicket],
        auditLogs: [mockAuditLog],
      });

      expect(report.isValid).toBe(true);
      expect(report.errorCount).toBe(0);
      expect(report.warningCount).toBe(0);
      expect(report.totalChecked).toBe(5); // App, Blog, Help, Ticket, Log
    });

    it('detects missing app ID or missing slug as error', () => {
      const badApp: App = {
        ...mockApp,
        id: '',
        slug: '',
      };

      const report = validateDatasetIntegrity({
        apps: [badApp],
      });

      expect(report.isValid).toBe(false);
      expect(report.errorCount).toBeGreaterThan(0);
      expect(report.issues.some((i) => i.collection === 'apps' && i.field === 'slug')).toBe(true);
    });

    it('warns when app references an unindexed category or tag', () => {
      const unlinkedApp: App = {
        ...mockApp,
        primaryCategory: 'non-existent-category',
        tags: ['ghost-tag'],
      };

      const report = validateDatasetIntegrity({
        apps: [unlinkedApp],
        categories: [mockCategory],
        tags: [mockTag],
      });

      expect(report.isValid).toBe(true); // Warnings do not fail validity
      expect(report.warningCount).toBe(2);
      expect(report.issues.some((i) => i.field === 'primaryCategory')).toBe(true);
      expect(report.issues.some((i) => i.field === 'tags')).toBe(true);
    });

    it('warns when help article references an invalid category ID', () => {
      const unlinkedArticle: HelpArticle = {
        ...mockHelpArticle,
        categoryId: 'ghost-cat-id',
      };

      const report = validateDatasetIntegrity({
        helpArticles: [unlinkedArticle],
        helpCategories: [mockHelpCategory],
      });

      expect(report.warningCount).toBe(1);
      expect(report.issues.some((i) => i.collection === 'helpArticles' && i.field === 'categoryId')).toBe(true);
    });

    it('flags error when support ticket is missing user ownership', () => {
      const orphanedTicket: SupportTicket = {
        ...mockTicket,
        userId: '',
        userEmail: '',
      };

      const report = validateDatasetIntegrity({
        supportTickets: [orphanedTicket],
      });

      expect(report.isValid).toBe(false);
      expect(report.issues.some((i) => i.collection === 'supportTickets')).toBe(true);
    });

    it('flags error when audit log is missing actor or action metadata', () => {
      const badLog: AuditLog = {
        ...mockAuditLog,
        actorUserId: '',
        action: '' as unknown as AuditLog['action'],
      };

      const report = validateDatasetIntegrity({
        auditLogs: [badLog],
      });

      expect(report.isValid).toBe(false);
      expect(report.issues.some((i) => i.collection === 'auditLogs')).toBe(true);
    });
  });
});
