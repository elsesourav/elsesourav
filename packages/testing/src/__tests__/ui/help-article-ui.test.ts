import { describe, it, expect, vi } from 'vitest';
import { HelpService, HelpRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import type { PublicHelpArticle, HelpArticleListItem } from '@elsesourav/types';

describe('Help Article Reader Query, Feedback & Isolation Tests', () => {
  const mockPublicArticle: PublicHelpArticle = {
    id: 'art-getting-started-1',
    slug: 'quickstart-guide',
    title: 'Quickstart Guide to ElseSourav',
    excerpt: 'Step-by-step onboarding for ElseSourav apps.',
    content:
      '## Step 1: Account Creation\n\nNavigate to `/signup` and enter your credentials.\n\n```bash\ncurl -I https://elsesourav.com/api/health\n```',
    category: {
      id: 'cat-getting-started',
      name: 'Getting Started',
      slug: 'getting-started',
      icon: 'compass',
    },
    author: {
      id: 'usr-admin-1',
      displayName: 'ElseSourav Documentation Team',
    },
    helpfulCount: 88,
    unhelpfulCount: 3,
    publishedAt: 1704067100000,
    updatedAt: 1704067200000,
  };

  const mockRelatedArticle: HelpArticleListItem = {
    id: 'art-getting-started-2',
    slug: 'account-security',
    title: 'Securing Your ElseSourav Account',
    excerpt: 'Multi-factor auth setup.',
    categoryId: 'cat-getting-started',
    categorySlug: 'getting-started',
    categoryName: 'Getting Started',
    orderIndex: 2,
    publishedAt: 1704067200000,
    updatedAt: 1704067200000,
  };

  it('retrieves public help article and excludes internal metadata', async () => {
    const mockRepo = {
      findArticleBySlug: vi.fn().mockResolvedValue(mockPublicArticle),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const article = await service.getArticleBySlug('quickstart-guide');

    expect(article.title).toBe('Quickstart Guide to ElseSourav');
    expect(article.category.slug).toBe('getting-started');
    expect(article.helpfulCount).toBe(88);
    expect(article).not.toHaveProperty('status');
    expect(article).not.toHaveProperty('deletedAt');
    expect(mockRepo.findArticleBySlug).toHaveBeenCalledWith('quickstart-guide');
  });

  it('rejects unpublished/draft articles with AppError.notFound', async () => {
    const mockRepo = {
      findArticleBySlug: vi.fn().mockResolvedValue(null),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    await expect(service.getArticleBySlug('draft-article-slug')).rejects.toThrowError(AppError);
  });

  it('retrieves related help articles in the same category', async () => {
    const mockRepo = {
      findRelatedArticles: vi.fn().mockResolvedValue([mockRelatedArticle]),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    const related = await service.getRelatedArticles(
      'art-getting-started-1',
      'cat-getting-started',
      3
    );

    expect(related).toHaveLength(1);
    expect(related[0]?.slug).toBe('account-security');
    expect(mockRepo.findRelatedArticles).toHaveBeenCalledWith(
      'art-getting-started-1',
      'cat-getting-started',
      3
    );
  });

  it('records helpfulness votes successfully', async () => {
    const mockRepo = {
      voteHelpful: vi.fn().mockResolvedValue(undefined),
    } as unknown as HelpRepository;

    const service = new HelpService(mockRepo);
    await service.voteHelpful('art-getting-started-1', true);

    expect(mockRepo.voteHelpful).toHaveBeenCalledWith('art-getting-started-1', true);
  });
});
