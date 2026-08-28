import type { User, App, SupportTicket, BlogPost } from '@elsesourav/types';

export const mockStandardUser: User = {
  id: 'usr-standard-1',
  supabaseAuthId: 'sb-standard-1',
  email: 'user@elsesourav.com',
  displayName: 'Regular User',
  role: 'USER',
  status: 'active',
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    reduceMotion: false,
    compactView: false,
  },
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const mockAdminUser: User = {
  id: 'usr-admin-1',
  supabaseAuthId: 'sb-admin-1',
  email: 'admin@elsesourav.com',
  displayName: 'Admin User',
  role: 'ADMIN',
  status: 'active',
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    reduceMotion: false,
    compactView: false,
  },
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const mockStaffUser: User = {
  id: 'usr-staff-1',
  supabaseAuthId: 'sb-staff-1',
  email: 'staff@elsesourav.com',
  displayName: 'Support Staff',
  role: 'STAFF',
  status: 'active',
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    reduceMotion: false,
    compactView: false,
  },
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const mockApp: App = {
  id: 'app-terminal-1',
  slug: 'terminal-pro',
  name: 'Terminal Pro',
  shortDescription: 'Hardware accelerated web terminal emulator',
  description: 'Full featured terminal emulator built for developers.',
  iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
  screenshots: [],
  primaryCategory: 'dev-tools',
  tags: ['cli', 'web'],
  status: 'published',
  platforms: ['web'],
  links: [
    {
      id: 'link-1',
      appId: 'app-terminal-1',
      platform: 'web',
      label: 'Launch Terminal',
      url: 'https://terminal.elsesourav.com',
      action: 'open_app',
      isPrimary: true,
      displayOrder: 0,
      isActive: true,
    },
  ],
  versions: [
    {
      id: 'ver-1',
      appId: 'app-terminal-1',
      version: '2.0.0',
      releaseDate: 1704067200000,
      changelog: 'Initial V2 release',
    },
  ],
  stats: {
    views: 1500,
    launches: 900,
    libraryAdds: 300,
    ratingAverage: 4.9,
    ratingCount: 45,
  },
  isFeatured: true,
  isPinned: false,
  sortOrder: 0,
  currentVersion: '2.0.0',
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const mockSupportTicket: SupportTicket = {
  id: 'ticket-1',
  ticketNumber: 'TICK-TEST-1234',
  userId: 'usr-standard-1',
  userEmail: 'user@elsesourav.com',
  userName: 'Regular User',
  subject: 'Cannot connect to web terminal',
  description: 'WebSocket connection fails on Safari browser.',
  category: 'Bug Report',
  priority: 'normal',
  status: 'open',
  lastMessageAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const mockBlogPost: BlogPost = {
  id: 'post-1',
  slug: 'v2-architecture-insights',
  title: 'ElseSourav V2 Architecture Deep Dive',
  excerpt: 'Explaining our migration to Turborepo and Next.js 15 App Router.',
  content: 'Full article content describing architecture decisions...',
  authorId: 'usr-admin-1',
  category: 'engineering',
  tags: ['nextjs', 'turborepo'],
  status: 'published',
  readingTimeMinutes: 6,
  viewsCount: 450,
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};
