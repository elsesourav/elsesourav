import type { HelpCategory, HelpArticle } from '@elsesourav/types';

let helpCounter = 1;

export function resetHelpFactoryCounter(): void {
  helpCounter = 1;
}

export function createHelpCategory(overrides?: Partial<HelpCategory>): HelpCategory {
  const index = overrides?.orderIndex ?? 1;
  return {
    id: overrides?.id || `help-cat-${index}`,
    name: overrides?.name || 'Getting Started',
    slug: overrides?.slug || 'getting-started',
    description: overrides?.description || 'Essential guides for workspace configuration and developer shortcuts.',
    icon: overrides?.icon || 'compass',
    orderIndex: index,
    articleCount: overrides?.articleCount ?? 3,
    createdAt: overrides?.createdAt ?? 1704067200000,
    updatedAt: overrides?.updatedAt ?? 1704067200000,
  };
}

export function createHelpArticle(overrides?: Partial<HelpArticle>): HelpArticle {
  const index = helpCounter++;
  const id = overrides?.id || `help-art-${index}`;
  const slug = overrides?.slug || `quickstart-guide-${index}`;
  const title = overrides?.title || `Configuring Your Developer Workspace #${index}`;

  return {
    id,
    categoryId: overrides?.categoryId || 'help-cat-1',
    category: overrides?.category,
    title,
    slug,
    excerpt:
      overrides?.excerpt ||
      `Step-by-step instructions to configure your API tokens, bookmarks, and appearance preferences.`,
    content:
      overrides?.content ||
      `# ${title}\n\nWelcome to the official ElseSourav documentation.\n\n### Step 1: Authentication\nSign in with your verified GitHub or Google credentials.\n\n### Step 2: Personal Library\nBookmark your favorite terminal utilities for quick access.`,
    status: overrides?.status || 'published',
    orderIndex: overrides?.orderIndex ?? index,
    helpfulCount: overrides?.helpfulCount ?? 42,
    unhelpfulCount: overrides?.unhelpfulCount ?? 1,
    publishedAt: overrides?.publishedAt ?? 1704067200000,
    createdAt: overrides?.createdAt ?? 1704067200000,
    updatedAt: overrides?.updatedAt ?? 1704067200000,
  };
}
