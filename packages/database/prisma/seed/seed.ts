import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

import { PublishStatus, TicketPriority, TicketStatus, UserRole, prisma } from '../../src/index';

async function main() {
  console.info('🌱 Seeding ElseSourav Database with rich realistic test records...');

  // ===========================================================================
  // 1. SEED USERS (Admin, Staff, and Community Members)
  // ===========================================================================
  console.info('  → Seeding Users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'elsesourav.auth@gmail.com' },
    update: { role: UserRole.ADMIN },
    create: {
      supabaseAuthId: '00000000-0000-0000-0000-000000000001',
      email: 'elsesourav.auth@gmail.com',
      displayName: 'Sourav (ElseSourav)',
      username: 'elsesourav',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      bio: 'Full-stack software architect, open-source enthusiast, creator of ElseSourav platform & developer utilities.',
      role: UserRole.ADMIN,
      preferences: { theme: 'dark', emailNotifications: true, reducedMotion: false },
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'alex.chen@elsesourav.com' },
    update: { role: UserRole.STAFF },
    create: {
      supabaseAuthId: '00000000-0000-0000-0000-000000000002',
      email: 'alex.chen@elsesourav.com',
      displayName: 'Alex Chen',
      username: 'alexchen',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      bio: 'Staff systems engineer & developer tooling advocate.',
      role: UserRole.STAFF,
      preferences: { theme: 'dark', emailNotifications: true },
    },
  });

  const userSarah = await prisma.user.upsert({
    where: { email: 'sarah.c@example.com' },
    update: {},
    create: {
      supabaseAuthId: '00000000-0000-0000-0000-000000000003',
      email: 'sarah.c@example.com',
      displayName: 'Sarah Connor',
      username: 'sarahconnor',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      bio: 'Frontend engineer specializing in React 19, WebGL, and design systems.',
      role: UserRole.USER,
      preferences: { theme: 'dark', emailNotifications: false },
    },
  });

  const userDavid = await prisma.user.upsert({
    where: { email: 'david.m@example.com' },
    update: {},
    create: {
      supabaseAuthId: '00000000-0000-0000-0000-000000000004',
      email: 'david.m@example.com',
      displayName: 'David Miller',
      username: 'davidm',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      bio: 'DevOps enthusiast and backend cloud infrastructure developer.',
      role: UserRole.USER,
      preferences: { theme: 'dark', emailNotifications: true },
    },
  });

  const userElena = await prisma.user.upsert({
    where: { email: 'elena.r@example.com' },
    update: {},
    create: {
      supabaseAuthId: '00000000-0000-0000-0000-000000000005',
      email: 'elena.r@example.com',
      displayName: 'Elena Rostova',
      username: 'elenar',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      bio: 'Product designer & creative coder passionate about typography and UI accessibility.',
      role: UserRole.USER,
      preferences: { theme: 'dark', emailNotifications: true },
    },
  });

  // ===========================================================================
  // 2. SEED CATEGORIES (App Catalog)
  // ===========================================================================
  console.info('  → Seeding App Categories...');

  const catDevTools = await prisma.category.upsert({
    where: { slug: 'dev-tools' },
    update: {},
    create: {
      name: 'Developer Tools',
      slug: 'dev-tools',
      description: 'Terminal emulators, debugging tools, and system utilities for engineers.',
      icon: 'Terminal',
      orderIndex: 0,
    },
  });

  const catProductivity = await prisma.category.upsert({
    where: { slug: 'productivity' },
    update: {},
    create: {
      name: 'Productivity',
      slug: 'productivity',
      description: 'Focus timers, workflow management, and distraction reduction utilities.',
      icon: 'Clock',
      orderIndex: 1,
    },
  });

  const catDesign = await prisma.category.upsert({
    where: { slug: 'media-design' },
    update: {},
    create: {
      name: 'Media & Design',
      slug: 'media-design',
      description: 'Color palettes, contrast checkers, SVG generators, and creative tooling.',
      icon: 'Palette',
      orderIndex: 2,
    },
  });

  const catDevOps = await prisma.category.upsert({
    where: { slug: 'cloud-devops' },
    update: {},
    create: {
      name: 'Cloud & DevOps',
      slug: 'cloud-devops',
      description: 'Container orchestration, network probes, and cloud automation utilities.',
      icon: 'Cloud',
      orderIndex: 3,
    },
  });

  const catUtilities = await prisma.category.upsert({
    where: { slug: 'utilities' },
    update: {},
    create: {
      name: 'System Utilities',
      slug: 'utilities',
      description: 'Regex evaluators, JSON formatters, text transforms, and encoding helpers.',
      icon: 'Wrench',
      orderIndex: 4,
    },
  });

  // ===========================================================================
  // 3. SEED TAGS
  // ===========================================================================
  console.info('  → Seeding App Tags...');

  const tagCLI = await prisma.tag.upsert({
    where: { slug: 'cli' },
    update: {},
    create: { name: 'CLI', slug: 'cli' },
  });
  const tagWeb = await prisma.tag.upsert({
    where: { slug: 'web' },
    update: {},
    create: { name: 'Web', slug: 'web' },
  });
  const tagReact = await prisma.tag.upsert({
    where: { slug: 'react' },
    update: {},
    create: { name: 'React 19', slug: 'react' },
  });
  const tagTypeScript = await prisma.tag.upsert({
    where: { slug: 'typescript' },
    update: {},
    create: { name: 'TypeScript', slug: 'typescript' },
  });
  const tagOpenSource = await prisma.tag.upsert({
    where: { slug: 'open-source' },
    update: {},
    create: { name: 'Open Source', slug: 'open-source' },
  });
  const tagCloud = await prisma.tag.upsert({
    where: { slug: 'cloud' },
    update: {},
    create: { name: 'Cloud', slug: 'cloud' },
  });

  // ===========================================================================
  // 4. SEED APPS (With links, versions, stats, and tags)
  // ===========================================================================
  console.info('  → Seeding Applications...');

  // App 1: Terminal Pro
  const appTerminal = await prisma.app.upsert({
    where: { slug: 'terminal-pro' },
    update: {},
    create: {
      name: 'Terminal Pro',
      slug: 'terminal-pro',
      shortDescription: 'Hardware-accelerated web terminal emulator with multiplexing.',
      description:
        'A cutting-edge WebGL-powered terminal emulator supporting split panes, custom themes, SSH tunnels, and lightning-fast rendering.',
      iconUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&q=80',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80',
      demoUrl: 'https://terminal.elsesourav.com',
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      isPinned: true,
      currentVersion: '2.1.0',
      seoTitle: 'Terminal Pro — Fast WebGL Terminal Emulator | ElseSourav',
      seoDescription:
        'High performance browser-based terminal emulator with split multiplexing and custom themes.',
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      categoryId: catDevTools.id,
      tags: {
        create: [{ tagId: tagCLI.id }, { tagId: tagWeb.id }, { tagId: tagTypeScript.id }],
      },
      links: {
        create: [
          {
            platform: 'web',
            label: 'Launch Terminal',
            url: 'https://terminal.elsesourav.com',
            action: 'open_app',
            isPrimary: true,
            displayOrder: 0,
          },
          {
            platform: 'github',
            label: 'GitHub Repository',
            url: 'https://github.com/elsesourav/terminal-pro',
            action: 'view_source',
            isPrimary: false,
            displayOrder: 1,
          },
        ],
      },
      versions: {
        create: [
          {
            version: '2.1.0',
            changelog:
              'Upgraded to Next.js 15, WebGL 2.0 rendering engine, and dynamic tab splits.',
          },
          {
            version: '2.0.0',
            changelog:
              'Complete architecture redesign with TypeScript and zero-latency WebSocket stream.',
          },
        ],
      },
      stats: {
        create: {
          views: 4250,
          launches: 3120,
          libraryAdds: 890,
          ratingAverage: 4.95,
          ratingCount: 88,
        },
      },
    },
  });

  // App 2: Palette Studio
  const appPalette = await prisma.app.upsert({
    where: { slug: 'palette-studio' },
    update: {},
    create: {
      name: 'Palette Studio',
      slug: 'palette-studio',
      shortDescription: 'Professional color palette generator and WCAG contrast analyzer.',
      description:
        'Generate harmonious color systems, test WCAG 2.1 AA/AAA accessibility contrast in real-time, and export directly to Tailwind CSS and CSS variables.',
      iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
      demoUrl: 'https://palette.elsesourav.com',
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      isPinned: false,
      currentVersion: '1.4.0',
      seoTitle: 'Palette Studio — Accessible Color System Generator | ElseSourav',
      seoDescription:
        'Generate accessible color palettes, check WCAG contrast, and export tokens for Tailwind and Figma.',
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      categoryId: catDesign.id,
      tags: {
        create: [{ tagId: tagWeb.id }, { tagId: tagReact.id }, { tagId: tagOpenSource.id }],
      },
      links: {
        create: [
          {
            platform: 'web',
            label: 'Open Palette Studio',
            url: 'https://palette.elsesourav.com',
            action: 'open_app',
            isPrimary: true,
            displayOrder: 0,
          },
          {
            platform: 'github',
            label: 'Source Code',
            url: 'https://github.com/elsesourav/palette-studio',
            action: 'view_source',
            isPrimary: false,
            displayOrder: 1,
          },
        ],
      },
      versions: {
        create: [
          {
            version: '1.4.0',
            changelog:
              'Added OKLCH color space support and automatic dark mode counterpart generation.',
          },
          {
            version: '1.0.0',
            changelog: 'Initial release with HSL/Hex color generator and WCAG AA contrast matrix.',
          },
        ],
      },
      stats: {
        create: {
          views: 3100,
          launches: 2450,
          libraryAdds: 610,
          ratingAverage: 4.88,
          ratingCount: 52,
        },
      },
    },
  });

  // App 3: FocusFlow
  const appFocus = await prisma.app.upsert({
    where: { slug: 'focusflow' },
    update: {},
    create: {
      name: 'FocusFlow',
      slug: 'focusflow',
      shortDescription: 'Adaptive Pomodoro focus timer with deep git commit telemetry.',
      description:
        'Stay in the zone with smart interval timing, ambient soundscapes, task sprint tracking, and GitHub commit streak integrations.',
      iconUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&q=80',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
      demoUrl: 'https://focus.elsesourav.com',
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      isPinned: false,
      currentVersion: '1.2.0',
      seoTitle: 'FocusFlow — Smart Developer Focus Timer | ElseSourav',
      seoDescription:
        'Productivity timer designed for engineers with distraction blocking and task telemetry.',
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      categoryId: catProductivity.id,
      tags: {
        create: [{ tagId: tagWeb.id }, { tagId: tagReact.id }],
      },
      links: {
        create: [
          {
            platform: 'web',
            label: 'Launch Timer',
            url: 'https://focus.elsesourav.com',
            action: 'open_app',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      versions: {
        create: [
          {
            version: '1.2.0',
            changelog: 'Offline PWA support and customizable ambient audio tracks.',
          },
        ],
      },
      stats: {
        create: {
          views: 1890,
          launches: 1420,
          libraryAdds: 410,
          ratingAverage: 4.75,
          ratingCount: 39,
        },
      },
    },
  });

  // App 4: DevDock
  const appDevDock = await prisma.app.upsert({
    where: { slug: 'devdock' },
    update: {},
    create: {
      name: 'DevDock',
      slug: 'devdock',
      shortDescription: 'Local container & microservice orchestrator for development.',
      description:
        'Manage Docker containers, PostgreSQL databases, and local server instances from a single unified web dashboard.',
      iconUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=200&q=80',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&q=80',
      demoUrl: 'https://devdock.elsesourav.com',
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      isPinned: false,
      currentVersion: '3.0.0',
      seoTitle: 'DevDock — Container Orchestrator Dashboard | ElseSourav',
      seoDescription: 'Manage local Docker containers and microservices from a clean web UI.',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      categoryId: catDevOps.id,
      tags: {
        create: [{ tagId: tagCloud.id }, { tagId: tagCLI.id }, { tagId: tagTypeScript.id }],
      },
      links: {
        create: [
          {
            platform: 'web',
            label: 'Open DevDock',
            url: 'https://devdock.elsesourav.com',
            action: 'open_app',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      versions: {
        create: [
          {
            version: '3.0.0',
            changelog: 'Docker compose multi-project manager and live container log streaming.',
          },
        ],
      },
      stats: {
        create: {
          views: 2780,
          launches: 1950,
          libraryAdds: 530,
          ratingAverage: 4.92,
          ratingCount: 64,
        },
      },
    },
  });

  // App 5: RegexLens
  const appRegexLens = await prisma.app.upsert({
    where: { slug: 'regexlens' },
    update: {},
    create: {
      name: 'RegexLens',
      slug: 'regexlens',
      shortDescription: 'Visual regular expression debugger and syntax tree analyzer.',
      description:
        'Break down complex regular expressions into understandable visual state machines with real-time match highlighting and unit tests.',
      iconUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&q=80',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
      demoUrl: 'https://regex.elsesourav.com',
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      isPinned: false,
      currentVersion: '1.1.0',
      seoTitle: 'RegexLens — Visual Regex Debugger | ElseSourav',
      seoDescription: 'Interactive regular expression visualizer and live test suite generator.',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      categoryId: catUtilities.id,
      tags: {
        create: [{ tagId: tagWeb.id }, { tagId: tagTypeScript.id }, { tagId: tagOpenSource.id }],
      },
      links: {
        create: [
          {
            platform: 'web',
            label: 'Test Regex',
            url: 'https://regex.elsesourav.com',
            action: 'open_app',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      versions: {
        create: [
          {
            version: '1.1.0',
            changelog: 'Added ECMAScript 2024 named capture group visualization.',
          },
        ],
      },
      stats: {
        create: {
          views: 1650,
          launches: 1100,
          libraryAdds: 320,
          ratingAverage: 4.82,
          ratingCount: 28,
        },
      },
    },
  });

  // ===========================================================================
  // 5. SEED BLOG (Categories, Tags, and Posts)
  // ===========================================================================
  console.info('  → Seeding Blog Categories & Posts...');

  const blogCatEng = await prisma.blogCategory.upsert({
    where: { slug: 'engineering' },
    update: {},
    create: {
      name: 'Engineering',
      slug: 'engineering',
      description: 'Technical deep-dives and systems architecture.',
    },
  });

  const blogCatArch = await prisma.blogCategory.upsert({
    where: { slug: 'architecture' },
    update: {},
    create: {
      name: 'Architecture',
      slug: 'architecture',
      description: 'Scalable system design and software patterns.',
    },
  });

  const blogCatRel = await prisma.blogCategory.upsert({
    where: { slug: 'releases' },
    update: {},
    create: {
      name: 'Product Releases',
      slug: 'releases',
      description: 'Platform updates and major milestone releases.',
    },
  });

  const blogTagNext = await prisma.blogTag.upsert({
    where: { slug: 'nextjs-15' },
    update: {},
    create: { name: 'Next.js 15', slug: 'nextjs-15' },
  });
  const tagPostgres = await prisma.blogTag.upsert({
    where: { slug: 'postgresql' },
    update: {},
    create: { name: 'PostgreSQL', slug: 'postgresql' },
  });
  const tagSysDesign = await prisma.blogTag.upsert({
    where: { slug: 'system-design' },
    update: {},
    create: { name: 'System Design', slug: 'system-design' },
  });
  const tagSec = await prisma.blogTag.upsert({
    where: { slug: 'security' },
    update: {},
    create: { name: 'Security', slug: 'security' },
  });

  // Post 1
  await prisma.blogPost.upsert({
    where: { slug: 'architecting-elsesourav-nextjs-postgresql' },
    update: {},
    create: {
      title: 'Architecting ElseSourav with Next.js 15 App Router & PostgreSQL',
      slug: 'architecting-elsesourav-nextjs-postgresql',
      excerpt:
        'A comprehensive architectural journey building a high-performance Next.js 15 monorepo backed by PostgreSQL and Prisma.',
      content: `## The Modern Platform Architecture

As the ElseSourav platform expanded to host richer developer tools, our architecture prioritized initial load times, granular SEO indexing, and relational data integrity.

### Key Architectural Pillars
1. **Next.js 15 Server Components**: Rendering data close to PostgreSQL and minimizing client bundle overhead.
2. **PostgreSQL & Prisma ORM**: Strict typing, foreign key constraints, and transactional consistency.
3. **Turborepo & pnpm Workspaces**: Clean separation of domain packages with zero circular dependencies.

\`\`\`typescript
// Clean Layered Execution Flow
Client UI -> Server Actions -> Domain Services -> Repositories -> Prisma
\`\`\`

The result is a lightning-fast ecosystem that boots in under 100ms with full WCAG AA compliance.`,
      coverImageUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
      status: PublishStatus.PUBLISHED,
      readingTime: 6,
      viewsCount: 1420,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      authorId: adminUser.id,
      categoryId: blogCatArch.id,
      tags: {
        create: [{ tagId: blogTagNext.id }, { tagId: tagPostgres.id }, { tagId: tagSysDesign.id }],
      },
    },
  });

  // Post 2
  await prisma.blogPost.upsert({
    where: { slug: 'zero-trust-multi-tenant-security-patterns' },
    update: {},
    create: {
      title: 'Designing for Zero-Trust: Multi-Tenant RBAC & IDOR Defense Patterns',
      slug: 'zero-trust-multi-tenant-security-patterns',
      excerpt:
        'How we implemented server-side authorization boundaries, input sanitization, and cryptographic token verification.',
      content: `## Defense-in-Depth on the Web

Authentication verifies who you are; authorization verifies what you are allowed to touch.

### Core Defenses Implemented:
- **Server Action Authorization**: Every mutation independently verifies user identity and resource ownership.
- **Internal Note Redaction**: Support ticket internal messages are filtered before non-staff clients receive data.
- **Signed Cloudinary Uploads**: Direct client binary uploads are constrained to namespaced paths.

\`\`\`typescript
const isOwner = ticket.userId === session.userId;
if (!isOwner && !isAdmin) {
  throw AppError.forbidden('Access denied.');
}
\`\`\``,
      coverImageUrl:
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80',
      status: PublishStatus.PUBLISHED,
      readingTime: 5,
      viewsCount: 980,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      authorId: adminUser.id,
      categoryId: blogCatEng.id,
      tags: { create: [{ tagId: tagSec.id }, { tagId: tagSysDesign.id }] },
    },
  });

  // Post 3
  await prisma.blogPost.upsert({
    where: { slug: 'building-accessible-design-tokens-with-tailwind' },
    update: {},
    create: {
      title: 'Building Accessible Design Systems: WCAG 2.1 AA Tokens with Tailwind',
      slug: 'building-accessible-design-tokens-with-tailwind',
      excerpt:
        'Creating a cohesive dark-mode design system with 25 reusable primitives, glassmorphism, and keyboard navigation.',
      content: `## Accessibility is Not an Afterthought

Building a world-class user interface requires balancing modern aesthetics (like glassmorphism and subtle borders) with high contrast and assistive navigation.

### Guidelines for Design Tokens:
- **Contrast Ratios**: Body text exceeding 7:1 ratio on deep zinc backgrounds.
- **Focus Rings**: High-visibility \`ring-2 ring-indigo-500\` with contrast offsets.
- **Reduced Motion**: Respecting \`prefers-reduced-motion\` for transition smoothness.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80',
      status: PublishStatus.PUBLISHED,
      readingTime: 4,
      viewsCount: 840,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      authorId: staffUser.id,
      categoryId: blogCatRel.id,
      tags: { create: [{ tagId: blogTagNext.id }, { tagId: tagSysDesign.id }] },
    },
  });

  // ===========================================================================
  // 6. SEED HELP CENTER (Categories & Technical Articles)
  // ===========================================================================
  console.info('  → Seeding Help Documentation...');

  const helpCatStart = await prisma.helpCategory.upsert({
    where: { slug: 'getting-started' },
    update: {},
    create: {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Quick start guides, discovery features, and ecosystem fundamentals.',
      icon: 'Rocket',
      orderIndex: 0,
    },
  });

  const helpCatAuth = await prisma.helpCategory.upsert({
    where: { slug: 'account-security' },
    update: {},
    create: {
      name: 'Account & Security',
      slug: 'account-security',
      description: 'Profiles, OAuth connections, security settings, and data privacy.',
      icon: 'Shield',
      orderIndex: 1,
    },
  });

  const helpCatTools = await prisma.helpCategory.upsert({
    where: { slug: 'developer-tools' },
    update: {},
    create: {
      name: 'Developer Tools & Workflows',
      slug: 'developer-tools',
      description: 'CLI integrations, keyboard shortcuts, and launchpad bookmarking.',
      icon: 'Cpu',
      orderIndex: 2,
    },
  });

  // Help Article 1
  await prisma.helpArticle.upsert({
    where: { slug: 'intro-to-ecosystem' },
    update: {},
    create: {
      categoryId: helpCatStart.id,
      title: 'Introduction to ElseSourav Tools',
      slug: 'intro-to-ecosystem',
      excerpt: 'Learn how to discover, launch, and bookmark developer utilities on ElseSourav.',
      content: `# Getting Started with ElseSourav

ElseSourav is a unified software hub designed to empower engineers, designers, and creators with web-native productivity utilities.

## Discovering Applications
1. Visit the **Apps Catalog** at \`/apps\`.
2. Use the interactive search bar or filter by category (Developer Tools, Productivity, Media & Design).
3. Click any application card to inspect technical specifications, version history, and launch options.

## Bookmarking to Personal Library
Click **Save to Library** on any application to pin it to your personal dashboard launchpad for instant access.`,
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date(),
      orderIndex: 0,
      helpfulCount: 48,
      unhelpfulCount: 1,
      authorId: adminUser.id,
    },
  });

  // Help Article 2
  await prisma.helpArticle.upsert({
    where: { slug: 'managing-personal-library' },
    update: {},
    create: {
      categoryId: helpCatTools.id,
      title: 'Managing Your Personal App Library & Launchpad',
      slug: 'managing-personal-library',
      excerpt: 'Organize your favorite utilities, pin daily tools, and launch apps in one click.',
      content: `# Personal Library & Launchpad

Your Library (\`/library\`) is your customizable command center for all saved applications.

## Key Features
- **One-Click Launch**: Open live tools in standalone windows or tabs.
- **Favorites & Pinning**: Keep critical daily tools at the top of your grid.
- **Offline Availability**: PWA-enabled tools remain functional even without an internet connection.`,
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date(),
      orderIndex: 1,
      helpfulCount: 32,
      unhelpfulCount: 0,
      authorId: staffUser.id,
    },
  });

  // Help Article 3
  await prisma.helpArticle.upsert({
    where: { slug: 'account-security-data-privacy' },
    update: {},
    create: {
      categoryId: helpCatAuth.id,
      title: 'Account Security & Data Privacy Guidelines',
      slug: 'account-security-data-privacy',
      excerpt: 'How your identity is protected with Supabase Auth and cryptographic sessions.',
      content: `# Account Security & Privacy

We treat security and data ownership as core principles.

## How Your Data Is Stored
- Authentication is handled exclusively by **Supabase Auth**. We do not store raw password hashes on our application server.
- Session tokens are stored in secure \`HttpOnly\` cookies with \`SameSite=Lax\` attributes.
- You can request full account data deletion at any time from **Settings -> Danger Zone**.`,
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date(),
      orderIndex: 2,
      helpfulCount: 29,
      unhelpfulCount: 0,
      authorId: adminUser.id,
    },
  });

  // ===========================================================================
  // 7. SEED SUPPORT TICKETS & MESSAGES
  // ===========================================================================
  console.info('  → Seeding Support Tickets & Messages...');

  // Ticket 1: Active In-Progress
  const ticket1 = await prisma.supportTicket.upsert({
    where: { ticketNumber: 'TK-2026-001' },
    update: {},
    create: {
      ticketNumber: 'TK-2026-001',
      userId: userSarah.id,
      subject: 'WebGL terminal rendering artifact on high-DPI display',
      description:
        'When running Terminal Pro on a 4K display with fractional scaling, character borders sometimes blur on split panes.',
      category: 'bug',
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      messages: {
        create: [
          {
            senderUserId: userSarah.id,
            senderRole: UserRole.USER,
            message:
              'Hi team, I noticed fractional scaling on Linux causes text blurring in the Terminal Pro split view.',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            senderUserId: staffUser.id,
            senderRole: UserRole.STAFF,
            message:
              'Thank you for reporting this Sarah! We reproduced this on Wayland with 125% scaling. A canvas pixel ratio fix is currently in testing.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            senderUserId: adminUser.id,
            senderRole: UserRole.ADMIN,
            message:
              'Internal Note: PR #42 patches this with window.devicePixelRatio listener. Will deploy in v2.1.1.',
            isInternalNote: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Ticket 2: Resolved
  await prisma.supportTicket.upsert({
    where: { ticketNumber: 'TK-2026-002' },
    update: {},
    create: {
      ticketNumber: 'TK-2026-002',
      userId: userDavid.id,
      subject: 'Request for custom SVG export format in Palette Studio',
      description: 'Would it be possible to add direct SVG swatch export for Figma imports?',
      category: 'feature_request',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      messages: {
        create: [
          {
            senderUserId: userDavid.id,
            senderRole: UserRole.USER,
            message: 'Would love an SVG export option alongside CSS variables.',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            senderUserId: staffUser.id,
            senderRole: UserRole.STAFF,
            message:
              'Good news David! We added SVG export in Palette Studio v1.4.0. You can now copy or download raw SVG swatches directly.',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Ticket 3: New Open Ticket
  await prisma.supportTicket.upsert({
    where: { ticketNumber: 'TK-2026-003' },
    update: {},
    create: {
      ticketNumber: 'TK-2026-003',
      userId: userElena.id,
      subject: 'Dark mode contrast verification question',
      description:
        'Are all color palettes generated in Palette Studio guaranteed to meet WCAG AAA contrast?',
      category: 'general',
      priority: TicketPriority.LOW,
      status: TicketStatus.OPEN,
      createdAt: new Date(),
      messages: {
        create: [
          {
            senderUserId: userElena.id,
            senderRole: UserRole.USER,
            message:
              'Hello! I wanted to confirm if the contrast matrix checks both light and dark backgrounds automatically.',
            createdAt: new Date(),
          },
        ],
      },
    },
  });

  // ===========================================================================
  // 8. SEED USER LIBRARY (Bookmarks)
  // ===========================================================================
  console.info('  → Seeding User Library Bookmarks...');

  await prisma.userLibraryItem.upsert({
    where: { userId_appId: { userId: userSarah.id, appId: appTerminal.id } },
    update: {},
    create: { userId: userSarah.id, appId: appTerminal.id, isFavorite: true, isPinned: true },
  });

  await prisma.userLibraryItem.upsert({
    where: { userId_appId: { userId: userSarah.id, appId: appPalette.id } },
    update: {},
    create: { userId: userSarah.id, appId: appPalette.id, isFavorite: true, isPinned: false },
  });

  await prisma.userLibraryItem.upsert({
    where: { userId_appId: { userId: userDavid.id, appId: appDevDock.id } },
    update: {},
    create: { userId: userDavid.id, appId: appDevDock.id, isFavorite: true, isPinned: true },
  });

  await prisma.userLibraryItem.upsert({
    where: { userId_appId: { userId: userDavid.id, appId: appTerminal.id } },
    update: {},
    create: { userId: userDavid.id, appId: appTerminal.id, isFavorite: false, isPinned: false },
  });

  await prisma.userLibraryItem.upsert({
    where: { userId_appId: { userId: userElena.id, appId: appFocus.id } },
    update: {},
    create: { userId: userElena.id, appId: appFocus.id, isFavorite: true, isPinned: true },
  });

  await prisma.userLibraryItem.upsert({
    where: { userId_appId: { userId: userElena.id, appId: appRegexLens.id } },
    update: {},
    create: { userId: userElena.id, appId: appRegexLens.id, isFavorite: false, isPinned: false },
  });

  // ===========================================================================
  // 9. SEED NOTIFICATIONS
  // ===========================================================================
  console.info('  → Seeding User Notifications...');

  await prisma.notification.createMany({
    data: [
      {
        userId: userSarah.id,
        type: 'support_update',
        title: 'Support Ticket TK-2026-001 Updated',
        message: 'Alex Chen replied to your ticket regarding WebGL terminal scaling.',
        linkUrl: `/support/tickets/${ticket1.id}`,
        isRead: false,
      },
      {
        userId: userSarah.id,
        type: 'system_announcement',
        title: 'Welcome to ElseSourav!',
        message: 'Explore your new developer launchpad and personal library.',
        linkUrl: '/library',
        isRead: true,
      },
      {
        userId: userDavid.id,
        type: 'app_update',
        title: 'DevDock v3.0.0 is Live',
        message: 'New container log streaming and docker compose management are now available.',
        linkUrl: '/apps/devdock',
        isRead: false,
      },
      {
        userId: userElena.id,
        type: 'feature_release',
        title: 'Palette Studio OKLCH Update',
        message: 'Export accessible color systems directly to CSS variables and Figma.',
        linkUrl: '/apps/palette-studio',
        isRead: true,
      },
    ],
    skipDuplicates: true,
  });

  // ===========================================================================
  // 10. SEED APP FEEDBACK & AUDIT LOGS
  // ===========================================================================
  console.info('  → Seeding App Feedback & Audit Logs...');

  await prisma.appFeedback.createMany({
    data: [
      {
        userId: userSarah.id,
        appId: appTerminal.id,
        rating: 5,
        message: 'Phenomenal web terminal. The WebGL rendering is butter smooth!',
        status: 'approved',
      },
      {
        userId: userDavid.id,
        appId: appDevDock.id,
        rating: 5,
        message: 'Saved me hours managing local microservices.',
        status: 'approved',
      },
      {
        userId: userElena.id,
        appId: appPalette.id,
        rating: 5,
        message: 'The contrast checker makes WCAG AA compliance effortless.',
        status: 'approved',
      },
      {
        userId: userSarah.id,
        appId: appFocus.id,
        rating: 4,
        message: 'Great timer! Would love integrations with Spotify.',
        status: 'approved',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'APP_PUBLISHED',
        entityType: 'App',
        entityId: appTerminal.id,
        details: { appName: 'Terminal Pro', version: '2.1.0' },
        ipAddress: '127.0.0.1',
      },
      {
        userId: adminUser.id,
        action: 'USER_ROLE_UPDATED',
        entityType: 'User',
        entityId: staffUser.id,
        details: { targetUser: 'Alex Chen', previousRole: 'USER', newRole: 'STAFF' },
        ipAddress: '127.0.0.1',
      },
      {
        userId: staffUser.id,
        action: 'HELP_ARTICLE_PUBLISHED',
        entityType: 'HelpArticle',
        entityId: 'intro-to-ecosystem',
        details: { title: 'Introduction to ElseSourav Tools' },
        ipAddress: '127.0.0.1',
      },
      {
        userId: adminUser.id,
        action: 'SECURITY_AUDIT_COMPLETED',
        entityType: 'System',
        entityId: 'v2-rc',
        details: { status: 'PASS', score: '100%' },
        ipAddress: '127.0.0.1',
      },
    ],
    skipDuplicates: true,
  });

  console.info('===========================================================');
  console.info('✅ Successfully seeded ElseSourav database!');
  console.info('  • Users: 5 (1 Admin, 1 Staff, 3 Users)');
  console.info('  • Categories: 5 App Categories, 3 Blog Categories, 3 Help Categories');
  console.info('  • Tags: 6 App Tags, 4 Blog Tags');
  console.info(
    '  • Applications: 5 Full Dev Tools (Terminal Pro, Palette Studio, FocusFlow, DevDock, RegexLens)'
  );
  console.info('  • Blog Posts: 3 Comprehensive Technical Articles');
  console.info('  • Help Guides: 3 Structured Documentation Guides');
  console.info('  • Support Tickets: 3 Tickets with full message threads and internal notes');
  console.info('  • User Library: 6 Saved App Bookmarks');
  console.info('  • Notifications: 4 Notification entries');
  console.info('  • App Feedback: 4 Reviews with ratings');
  console.info('  • Audit Logs: 4 Security and administration audit entries');
  console.info('===========================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seed execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
