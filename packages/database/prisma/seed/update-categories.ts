import { prisma } from '../../src';

export const CANONICAL_CATEGORIES = [
  {
    name: 'AI',
    slug: 'ai',
    description: 'Neural networks, machine learning models, computer vision, and on-device intelligent systems.',
    icon: 'Sparkles',
    orderIndex: 0,
  },
  {
    name: 'Web Apps',
    slug: 'web-apps',
    description: 'Production web applications, full-stack client portals, content management platforms, and web platforms.',
    icon: 'Globe',
    orderIndex: 1,
  },
  {
    name: 'Games',
    slug: 'games',
    description: 'WebAssembly arcade games, interactive canvas physics, educational puzzles, and retro simulators.',
    icon: 'Gamepad2',
    orderIndex: 2,
  },
  {
    name: 'Automation',
    slug: 'automation',
    description: 'Marketplace seller automation, data extraction pipelines, workflow bots, and batch synchronizers.',
    icon: 'Cpu',
    orderIndex: 3,
  },
  {
    name: 'Tools',
    slug: 'tools',
    description: 'Developer utilities, terminal CLI tools, client-side PDF processors, invoice generators, and calculators.',
    icon: 'Wrench',
    orderIndex: 4,
  },
  {
    name: 'Hardware',
    slug: 'hardware',
    description: 'Microcontroller firmware, ESP32 robotics, telemetry sensors, and embedded IoT systems.',
    icon: 'Radio',
    orderIndex: 5,
  },
  {
    name: 'Simulations',
    slug: 'simulations',
    description: 'Cellular automata, particle physics visualizers, constraint satisfaction algorithms, and generative math models.',
    icon: 'Layers',
    orderIndex: 6,
  },
  {
    name: 'Mobile',
    slug: 'mobile',
    description: 'Cross-platform mobile applications, React Native utilities, tracking apps, and offline tools.',
    icon: 'Smartphone',
    orderIndex: 7,
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'Layer-based photo editors, SVG pipelines, generative typography, and creative media tools.',
    icon: 'Palette',
    orderIndex: 8,
  },
  {
    name: 'E-Commerce',
    slug: 'ecommerce',
    description: 'Store platforms, catalog management, inventory synchronization, and merchant billing utilities.',
    icon: 'ShoppingCart',
    orderIndex: 9,
  },
  {
    name: 'Architecture',
    slug: 'architecture',
    description: 'System design, engineering devlogs, performance benchmarks, low-level compilers, and monorepo patterns.',
    icon: 'BookOpen',
    orderIndex: 10,
  },
];

const APP_CATEGORY_MAP: Record<string, { primary: string; categories: string[] }> = {
  'seller-pdf-cropper': { primary: 'tools', categories: ['tools', 'automation', 'ecommerce'] },
  'img-editor': { primary: 'design', categories: ['design', 'tools'] },
  'professional-invoice-maker': { primary: 'tools', categories: ['tools', 'web-apps', 'ecommerce'] },
  'nn-number-rec': { primary: 'ai', categories: ['ai', 'simulations'] },
  'meal-tracker': { primary: 'mobile', categories: ['mobile', 'tools'] },
  'glorov': { primary: 'web-apps', categories: ['web-apps', 'ecommerce', 'automation'] },
  'auto-flipkart-otp': { primary: 'automation', categories: ['automation', 'tools', 'ecommerce'] },
  'gcelt-automate': { primary: 'automation', categories: ['automation', 'web-apps'] },
  'travel-plans': { primary: 'web-apps', categories: ['web-apps', 'tools'] },
  'typing-test': { primary: 'games', categories: ['games', 'tools', 'web-apps'] },
  'neo': { primary: 'tools', categories: ['tools'] },
  'edu-khel-games': { primary: 'games', categories: ['games', 'web-apps'] },
  'user-manager': { primary: 'web-apps', categories: ['web-apps', 'tools'] },
  'falling-sands': { primary: 'simulations', categories: ['simulations', 'games'] },
  'gst-return': { primary: 'tools', categories: ['tools', 'web-apps', 'ecommerce'] },
  'wave-function-collapse': { primary: 'simulations', categories: ['simulations', 'ai'] },
  'esp32-cam-with-car-control': { primary: 'hardware', categories: ['hardware', 'tools'] },
  'spectralens-ai': { primary: 'ai', categories: ['ai', 'tools', 'web-apps'] },
  'particle-chain-wasm': { primary: 'simulations', categories: ['simulations', 'games'] },
  'debayan-ganguly-portfolio': { primary: 'web-apps', categories: ['web-apps', 'design'] },
  'es-automation': { primary: 'automation', categories: ['automation', 'tools'] },
  'breakout-ball': { primary: 'games', categories: ['games', 'simulations'] },
};

const BLOG_CATEGORY_MAP: Record<string, { primary: string; categories: string[] }> = {
  'compiling-cpp-neural-networks-to-webassembly-simd-browser': {
    primary: 'ai',
    categories: ['ai', 'simulations', 'architecture'],
  },
  'inside-spectralens-multi-engine-ai-architecture': {
    primary: 'ai',
    categories: ['ai', 'architecture', 'web-apps'],
  },
  'inside-spectralens-multi-engine-browser-ai-zero-api-costs': {
    primary: 'ai',
    categories: ['ai', 'tools', 'web-apps'],
  },
  'glorov-v1-production-release': {
    primary: 'web-apps',
    categories: ['web-apps', 'ecommerce', 'architecture'],
  },
  'architecting-ecommerce-automation-reverse-engineering-seller-workflows': {
    primary: 'automation',
    categories: ['automation', 'ecommerce', 'architecture'],
  },
  'breakout-ball-v2-cyber-matrix-release': {
    primary: 'games',
    categories: ['games', 'architecture'],
  },
  'eliminating-arduino-uno-standalone-esp32-cam-robotics-pwm': {
    primary: 'hardware',
    categories: ['hardware', 'architecture'],
  },
};

export async function updateCategories() {
  console.info('🚀 Updating Categories and migrating to clean distinct categories...');

  // 1. Upsert all canonical categories into Category table
  const categoryRecords: Record<string, { id: string; slug: string; name: string }> = {};

  for (const cat of CANONICAL_CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        orderIndex: cat.orderIndex,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        orderIndex: cat.orderIndex,
        isActive: true,
      },
    });
    categoryRecords[cat.slug] = { id: upserted.id, slug: upserted.slug, name: upserted.name };
    console.info(`  ✓ Category "${cat.name}" (${cat.slug}) ready.`);
  }

  // Also ensure BlogCategory has matching records
  const blogCategoryRecords: Record<string, string> = {};
  for (const cat of CANONICAL_CATEGORIES) {
    const upserted = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        orderIndex: cat.orderIndex,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        orderIndex: cat.orderIndex,
      },
    });
    blogCategoryRecords[cat.slug] = upserted.id;
  }

  // 2. Update all apps with new primary categories and AppCategory relations
  console.info('📦 Updating applications with multiple distinct categories...');
  const allApps = await prisma.app.findMany({ select: { id: true, slug: true, name: true } });

  for (const app of allApps) {
    const mapping = APP_CATEGORY_MAP[app.slug];
    const primarySlug = mapping?.primary || 'tools';
    const categorySlugs = mapping?.categories || [primarySlug];

    const primaryCat = categoryRecords[primarySlug];
    if (primaryCat) {
      // Update app primary category
      await prisma.app.update({
        where: { id: app.id },
        data: { categoryId: primaryCat.id },
      });

      // Clear existing AppCategory relations for this app
      await prisma.appCategory.deleteMany({ where: { appId: app.id } });

      // Insert all selected categories into AppCategory
      for (const cSlug of categorySlugs) {
        const catRecord = categoryRecords[cSlug];
        if (catRecord) {
          await prisma.appCategory.create({
            data: {
              appId: app.id,
              categoryId: catRecord.id,
            },
          });
        }
      }
      console.info(`  ✓ App "${app.name}": primary -> ${primaryCat.name}, all -> [${categorySlugs.join(', ')}]`);
    }
  }

  // 3. Update all blog posts with new primary categories and BlogPostCategory relations
  console.info('📝 Updating blog posts / updates with multiple distinct categories...');
  const allPosts = await prisma.blogPost.findMany({ select: { id: true, slug: true, title: true } });

  for (const post of allPosts) {
    const mapping = BLOG_CATEGORY_MAP[post.slug];
    const primarySlug = mapping?.primary || 'architecture';
    const categorySlugs = mapping?.categories || [primarySlug];

    const primaryCat = categoryRecords[primarySlug];
    const blogCatId = blogCategoryRecords[primarySlug];

    if (primaryCat) {
      // Update blog post primary categoryId
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { categoryId: blogCatId || null },
      });

      // Clear existing BlogPostCategory relations for this post
      await prisma.blogPostCategory.deleteMany({ where: { postId: post.id } });

      // Insert all selected categories into BlogPostCategory
      for (const cSlug of categorySlugs) {
        const catRecord = categoryRecords[cSlug];
        if (catRecord) {
          await prisma.blogPostCategory.create({
            data: {
              postId: post.id,
              categoryId: catRecord.id,
            },
          });
        }
      }
      console.info(`  ✓ Post "${post.title}": primary -> ${primaryCat.name}, all -> [${categorySlugs.join(', ')}]`);
    }
  }

  // Deactivate old combined category records so they don't clutter the UI
  const oldCombinedSlugs = [
    'ai-ml',
    'hardware-iot',
    'media-design',
    'utilities',
    'architecture-design',
    'systems-webassembly',
    'hardware-robotics',
  ];
  await prisma.category.updateMany({
    where: { slug: { in: oldCombinedSlugs } },
    data: { isActive: false },
  });

  console.info('🎉 Category update and migration completed successfully!');
}

if (process.argv[1]?.includes('update-categories')) {
  updateCategories()
    .catch((err) => {
      console.error('Error running category update:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
