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
    description: 'Platform overview, navigation guides, and first-time visitor walkthroughs.',
    icon: 'Sparkles',
    orderIndex: 1,
    isActive: true,
  },
  {
    id: 'help-cat-apps-discovery',
    name: 'Apps & Discovery',
    slug: 'apps-discovery',
    description: 'Searching the catalog, downloading binaries, changelogs, and personal library.',
    icon: 'Grid',
    orderIndex: 2,
    isActive: true,
  },
  {
    id: 'help-cat-account-security',
    name: 'Account & Security',
    slug: 'account-security',
    description: 'Registration, credential management, email verification, and privacy settings.',
    icon: 'Shield',
    orderIndex: 3,
    isActive: true,
  },
  {
    id: 'help-cat-troubleshooting',
    name: 'Support & Mobile',
    slug: 'troubleshooting',
    description: 'Direct support ticketing, message replies, PWA installation, and offline limits.',
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
    excerpt: 'An introduction to ElseSourav software catalog, devlogs, personal library, and direct support.',
    content: `# Welcome to ElseSourav

ElseSourav is an independent software publishing hub and developer journal created by software engineer Sourav.

## What You Can Do:
- **Discover Software**: Browse native desktop tools, terminal utilities, web extensions, and open-source packages.
- **Direct Downloads**: Download release binaries directly for macOS, Windows, and Linux.
- **Personal Library**: Save and organize applications to your personal cloud library.
- **Read Devlogs**: Follow technical architecture deep-dives and engineering devlogs.
- **Direct Support**: Open support tickets directly to the creator.`,
    status: 'published',
    orderIndex: 1,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
  {
    id: 'help-art-first-time-guide',
    title: 'First-Time Visitor Guide & Quick Start',
    slug: 'first-time-visitor-guide',
    categoryId: 'help-cat-getting-started',
    excerpt: 'Step-by-step walkthrough on browsing the catalog, searching for tools, and saving bookmarks.',
    content: `# First-Time Visitor Guide

Getting started with ElseSourav is simple:

### 1. Browse & Search
Navigate to the [Apps Catalog](/apps) to browse by categories or use the instant search bar to find tools by keyword, tag, or platform.

### 2. Inspect App Details
Click any application card to view complete release notes, platform requirements, verified download mirrors, and screenshot previews.

### 3. Create an Account (Optional)
Creating an account allows you to bookmark software to your [Personal Library](/library) and submit direct support tickets.`,
    status: 'published',
    orderIndex: 2,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
  {
    id: 'help-art-discovering-and-downloading',
    title: 'Finding Applications & Downloading Binaries',
    slug: 'finding-applications-and-downloads',
    categoryId: 'help-cat-apps-discovery',
    excerpt: 'Learn how to filter by platform, verify release changelogs, and download software safely.',
    content: `# Finding Apps & Downloading Releases

### Platform Badges
Each application displays compatible platform badges:
- **macOS**: DMG installers and Homebrew formulas.
- **Windows**: MSI installers and portable binaries.
- **Linux**: AppImage and deb packages.
- **Web / Chrome**: Browser extensions and online applications.

### Release Versions & Changelogs
Under the **Versions** tab on any app details page, you can review historical changelogs, release notes, and download specific previous versions.`,
    status: 'published',
    orderIndex: 1,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
  {
    id: 'help-art-managing-personal-library',
    title: 'Managing Your Personal Software Library',
    slug: 'managing-personal-library',
    categoryId: 'help-cat-apps-discovery',
    excerpt: 'Save applications to your account, organize your workflow, and synchronize bookmarks across devices.',
    content: `# Personal Software Library

The [Personal Library](/library) lets you collect and organize your favorite tools.

### How to Save an App:
1. Sign in to your ElseSourav account.
2. Click the **Bookmark** icon or **Add to Library** button on any application card.
3. Access your saved applications anytime at [/library](/library).

### Removing an App:
Click the bookmark icon again on the app card or remove it directly from your Library management view.`,
    status: 'published',
    orderIndex: 2,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
  {
    id: 'help-art-account-management',
    title: 'Account Registration, Security & Danger Zone',
    slug: 'managing-profile-and-security',
    categoryId: 'help-cat-account-security',
    excerpt: 'Manage your credentials, password reset, email verification, and permanent account deletion.',
    content: `# Account & Security Settings

Manage your account at [/settings](/settings).

### Security Features:
- **Email Verification**: Trigger verification emails with automatic 60-second rate-limiting cooldown.
- **Password Reset**: Send password reset links securely to your registered email.
- **Session Continuity**: Authentication sessions persist safely in your browser via IndexedDB.

### Danger Zone — Account Deletion:
Under **Settings $\to$ Danger Zone**, you can permanently delete your account, wiping all profile records and saved bookmarks in compliance with GDPR and CCPA.`,
    status: 'published',
    orderIndex: 1,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
  {
    id: 'help-art-customer-support',
    title: 'Submitting Support Tickets & Message Threading',
    slug: 'submitting-support-tickets',
    categoryId: 'help-cat-troubleshooting',
    excerpt: 'How to contact the developer, track ticket status, and receive message replies.',
    content: `# Customer Support

If you encounter a bug, have a feature request, or need help with a software package:

### 1. Open a Ticket
Navigate to [/support](/support) and click **Create Ticket**. Select the related application and describe your issue.

### 2. Message Threading
All responses appear in a clean conversation thread. You can post follow-up details and screenshots directly in the ticket.

### 3. Privacy
Support conversations are strictly confidential and visible only to you and the developer.`,
    status: 'published',
    orderIndex: 1,
    helpfulCount: 0,
    unhelpfulCount: 0,
  },
  {
    id: 'help-art-mobile-and-offline',
    title: 'Mobile Browsing, PWA Installation & Offline Behavior',
    slug: 'mobile-browsing-and-offline',
    categoryId: 'help-cat-troubleshooting',
    excerpt: 'Using ElseSourav on smartphones, adding to home screen, and offline limitations.',
    content: `# Mobile & Progressive Web App (PWA)

ElseSourav is fully responsive and optimized for mobile devices.

### Add to Home Screen (PWA):
1. In Safari (iOS) or Chrome (Android), tap the **Share / Options** menu.
2. Select **Add to Home Screen**.
3. Launch ElseSourav in full-screen standalone mode.

### Offline Limitations:
The application shell and previously viewed pages are cached for fast offline viewing. Downloading new software releases and submitting support tickets require an active internet connection.`,
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
