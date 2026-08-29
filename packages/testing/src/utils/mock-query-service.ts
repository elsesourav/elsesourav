import type {
  AppSearchResult,
  BlogQueryResult,
  CategorySummary,
  TagSummary,
  PublicApp,
  BlogPost,
  HelpCategory,
  HelpArticle,
  SupportTicket,
  UserLibraryItem,
  NotificationItem,
  User,
  AppSearchInput,
  BlogQueryInput,
} from '@elsesourav/types';
import { fixturePublishedApps, fixturePublicApps, fixtureCategories, fixtureTags } from '../fixtures/apps.fixtures';
import { fixtureBlogPosts, fixtureBlogCategories, fixtureBlogTags } from '../fixtures/blog.fixtures';
import { fixtureHelpCategories, fixtureHelpArticles } from '../fixtures/help.fixtures';
import { fixtureSupportTicketsList } from '../fixtures/support.fixtures';
import { fixtureUserLibraryItems } from '../fixtures/library.fixtures';
import { fixtureNotificationsList } from '../fixtures/notifications.fixtures';
import { fixtureStandardUser, fixtureAdminUser } from '../fixtures/users.fixtures';
import { createAppListItem } from '../factories/app.factory';
import { createBlogPostListItem } from '../factories/blog.factory';

/**
 * Mock Query Layer for testing UI Server Components and Client Hooks in isolation.
 */
export class MockQueryService {
  private apps = [...fixturePublishedApps];
  private blogPosts = [...fixtureBlogPosts];
  private helpCategories = [...fixtureHelpCategories];
  private helpArticles = [...fixtureHelpArticles];
  private tickets = [...fixtureSupportTicketsList];
  private libraryItems = [...fixtureUserLibraryItems];
  private notifications = [...fixtureNotificationsList];

  async discoverPublishedApps(input: AppSearchInput = {}): Promise<AppSearchResult> {
    let filtered = this.apps.filter((a) => a.status === 'published' && !a.deletedAt);

    if (input.query) {
      const q = input.query.toLowerCase();
      filtered = filtered.filter(
        (a) => a.name.toLowerCase().includes(q) || a.shortDescription.toLowerCase().includes(q)
      );
    }

    if (input.filters?.categorySlug) {
      const cat = fixtureCategories.find((c) => c.slug === input.filters?.categorySlug);
      if (cat) {
        filtered = filtered.filter((a) => a.primaryCategory === cat.name || a.categoryId === cat.id);
      }
    }

    const page = input.page || 1;
    const limit = input.limit || 12;
    const startIndex = (page - 1) * limit;
    const pageItems = filtered.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filtered.length / limit);

    return {
      items: pageItems.map((a) => createAppListItem(a)),
      totalCount: filtered.length,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async getPublicAppBySlug(slug: string): Promise<PublicApp | null> {
    const found = fixturePublicApps.find((a) => a.slug === slug);
    return found || null;
  }

  async getCategories(): Promise<CategorySummary[]> {
    return fixtureCategories.map((c, i) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      orderIndex: c.orderIndex,
      appCount: i === 0 ? 2 : 1,
    }));
  }

  async getTags(): Promise<TagSummary[]> {
    return fixtureTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, appCount: 1 }));
  }

  async listPublicBlogPosts(input: BlogQueryInput = {}): Promise<BlogQueryResult> {
    let filtered = this.blogPosts.filter((p) => p.status === 'published');

    if (input.categorySlug) {
      filtered = filtered.filter((p) => p.category?.slug === input.categorySlug);
    }

    if (input.query) {
      const q = input.query.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    }

    const page = input.page || 1;
    const limit = input.limit || 9;
    const startIndex = (page - 1) * limit;
    const pageItems = filtered.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(filtered.length / limit);

    return {
      items: pageItems.map((p) => createBlogPostListItem(p)),
      totalCount: filtered.length,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return this.blogPosts.find((p) => p.slug === slug && p.status === 'published') || null;
  }

  async getHelpCategories(): Promise<HelpCategory[]> {
    return this.helpCategories;
  }

  async getHelpArticlesByCategory(categorySlug: string): Promise<HelpArticle[]> {
    const cat = this.helpCategories.find((c) => c.slug === categorySlug);
    if (!cat) return [];
    return this.helpArticles.filter((a) => a.categoryId === cat.id && a.status === 'published');
  }

  async getUserLibrary(userId: string): Promise<UserLibraryItem[]> {
    return this.libraryItems.filter((i) => i.userId === userId);
  }

  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    return this.notifications.filter((n) => n.userId === userId);
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return this.tickets.filter((t) => t.userId === userId);
  }

  async getCurrentUser(role: 'USER' | 'ADMIN' = 'USER'): Promise<User> {
    return role === 'ADMIN' ? fixtureAdminUser : fixtureStandardUser;
  }
}
