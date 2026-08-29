import type { HelpCategory, HelpArticle } from '@elsesourav/types';

export const fixtureHelpCategories: readonly HelpCategory[] = [
  {
    id: 'hcat-getting-started',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Learn the fundamentals of the ElseSourav ecosystem and developer workspace.',
    icon: 'compass',
    orderIndex: 1,
    articleCount: 1,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'hcat-account-security',
    name: 'Account & Security',
    slug: 'account-and-security',
    description: 'Manage your sessions, personal library, theme preferences, and access tokens.',
    icon: 'shield',
    orderIndex: 2,
    articleCount: 1,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'hcat-troubleshooting',
    name: 'Troubleshooting & Support',
    slug: 'troubleshooting-and-support',
    description:
      'Diagnostic guides for browser extensions, WebSocket proxy connections, and tickets.',
    icon: 'wrench',
    orderIndex: 3,
    articleCount: 1,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
];

export const fixtureHelpArticleGettingStarted: HelpArticle = {
  id: 'hart-getting-started',
  categoryId: 'hcat-getting-started',
  category: fixtureHelpCategories[0],
  title: 'Getting Started with the ElseSourav Developer Ecosystem',
  slug: 'getting-started-with-the-elsesourav-ecosystem',
  excerpt:
    'A guided walkthrough for browsing developer tools, saving applications to your personal launchpad, and configuring your dark mode workspace.',
  content: `## Welcome to ElseSourav

The ElseSourav ecosystem provides high-performance developer utilities directly in your browser and native terminal environments.

### 1. Exploring the Catalog
Visit the [Apps Catalog](/apps) to filter utilities by category, operating system platform, or tag.

### 2. Personal Launchpad
Bookmark tools to your [Personal Library](/library) for instantaneous 1-click execution. Pinned applications appear prominently at the top of your dashboard.

### Quick Start Code Snippet
\`\`\`bash
# Install CLI tools directly via homebrew or npm
npx @elsesourav/cli launch terminal-pro
\`\`\`

> Note: All applications operate locally with zero background tracking.`,
  status: 'published',
  orderIndex: 1,
  helpfulCount: 68,
  unhelpfulCount: 2,
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureHelpArticleSecurity: HelpArticle = {
  id: 'hart-account-security',
  categoryId: 'hcat-account-security',
  category: fixtureHelpCategories[1],
  title: 'Managing Account Security and Session Preferences',
  slug: 'managing-account-security-and-session-preferences',
  excerpt:
    'How to customize your public developer profile, manage theme and motion settings, and control account data retention.',
  content: `## User Preferences & Customization

Under **Account Settings**, you can configure:
- **Appearance**: Dark Mode, Light Mode, or System automatic sync.
- **Accessibility**: Reduce motion animations and compact views for density.
- **Notifications**: Configure email and in-app system alerts.`,
  status: 'published',
  orderIndex: 1,
  helpfulCount: 34,
  unhelpfulCount: 0,
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureHelpArticleTroubleshooting: HelpArticle = {
  id: 'hart-troubleshooting',
  categoryId: 'hcat-troubleshooting',
  category: fixtureHelpCategories[2],
  title: 'Troubleshooting Terminal WebSocket Connections and Browser Permissions',
  slug: 'troubleshooting-terminal-websocket-connections',
  excerpt:
    'Diagnostic checklist for resolving browser security sandbox restrictions and WebSocket proxy disconnects.',
  content: `## Diagnosing Connection Drops

If Terminal Pro fails to initialize:
1. Verify browser supports WebSockets over WSS.
2. Disable aggressive ad-blockers that intercept local port multiplexers.
3. If issues persist, submit a priority issue to our **Support Desk**.`,
  status: 'published',
  orderIndex: 1,
  helpfulCount: 45,
  unhelpfulCount: 3,
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureHelpArticles: readonly HelpArticle[] = [
  fixtureHelpArticleGettingStarted,
  fixtureHelpArticleSecurity,
  fixtureHelpArticleTroubleshooting,
];
