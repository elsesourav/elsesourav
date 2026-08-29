import { describe, it, expect, vi } from 'vitest';
import { HelpService, HelpRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import { generateHelpSlug } from '@elsesourav/validation';
import type {
  HelpCategoryWithArticles,
  PublicHelpArticle,
  HelpArticle as DomainHelpArticle,
  HelpSearchResult,
} from '@elsesourav/types';

describe('Help Center Domain Service, Lifecycle & Security', () => {
  const mockCategory: HelpCategoryWithArticles = {
    id: 'cat-1',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Learn the basics of ElseSourav software suite',
    icon: 'book',
    orderIndex: 1,
    createdAt: 1704067000000,
    updatedAt: 1704067000000,
    articleCount: 2,
    articles: [
      {
        id: 'art-1',
        slug: 'account-setup',
        title: 'Account Setup Guide',
        excerpt: 'How to create and secure your ElseSourav account.',
        categoryId: 'cat-1',
        categorySlug: 'getting-started',
        categoryName: 'Getting Started',
        orderIndex: 1,
        publishedAt: 1704067100000,
        updatedAt: 1704067100000,
      },
    ],
  };

  const mockPublicArticle: PublicHelpArticle = {
    id: 'art-1',
    slug: 'account-setup',
    title: 'Account Setup Guide',
    excerpt: 'How to create and secure your ElseSourav account.',
    content: 'Follow these steps to complete account verification...',
    category: {
      id: 'cat-1',
      name: 'Getting Started',
      slug: 'getting-started',
      icon: 'book',
    },
    author: {
      id: 'usr-admin',
      displayName: 'ElseSourav Support Team',
    },
    helpfulCount: 42,
    unhelpfulCount: 2,
    publishedAt: 1704067100000,
    updatedAt: 1704067100000,
  };

  const mockDomainArticle: DomainHelpArticle = {
    id: 'art-1',
    categoryId: 'cat-1',
    title: 'Account Setup Guide',
    slug: 'account-setup',
    content: 'Follow these steps to complete account verification...',
    status: 'draft',
    orderIndex: 1,
    helpfulCount: 0,
    unhelpfulCount: 0,
    createdAt: 1704067000000,
    updatedAt: 1704067000000,
  };

  // ==========================================
  // Public Visibility & Isolation Tests
  // ==========================================

  it('lists public categories with published article previews', async () => {
    const mockRepo = {
      findPublicCategories: vi.fn().mockResolvedValue([mockCategory]),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const categories = await service.listPublicCategories();

    expect(categories).toHaveLength(1);
    expect(categories[0]?.slug).toBe('getting-started');
    expect(categories[0]?.articles).toHaveLength(1);
  });

  it('retrieves published article by slug and exposes sanitized author', async () => {
    const mockRepo = {
      findArticleBySlug: vi.fn().mockResolvedValue(mockPublicArticle),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const article = await service.getArticleBySlug('account-setup');

    expect(article.title).toBe('Account Setup Guide');
    expect(article.author?.displayName).toBe('ElseSourav Support Team');
    expect(article).not.toHaveProperty('deletedAt');
    expect(article).not.toHaveProperty('status');
  });

  it('throws notFound for non-existent or unpublished articles', async () => {
    const mockRepo = {
      findArticleBySlug: vi.fn().mockResolvedValue(null),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    await expect(service.getArticleBySlug('secret-internal-draft')).rejects.toThrowError(AppError);
  });

  it('searches published articles via keyword matching', async () => {
    const mockSearchResult: HelpSearchResult = {
      items: mockCategory.articles,
      totalCount: 1,
      query: 'account',
    };

    const mockRepo = {
      searchPublicArticles: vi.fn().mockResolvedValue(mockSearchResult),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const result = await service.searchArticles({ query: 'account' });

    expect(result.totalCount).toBe(1);
    expect(result.items[0]?.slug).toBe('account-setup');
    expect(mockRepo.searchPublicArticles).toHaveBeenCalledWith({ query: 'account' });
  });

  // ==========================================
  // Admin Security & Lifecycle Mutation Tests
  // ==========================================

  it('allows ADMIN to create a help article with auto-generated slug', async () => {
    const mockRepo = {
      createArticle: vi.fn().mockResolvedValue(mockDomainArticle),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const article = await service.createArticle('usr-admin', 'ADMIN', {
      categoryId: 'cat-1',
      title: 'Account Setup Guide',
      content: 'Follow these steps to complete account verification...',
    });

    expect(article.title).toBe('Account Setup Guide');
    expect(mockRepo.createArticle).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Account Setup Guide' }),
      'account-setup-guide',
      'usr-admin'
    );
  });

  it('rejects regular USER from creating help articles (Throws 403 Forbidden)', async () => {
    const mockRepo = {
      createArticle: vi.fn(),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);

    await expect(
      service.createArticle('usr-regular', 'USER', {
        categoryId: 'cat-1',
        title: 'Unauthorized Article',
        content: 'Should not be allowed to create.',
      })
    ).rejects.toThrowError(AppError);

    expect(mockRepo.createArticle).not.toHaveBeenCalled();
  });

  it('rejects anonymous request from publishing help articles', async () => {
    const mockRepo = {
      publishArticle: vi.fn(),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);

    await expect(service.publishArticle(undefined, 'art-1')).rejects.toThrowError(AppError);
    expect(mockRepo.publishArticle).not.toHaveBeenCalled();
  });

  it('normalizes slugs cleanly across special characters and spaces', () => {
    expect(generateHelpSlug('How to use ElseSourav Terminal Pro?')).toBe('how-to-use-elsesourav-terminal-pro');
    expect(generateHelpSlug('  Multi---space & Symbols ## !!  ')).toBe('multi-space-symbols');
  });
});
