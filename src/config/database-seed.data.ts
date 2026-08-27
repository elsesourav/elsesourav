import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { App } from '@/types/app.types';
import type { AppVersion } from '@/types/version.types';
import type { HelpCategory, HelpArticle } from '@/types/help.types';
import type { BlogPost } from '@/types/blog.types';

/**
 * Authoritative System Baseline Seed Data
 * Safe, idempotent data required for initial platform launch.
 */

export const SYSTEM_CATEGORIES: readonly Omit<Category, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'cat-developer-tools',
    name: 'Developer Tools',
    slug: 'developer-tools',
    description: 'Compilers, linters, debuggers, terminal tools, and engineering utilities.',
    icon: 'Terminal',
    orderIndex: 1,
    isActive: true,
  },
  {
    id: 'cat-utilities',
    name: 'Utilities',
    slug: 'utilities',
    description: 'System helpers, clipboard managers, performance tools, and background services.',
    icon: 'Wrench',
    orderIndex: 2,
    isActive: true,
  },
  {
    id: 'cat-productivity',
    name: 'Productivity',
    slug: 'productivity',
    description: 'Workflow accelerators, task organizers, markdown editors, and notes apps.',
    icon: 'Zap',
    orderIndex: 3,
    isActive: true,
  },
  {
    id: 'cat-desktop-apps',
    name: 'Desktop Apps',
    slug: 'desktop-apps',
    description: 'Native desktop applications for macOS, Windows, and Linux.',
    icon: 'Monitor',
    orderIndex: 4,
    isActive: true,
  },
  {
    id: 'cat-web-extensions',
    name: 'Web Extensions',
    slug: 'web-extensions',
    description: 'Browser add-ons, developer extensions, and web productivity tools.',
    icon: 'Globe',
    orderIndex: 5,
    isActive: true,
  },
  {
    id: 'cat-open-source',
    name: 'Open Source',
    slug: 'open-source',
    description: 'Free and open-source software libraries, frameworks, and starters.',
    icon: 'Code',
    orderIndex: 6,
    isActive: true,
  },
];

export const SYSTEM_TAGS: readonly Omit<Tag, 'createdAt' | 'updatedAt'>[] = [
  { id: 'tag-react', name: 'React', slug: 'react', isActive: true },
  { id: 'tag-typescript', name: 'TypeScript', slug: 'typescript', isActive: true },
  { id: 'tag-cli', name: 'CLI', slug: 'cli', isActive: true },
  { id: 'tag-open-source', name: 'Open Source', slug: 'open-source', isActive: true },
  { id: 'tag-cross-platform', name: 'Cross-Platform', slug: 'cross-platform', isActive: true },
  { id: 'tag-automation', name: 'Automation', slug: 'automation', isActive: true },
  { id: 'tag-productivity', name: 'Productivity', slug: 'productivity', isActive: true },
];

export const SYSTEM_HELP_CATEGORIES: readonly Omit<HelpCategory, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'help-cat-getting-started',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Overview of ElseSourav platform, system requirements, and account setup.',
    icon: 'Sparkles',
    orderIndex: 1,
    isActive: true,
  },
  {
    id: 'help-cat-account-security',
    name: 'Account & Security',
    slug: 'account-security',
    description: 'Managing credentials, authentication, sessions, and data privacy.',
    icon: 'Shield',
    orderIndex: 2,
    isActive: true,
  },
  {
    id: 'help-cat-software-downloads',
    name: 'Software Downloads & Installation',
    slug: 'software-downloads',
    description: 'Installing, updating, and verifying software packages across macOS and Windows.',
    icon: 'Download',
    orderIndex: 3,
    isActive: true,
  },
  {
    id: 'help-cat-troubleshooting',
    name: 'Troubleshooting & Support',
    slug: 'troubleshooting',
    description: 'Common issues, diagnostic checklists, and contacting developer support.',
    icon: 'HelpCircle',
    orderIndex: 4,
    isActive: true,
  },
];

export const SYSTEM_HELP_ARTICLES: readonly Omit<HelpArticle, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'help-art-platform-overview',
    title: 'Welcome to ElseSourav: Platform Overview',
    slug: 'welcome-platform-overview',
    categoryId: 'help-cat-getting-started',
    excerpt: 'An introduction to ElseSourav software catalog, devlogs, and personal library.',
    content: `# Welcome to ElseSourav

ElseSourav is an independent developer and software platform publishing desktop tools, mobile utilities, web extensions, and open-source packages.

## Core Platform Capabilities:
- **Software Catalog**: Discover and download software created by developer Sourav.
- **Personal Library**: Bookmark applications and sync your software collection.
- **Developer Journal**: Read technical devlogs, architecture deep dives, and release notes.
- **Support Center**: Submit support tickets directly to the maintainer.`,
    status: 'published',
    orderIndex: 1,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
  {
    id: 'help-art-account-management',
    title: 'Managing Your Profile and Account Security',
    slug: 'managing-profile-and-security',
    categoryId: 'help-cat-account-security',
    excerpt: 'How to update your profile, change passwords, and permanently delete accounts.',
    content: `# Managing Your Account

You can manage your account settings at any time by navigating to [/settings](https://elsesourav.com/settings).

## Security Options:
- **Password Changes**: Update your password under the Security tab.
- **Email Verification**: Resend verification emails with automatic 60-second rate-limiting.
- **Account Deletion**: Under Danger Zone, you can permanently wipe all profile data and saved bookmarks.`,
    status: 'published',
    orderIndex: 2,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
];

/**
 * Isolated Development & Test Sample Data (NEVER seeded to production)
 */
export const SAMPLE_DEV_APPS: readonly Omit<App, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'app-sample-terminal-pro',
    name: 'Terminal Pro',
    slug: 'terminal-pro',
    shortDescription: 'High-speed GPU-accelerated terminal emulator for developers.',
    description: 'An extensible, tabbed terminal emulator built with Rust and WebGPU.',
    primaryCategory: 'cat-developer-tools',
    tags: ['tag-cli', 'tag-cross-platform'],
    status: 'published',
    platforms: ['macos', 'windows', 'linux'],
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    stats: {
      views: 12000,
      launches: 4500,
      libraryAdds: 890,
      ratingAverage: 4.9,
      ratingCount: 120,
    },
    screenshots: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800'],
    iconUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=128',
    links: [
      {
        id: 'link-1',
        appId: 'app-sample-terminal-pro',
        platform: 'macos',
        label: 'Download for macOS',
        url: 'https://github.com/elsesourav/releases/terminal-pro-1.0.0.dmg',
        action: 'download',
        isPrimary: true,
        displayOrder: 1,
        isActive: true,
      },
    ],
  },
];

export const SAMPLE_DEV_APP_VERSIONS: readonly Omit<AppVersion, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'ver-sample-terminal-pro-1-0-0',
    appId: 'app-sample-terminal-pro',
    version: '1.0.0',
    title: 'Terminal Pro v1.0.0',
    summary: 'Initial production release with WebGPU rendering and split panes.',
    releaseNotes: 'Initial production release with WebGPU rendering and split panes.',
    highlights: ['WebGPU accelerated', 'Split pane multiplexing'],
    releaseDate: 1724150400000,
    status: 'published',
    isCurrent: true,
    downloadUrl: 'https://github.com/elsesourav/releases/terminal-pro-1.0.0.dmg',
    fileSize: '35.4 MB',
  },
];

export const SAMPLE_DEV_BLOG_POSTS: readonly Omit<BlogPost, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'blog-sample-react-19-architecture',
    title: 'Architecting ElseSourav with React 19 and Firebase 12',
    slug: 'architecting-elsesourav-react-19',
    excerpt: 'Deep architectural dive into our zero-server frontend platform.',
    content: `# React 19 & Firebase 12 Architecture

ElseSourav is designed as a secure, high-performance static SPA powered by Firebase Web SDK 12 and Cloud Firestore.`,
    category: 'Developer Tools',
    categoryId: 'cat-developer-tools',
    tags: ['tag-react', 'tag-typescript'],
    status: 'published',
    isFeatured: true,
    authorId: 'user-sourav-creator',
    authorName: 'Sourav Mukherjee',
    publishedAt: 1724580000000,
    readingTimeMinutes: 6,
  },
];
