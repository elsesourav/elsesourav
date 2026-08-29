import type { App, BlogPost, User, SupportTicket } from '@elsesourav/types';

/**
 * Edge Case Fixtures to rigorously test UI bounds, truncation, and international character safety.
 */

export const fixtureLongTextApp: App = {
  id: 'app-edge-long-text',
  slug: 'ultra-long-application-slug-that-tests-layout-boundary-and-horizontal-scroll-overflow-prevention',
  name: 'Ultra Long Application Name That Spans Multiple Lines on Mobile Devices and Tests Word Wrapping in CSS Grid Containers',
  shortDescription:
    'This is an exceptionally long shortDescription string crafted to test line-clamp-2 and line-clamp-3 CSS classes, ensuring that typography does not overflow outside of its containing card element across narrow viewports such as 320px and 375px screens.',
  description: `## Extensive Multi-Paragraph Description

This application contains multiple extensive paragraphs designed to test Markdown rendering, text wrapping, and whitespace handling.

### Subsection with Long Unbroken Strings
\`https://subdomain.elsesourav.com/deeply/nested/path/to/resource/with/very/long/query/parameters?session_id=1234567890abcdefghijklmnopqrstuvwxyz&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\`

### International Character & Emoji Support
- Japanese: ターミナル・プロ — 高速な開発環境
- German: Übergrößenmaßstab für Entwicklerwerkzeuge
- Bengali: ডেভেলপারদের জন্য উচ্চ ক্ষমতার ওয়েব টার্মিনাল
- Emojis: 🚀 ⚡ 🛡️ 🎨 ⏱️ 💻 🔥 📦 🌐 🔒`,
  iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/edge.png',
  screenshots: [],
  primaryCategory: 'Developer Tools',
  categoryId: 'cat-dev-tools',
  tags: ['cli', 'internationalization', 'long-tag-name-for-wrapping-test'],
  status: 'published',
  platforms: ['web', 'macos', 'linux', 'windows', 'chrome', 'android', 'ios'],
  links: [
    {
      id: 'link-edge-1',
      appId: 'app-edge-long-text',
      platform: 'web',
      label: 'Launch Exceptionally Long Link Label That Tests Button Padding',
      url: 'https://example.test/long-link-url',
      action: 'open_app',
      isPrimary: true,
      displayOrder: 1,
      isActive: true,
    },
  ],
  currentVersion: '10.99.1-alpha.beta.preview+build.20260829',
  stats: {
    views: 9999999,
    launches: 1000000,
    libraryAdds: 500000,
    ratingAverage: 5.0,
    ratingCount: 9999,
  },
  isFeatured: true,
  isPinned: true,
  sortOrder: 999,
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureZeroStatsApp: App = {
  id: 'app-edge-zero-stats',
  slug: 'zero-stats-tool',
  name: 'New Release Tool',
  shortDescription: 'Brand new application with zero launches, zero views, and no reviews yet.',
  description: 'Newly provisioned application testing default zero-state stat badges.',
  iconUrl: '',
  screenshots: [],
  primaryCategory: 'Productivity',
  categoryId: 'cat-productivity',
  tags: [],
  status: 'published',
  platforms: ['web'],
  links: [],
  stats: {
    views: 0,
    launches: 0,
    libraryAdds: 0,
    ratingAverage: 0,
    ratingCount: 0,
  },
  isFeatured: false,
  isPinned: false,
  sortOrder: 100,
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureUnicodeUser: User = {
  id: 'usr-edge-unicode',
  supabaseAuthId: 'sb-auth-unicode',
  email: 'unicode.dev@example.test',
  displayName: 'René François Müller 👨‍💻',
  username: 'rene_muller',
  bio: 'Specialist in UTF-8, bidirectional text (مرحبا بالعالم), and typographic ligatures.',
  role: 'USER',
  status: 'active',
  preferences: {
    theme: 'system',
    emailNotifications: true,
    reduceMotion: true,
    compactView: true,
    language: 'de',
  },
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureMultiTurnTicket: SupportTicket = {
  id: 'tick-edge-multiturn',
  ticketNumber: 'TICK-2026-9999',
  userId: 'usr-standard-1',
  userEmail: 'developer@example.test',
  userName: 'Alex Rivers',
  subject: 'Comprehensive WebSocket Diagnostics Protocol (12 Messages)',
  description: 'Long-running multi-turn support issue with extensive message history.',
  category: 'Technical Support',
  priority: 'high',
  status: 'open',
  messages: Array.from({ length: 12 }).map((_, i) => ({
    id: `tmsg-turn-${i + 1}`,
    ticketId: 'tick-edge-multiturn',
    senderUserId: i % 2 === 0 ? 'usr-standard-1' : 'usr-staff-1',
    senderEmail: i % 2 === 0 ? 'developer@example.test' : 'staff@example.test',
    senderName: i % 2 === 0 ? 'Alex Rivers' : 'Jordan Taylor',
    senderRole: i % 2 === 0 ? 'USER' : 'STAFF',
    message: `Message #${i + 1}: Diagnostic check round ${Math.floor(i / 2) + 1}. Observed frame latency of ${20 + i * 5}ms under simulated throttling.`,
    attachments: i === 5 ? ['https://res.cloudinary.com/elsesourav/image/upload/v2/debug/trace.json'] : [],
    isInternalNote: i === 7,
    createdAt: 1704067200000 + i * 300000,
  })),
  lastMessageAt: 1704067200000 + 11 * 300000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000 + 11 * 300000,
};
