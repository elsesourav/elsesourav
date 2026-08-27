import type { User, UserLibraryItem } from '@/types/user.types';
import type { App } from '@/types/app.types';
import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import type { SupportTicket, SupportTicketMessage } from '@/types/support.types';
import type { AuditLog } from '@/types/audit.types';
import type { Notification } from '@/types/notification.types';

const BASE_TIMESTAMP = 1700000000000;

export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-id-001',
    email: 'test.user@example.com',
    displayName: 'Test Regular User',
    role: 'user',
    status: 'active',
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestAdmin(overrides?: Partial<User>): User {
  return {
    id: 'test-admin-id-001',
    email: 'test.admin@example.com',
    displayName: 'Test Admin User',
    role: 'admin',
    status: 'active',
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestCategory(overrides?: Partial<Category>): Category {
  return {
    id: 'cat-developer-tools',
    name: 'Developer Tools',
    slug: 'developer-tools',
    description: 'Tools for software engineering and development',
    icon: 'code',
    orderIndex: 1,
    isActive: true,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestTag(overrides?: Partial<Tag>): Tag {
  return {
    id: 'tag-terminal',
    name: 'Terminal',
    slug: 'terminal',
    description: 'Command-line terminal emulators and tools',
    isActive: true,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestApp(overrides?: Partial<App>): App {
  return {
    id: 'app-terminal-pro',
    slug: 'terminal-pro',
    name: 'Terminal Pro',
    shortDescription: 'High-performance GPU-accelerated terminal for developers',
    description: 'A modern, lightweight terminal emulator built for developers with cross-platform support.',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    primaryCategory: 'developer-tools',
    tags: ['terminal', 'developer-tools'],
    platforms: ['macos', 'linux', 'windows'],
    links: [
      {
        id: 'link-1',
        appId: 'app-terminal-pro',
        platform: 'web',
        label: 'Website',
        url: 'https://elsesourav.com/apps/terminal-pro',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: 'link-2',
        appId: 'app-terminal-pro',
        platform: 'github',
        label: 'Repository',
        url: 'https://github.com/elsesourav/terminal-pro',
        displayOrder: 2,
        isActive: true,
      },
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    ],
    currentVersion: '1.2.0',
    stats: {
      views: 1540,
      launches: 890,
      libraryAdds: 320,
    },
    status: 'published',
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    publishedAt: BASE_TIMESTAMP,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  return {
    id: 'blog-post-001',
    slug: 'modern-web-architecture-2026',
    title: 'Modern Web Architecture in 2026',
    excerpt: 'Exploring patterns and practices for scalable, private single-page applications.',
    content: '# Modern Architecture\n\nA deep dive into resilient, secure client architectures.',
    authorId: 'test-admin-id-001',
    authorName: 'Sourav',
    category: 'Engineering',
    tags: ['architecture', 'web'],
    status: 'published',
    readingTimeMinutes: 6,
    publishedAt: BASE_TIMESTAMP,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestHelpCategory(overrides?: Partial<HelpCategory>): HelpCategory {
  return {
    id: 'hcat-getting-started',
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Onboarding and basic guidance',
    icon: 'book-open',
    orderIndex: 1,
    isActive: true,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestHelpArticle(overrides?: Partial<HelpArticle>): HelpArticle {
  return {
    id: 'help-art-001',
    slug: 'quickstart-guide',
    title: 'Quickstart Guide',
    excerpt: 'Learn how to discover, launch, and save applications to your personal library.',
    content: '## Quickstart\n\n1. Browse apps\n2. Save to library\n3. Launch in browser.',
    categoryId: 'hcat-getting-started',
    orderIndex: 1,
    status: 'published',
    helpfulCount: 42,
    unhelpfulCount: 2,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestSupportTicket(overrides?: Partial<SupportTicket>): SupportTicket {
  return {
    id: 'ticket-001',
    ticketNumber: 'TICK-1001',
    userId: 'test-user-id-001',
    userEmail: 'test.user@example.com',
    userName: 'Test Regular User',
    subject: 'Question regarding keyboard shortcuts',
    description: 'How do I customize the default launch keybindings in Terminal Pro?',
    category: 'app_issue',
    priority: 'normal',
    status: 'open',
    relatedAppId: 'app-terminal-pro',
    lastMessageAt: BASE_TIMESTAMP,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestSupportMessage(overrides?: Partial<SupportTicketMessage>): SupportTicketMessage {
  return {
    id: 'msg-001',
    ticketId: 'ticket-001',
    senderUserId: 'test-user-id-001',
    senderName: 'Test Regular User',
    senderRole: 'user',
    message: 'I would like to know if vim mode is supported.',
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestAuditLog(overrides?: Partial<AuditLog>): AuditLog {
  return {
    id: 'audit-log-001',
    actorUserId: 'test-admin-id-001',
    actorEmail: 'test.admin@example.com',
    action: 'APP_PUBLISHED',
    entityType: 'app',
    entityId: 'app-terminal-pro',
    metadata: { version: '1.2.0' },
    createdAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestNotification(overrides?: Partial<Notification>): Notification {
  return {
    id: 'notif-001',
    userId: 'test-user-id-001',
    title: 'Application Updated',
    message: 'Terminal Pro v1.2.0 is now available with new features.',
    type: 'APP_UPDATE',
    read: false,
    isRead: false,
    link: '/apps/terminal-pro',
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}

export function createTestUserLibraryItem(overrides?: Partial<UserLibraryItem>): UserLibraryItem {
  return {
    id: 'lib-001',
    userId: 'test-user-id-001',
    appId: 'app-terminal-pro',
    isFavorite: false,
    isPinned: false,
    addedAt: BASE_TIMESTAMP,
    ...overrides,
  };
}
