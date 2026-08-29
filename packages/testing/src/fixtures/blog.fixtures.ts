import type { BlogPost, BlogPostListItem, BlogCategory, BlogTag } from '@elsesourav/types';
import { createBlogPostListItem } from '../factories/blog.factory';

export const fixtureBlogCategoryArch: BlogCategory = {
  id: 'bcat-arch',
  name: 'Architecture & Systems',
  slug: 'architecture-and-systems',
  orderIndex: 1,
};

export const fixtureBlogCategorySec: BlogCategory = {
  id: 'bcat-sec',
  name: 'Security & Auth',
  slug: 'security-and-auth',
  orderIndex: 2,
};

export const fixtureBlogCategoryUx: BlogCategory = {
  id: 'bcat-ux',
  name: 'Design Systems & UX',
  slug: 'design-systems-and-ux',
  orderIndex: 3,
};

export const fixtureBlogCategories: readonly BlogCategory[] = [
  fixtureBlogCategoryArch,
  fixtureBlogCategorySec,
  fixtureBlogCategoryUx,
];

export const fixtureBlogTagNextjs: BlogTag = {
  id: 'btag-nextjs',
  name: 'Next.js 15',
  slug: 'nextjs-15',
};
export const fixtureBlogTagTurbo: BlogTag = {
  id: 'btag-turbo',
  name: 'Turborepo',
  slug: 'turborepo',
};
export const fixtureBlogTagRbac: BlogTag = {
  id: 'btag-rbac',
  name: 'Zero-Trust RBAC',
  slug: 'zero-trust-rbac',
};
export const fixtureBlogTagTokens: BlogTag = {
  id: 'btag-tokens',
  name: 'CSS Tokens',
  slug: 'css-tokens',
};

export const fixtureBlogTags: readonly BlogTag[] = [
  fixtureBlogTagNextjs,
  fixtureBlogTagTurbo,
  fixtureBlogTagRbac,
  fixtureBlogTagTokens,
];

export const fixtureBlogPostArchitecture: BlogPost = {
  id: 'post-architecture',
  slug: 'architecture-insights',
  title: 'ElseSourav Architecture: Scaling with Turborepo and Next.js 15 App Router',
  excerpt:
    'A technical post-mortem on restructuring our single-page React app into a modular, multi-package Turborepo with server-first rendering.',
  content: `## Architectural Motivation

When designing ElseSourav, we needed to scale past client-side bundler bottlenecks. By decomposing the monolithic web application into isolated, single-responsibility workspace packages, we achieved instant sub-package typechecking and shared UI design tokens.

### Key Performance Benchmarks

1. **Sub-100ms Server Renders**: Next.js 15 React Server Components stream initial DOM payloads with 0 unnecessary client JS bundles.
2. **Unified Data Layer**: Domain repositories and services in \`@elsesourav/database\` strictly govern SQL mutations.
3. **Resilient Driver Adapters**: Direct connection pooling through Prisma 7 and PostgreSQL.`,
  authorId: 'usr-admin-1',
  author: {
    id: 'usr-admin-1',
    displayName: 'Sourav',
    username: 'elsesourav',
    photoUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/avatars/admin.png',
  },
  category: fixtureBlogCategoryArch,
  tags: [fixtureBlogTagNextjs, fixtureBlogTagTurbo],
  coverImageUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/banners/v2-arch-banner.png',
  status: 'published',
  readingTime: 6,
  viewsCount: 1420,
  publishedAt: 1704067200000,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

export const fixtureBlogPostZeroTrust: BlogPost = {
  id: 'post-zero-trust-rbac',
  slug: 'zero-trust-rbac-implementation',
  title: 'Zero-Trust Role-Based Access Control in Modern Full-Stack Applications',
  excerpt:
    'How we enforce multi-tenant authorization guards across server actions, API routes, and database triggers.',
  content: `## Defense in Depth

Role-based access control cannot rely solely on frontend navigation routing. In ElseSourav V2, authorization is asserted at three distinct structural layers:

1. **Server Layout Level**: Server components redirect non-privileged sessions before rendering layout children.
2. **Domain Service Level**: Every service method independently validates caller claims.
3. **Database Constraints**: Multi-tenant foreign keys and audit logs track every sensitive mutation.`,
  authorId: 'usr-admin-1',
  author: {
    id: 'usr-admin-1',
    displayName: 'Sourav',
    username: 'elsesourav',
    photoUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/avatars/admin.png',
  },
  category: fixtureBlogCategorySec,
  tags: [fixtureBlogTagRbac],
  coverImageUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/banners/rbac-banner.png',
  status: 'published',
  readingTime: 4,
  viewsCount: 890,
  publishedAt: 1704153600000,
  createdAt: 1704153600000,
  updatedAt: 1704153600000,
};

export const fixtureBlogPostDesignSystems: BlogPost = {
  id: 'post-design-systems-tokens',
  slug: 'accessible-design-tokens-craft',
  title: 'Crafting Accessible Dark-Mode Design Tokens with Vanilla CSS and Tailwind',
  excerpt:
    'Techniques for managing semantic design tokens, WCAG AA contrast compliance, and glassmorphism without runtime overhead.',
  content: `## Semantic Tokens vs Arbitrary Utilities

Relying on ad-hoc Tailwind classes leads to visual drift. By defining semantic CSS custom properties for surfaces, borders, and typography, we guarantee unified contrast ratios across all viewports.`,
  authorId: 'usr-admin-1',
  author: {
    id: 'usr-admin-1',
    displayName: 'Sourav',
    username: 'elsesourav',
  },
  category: fixtureBlogCategoryUx,
  tags: [fixtureBlogTagTokens],
  status: 'published',
  readingTime: 5,
  viewsCount: 650,
  publishedAt: 1704240000000,
  createdAt: 1704240000000,
  updatedAt: 1704240000000,
};

export const fixtureBlogPostDraft: BlogPost = {
  id: 'post-draft-article',
  slug: 'upcoming-webgpu-features',
  title: 'Upcoming WebGPU Accelerated Shader Pipelines',
  excerpt: 'A draft look at our next graphics pipeline release.',
  content: 'Draft content under active revision.',
  authorId: 'usr-admin-1',
  category: fixtureBlogCategoryArch,
  tags: [fixtureBlogTagNextjs],
  status: 'draft',
  readingTime: 2,
  viewsCount: 0,
  createdAt: 1704240000000,
  updatedAt: 1704240000000,
};

export const fixtureBlogPosts: readonly BlogPost[] = [
  fixtureBlogPostArchitecture,
  fixtureBlogPostZeroTrust,
  fixtureBlogPostDesignSystems,
];

export const fixtureBlogPostListItems: readonly BlogPostListItem[] = fixtureBlogPosts.map((p) =>
  createBlogPostListItem(p)
);
