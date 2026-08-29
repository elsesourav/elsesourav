import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

import { prisma } from '../../src/index';

async function updateImages() {
  console.info('🖼️ Updating all media URLs in PostgreSQL with verified live images...');

  // 1. Update Apps
  const appUpdates = [
    {
      slug: 'terminal-pro',
      iconUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80',
    },
    {
      slug: 'palette-studio',
      iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
    },
    {
      slug: 'focusflow',
      iconUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
    },
    {
      slug: 'devdock',
      iconUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&q=80',
    },
    {
      slug: 'regexlens',
      iconUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    },
  ];

  for (const app of appUpdates) {
    await prisma.app.updateMany({
      where: { slug: app.slug },
      data: {
        iconUrl: app.iconUrl,
        featuredImageUrl: app.featuredImageUrl,
      },
    });
    console.info(`  ✓ Updated App images: ${app.slug}`);
  }

  // 2. Update Blog Posts
  const postUpdates = [
    {
      slug: 'architecture-insights',
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    },
    {
      slug: 'zero-trust-multi-tenant-security-patterns',
      coverImageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80',
    },
    {
      slug: 'building-accessible-design-tokens-with-tailwind',
      coverImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80',
    },
  ];

  for (const post of postUpdates) {
    await prisma.blogPost.updateMany({
      where: { slug: post.slug },
      data: {
        coverImageUrl: post.coverImageUrl,
      },
    });
    console.info(`  ✓ Updated Blog cover: ${post.slug}`);
  }

  // 3. Update User Avatars
  const userUpdates = [
    {
      email: 'elsesourav.auth@gmail.com',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    },
    {
      email: 'alex.chen@elsesourav.com',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
    {
      email: 'admin@elsesourav.com',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    },
  ];

  for (const user of userUpdates) {
    await prisma.user.updateMany({
      where: { email: user.email },
      data: {
        photoUrl: user.photoUrl,
      },
    });
    console.info(`  ✓ Updated User avatar: ${user.email}`);
  }

  console.info('\n✅ All database images updated successfully!');
}

updateImages()
  .catch((e) => {
    console.error('❌ Error updating database images:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
