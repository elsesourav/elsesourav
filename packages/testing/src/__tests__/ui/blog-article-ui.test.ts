import { describe, it, expect, vi } from 'vitest';
import { BlogService, BlogRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import type { PublicBlogPost, BlogPostListItem } from '@elsesourav/types';

describe('Blog Article Reader Query & Projection Tests', () => {
  const mockPublicArticle: PublicBlogPost = {
    id: 'post-101',
    slug: 'turborepo-modular-monoliths',
    title: 'Architecting Modular Monoliths with Turborepo',
    excerpt: 'How we structured ElseSourav V2 into clean workspace packages.',
    content: `## Architecture Strategy\n\nTurborepo enables ultra-fast compilation through remote caching and intelligent task orchestration.\n\n\`\`\`typescript\nexport const V2_CONFIG = true;\n\`\`\``,
    coverImageUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/blog/turborepo.jpg',
    author: {
      id: 'usr-1',
      displayName: 'Sourav',
      username: 'elsesourav',
      photoUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/avatars/sourav.jpg',
      bio: 'Software engineer building web apps and developer utilities.',
    },
    category: {
      id: 'cat-eng',
      name: 'Engineering',
      slug: 'engineering',
      orderIndex: 1,
    },
    tags: [
      { id: 'tag-turbo', name: 'Turborepo', slug: 'turborepo' },
      { id: 'tag-arch', name: 'Architecture', slug: 'architecture' },
    ],
    readingTime: 4,
    viewsCount: 320,
    seoTitle: 'Modular Monolith Architecture Guide | ElseSourav',
    seoDescription: 'Guide to Turborepo workspaces and Next.js 15 packages.',
    publishedAt: 1704067200000,
    createdAt: 1704067000000,
    updatedAt: 1704067200000,
  };

  const mockRelatedPost: BlogPostListItem = {
    id: 'post-102',
    slug: 'nextjs-15-deep-dive',
    title: 'Next.js 15 Deep Dive',
    excerpt: 'Exploring the new features of Next.js 15.',
    author: {
      id: 'usr-1',
      displayName: 'Sourav',
    },
    tags: [],
    readingTime: 3,
    viewsCount: 150,
    publishedAt: 1704067100000,
    createdAt: 1704067000000,
  };

  it('retrieves full public blog projection and increments views', async () => {
    const mockRepo = {
      findBySlug: vi.fn().mockResolvedValue(mockPublicArticle),
      incrementViews: vi.fn().mockResolvedValue(undefined),
    } as unknown as BlogRepository;

    const service = new BlogService(mockRepo);
    const article = await service.getPublicPostBySlug('turborepo-modular-monoliths');

    expect(article.title).toBe('Architecting Modular Monoliths with Turborepo');
    expect(article.content).toContain('## Architecture Strategy');
    expect(article.author.displayName).toBe('Sourav');
    expect(article.tags).toHaveLength(2);
    expect(mockRepo.findBySlug).toHaveBeenCalledWith('turborepo-modular-monoliths');
    expect(mockRepo.incrementViews).toHaveBeenCalledWith('post-101');
  });

  it('throws notFound for non-existent, draft, or deleted articles', async () => {
    const mockRepo = {
      findBySlug: vi.fn().mockResolvedValue(null),
    } as unknown as BlogRepository;

    const service = new BlogService(mockRepo);

    await expect(service.getPublicPostBySlug('unpublished-draft-slug')).rejects.toThrowError(AppError);
  });

  it('fetches up to 3 related blog posts from the same category', async () => {
    const mockRepo = {
      findRelatedPosts: vi.fn().mockResolvedValue([mockRelatedPost]),
    } as unknown as BlogRepository;

    const service = new BlogService(mockRepo);
    const related = await service.getRelatedPosts('post-101', 'cat-eng', 3);

    expect(related).toHaveLength(1);
    expect(related[0]?.slug).toBe('nextjs-15-deep-dive');
    expect(mockRepo.findRelatedPosts).toHaveBeenCalledWith('post-101', 'cat-eng', 3);
  });
});
