import { PrismaClient, PublishStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting ElseSourav V2 Database Seed...');

  // 1. Seed Categories
  const devTools = await prisma.category.upsert({
    where: { slug: 'dev-tools' },
    update: {},
    create: {
      name: 'Developer Tools',
      slug: 'dev-tools',
      description: 'Productivity and system utilities for software engineers',
      icon: 'Terminal',
      orderIndex: 0,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'productivity' },
    update: {},
    create: {
      name: 'Productivity',
      slug: 'productivity',
      description: 'Focus, time management, and workflow utilities',
      icon: 'Clock',
      orderIndex: 1,
    },
  });

  // 2. Seed Tags
  const cliTag = await prisma.tag.upsert({
    where: { slug: 'cli' },
    update: {},
    create: { name: 'CLI', slug: 'cli' },
  });

  const webTag = await prisma.tag.upsert({
    where: { slug: 'web' },
    update: {},
    create: { name: 'Web', slug: 'web' },
  });

  // 3. Seed Sample Apps
  const terminalApp = await prisma.app.upsert({
    where: { slug: 'terminal-pro' },
    update: {},
    create: {
      name: 'Terminal Pro',
      slug: 'terminal-pro',
      shortDescription: 'Hardware accelerated web terminal emulator',
      description: 'Full featured web terminal emulator with low latency rendering and custom themes.',
      iconUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal.png',
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      currentVersion: '2.1.0',
      publishedAt: new Date(),
      categoryId: devTools.id,
      tags: {
        create: [{ tagId: cliTag.id }, { tagId: webTag.id }],
      },
      links: {
        create: [
          {
            platform: 'web',
            label: 'Launch Web App',
            url: 'https://terminal.elsesourav.com',
            action: 'open_app',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      versions: {
        create: [
          {
            version: '2.1.0',
            changelog: 'V2 architecture upgrade with Next.js 15 and low latency WebGL rendering.',
          },
        ],
      },
      stats: {
        create: {
          views: 1250,
          launches: 890,
          libraryAdds: 340,
          ratingAverage: 4.9,
          ratingCount: 45,
        },
      },
    },
  });

  // 4. Seed Help Categories & Articles
  const helpCat = await prisma.helpCategory.upsert({
    where: { slug: 'getting-started' },
    update: {},
    create: {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Basics and onboarding guides for ElseSourav apps',
      orderIndex: 0,
    },
  });

  await prisma.helpArticle.upsert({
    where: { slug: 'intro-to-ecosystem' },
    update: {},
    create: {
      categoryId: helpCat.id,
      title: 'Introduction to the ElseSourav Ecosystem',
      slug: 'intro-to-ecosystem',
      excerpt: 'Learn how to discover, launch, and bookmark tools.',
      content: 'ElseSourav is a curated hub of productivity and developer utilities designed for modern workflows.',
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date(),
      orderIndex: 0,
    },
  });

  console.info('✅ Seed completed successfully.');
  console.info(`  • Categories: 2`);
  console.info(`  • Apps: 1 (${terminalApp.name})`);
  console.info(`  • Help Categories: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
