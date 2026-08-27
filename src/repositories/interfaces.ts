import type { IRepository } from './base.repository';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import type { User, UserLibraryItem, UserPreferences } from '@/types/user.types';
import type { App, AppCategory, AppPlatform } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type {
  HelpArticle,
  HelpCategory,
  SupportTicket,
  SupportTicketMessage,
} from '@/types/support.types';
import type { Feedback } from '@/types/feedback.types';
import type { AuditLog } from '@/types/audit.types';
import type { CategoryEntity, CreateCategoryDto, UpdateCategoryDto } from './category.repository';
import type { CreateAppDto, UpdateAppDto } from './app.repository';

/**
 * App Repository Contract
 */
export interface IAppRepository extends IRepository<App, CreateAppDto, UpdateAppDto> {
  findBySlug(slug: string): RepositoryResult<App | null>;
  findFeatured(limit?: number): PaginatedRepositoryResult<App>;
  findByCategory(category: AppCategory, limit?: number): PaginatedRepositoryResult<App>;
  findByPlatform(platform: AppPlatform, limit?: number): PaginatedRepositoryResult<App>;
  findByTag(tag: string, limit?: number): PaginatedRepositoryResult<App>;
  findPublished(options?: QueryOptions): PaginatedRepositoryResult<App>;
}

/**
 * Category Repository Contract
 */
export interface ICategoryRepository extends IRepository<
  CategoryEntity,
  CreateCategoryDto,
  UpdateCategoryDto
> {
  findBySlug(slug: string): RepositoryResult<CategoryEntity | null>;
  findActive(): PaginatedRepositoryResult<CategoryEntity>;
}

/**
 * User Repository Contract (Users & User Library Subcollections)
 */
export interface IUserRepository extends IRepository<
  User,
  Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  Partial<User>
> {
  findByEmail(email: string): RepositoryResult<User | null>;
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): RepositoryResult<User>;
  getLibrary(userId: string): PaginatedRepositoryResult<UserLibraryItem>;
  addToLibrary(
    userId: string,
    item: Omit<UserLibraryItem, 'id' | 'addedAt'>
  ): RepositoryResult<UserLibraryItem>;
  removeFromLibrary(userId: string, appId: string): RepositoryResult<void>;
  toggleFavorite(userId: string, appId: string): RepositoryResult<boolean>;
}

/**
 * Blog Repository Contract
 */
export interface IBlogRepository extends IRepository<
  BlogPost,
  Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
  Partial<BlogPost>
> {
  findBySlug(slug: string): RepositoryResult<BlogPost | null>;
  findPublished(options?: QueryOptions): PaginatedRepositoryResult<BlogPost>;
  findByTag(tagSlug: string, limit?: number): PaginatedRepositoryResult<BlogPost>;
}

/**
 * Help Center Repository Contract
 */
export interface IHelpRepository {
  getCategories(): PaginatedRepositoryResult<HelpCategory>;
  getArticleBySlug(slug: string): RepositoryResult<HelpArticle | null>;
  getArticlesByCategory(categoryId: string): PaginatedRepositoryResult<HelpArticle>;
  searchArticles(queryText: string): PaginatedRepositoryResult<HelpArticle>;
}

/**
 * Support Ticket Repository Contract (Tickets & Message Subcollections)
 */
export interface ISupportRepository extends IRepository<
  SupportTicket,
  Omit<
    SupportTicket,
    'id' | 'ticketNumber' | 'messages' | 'lastMessageAt' | 'createdAt' | 'updatedAt'
  >,
  Partial<SupportTicket>
> {
  findByUser(userId: string): PaginatedRepositoryResult<SupportTicket>;
  findByTicketNumber(ticketNumber: string): RepositoryResult<SupportTicket | null>;
  addMessage(
    ticketId: string,
    message: Omit<SupportTicketMessage, 'id' | 'ticketId' | 'createdAt'>
  ): RepositoryResult<SupportTicketMessage>;
  getMessages(ticketId: string): PaginatedRepositoryResult<SupportTicketMessage>;
}

/**
 * Feedback Repository Contract
 */
export interface IFeedbackRepository extends IRepository<
  Feedback,
  Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>,
  Partial<Feedback>
> {
  findByApp(appId: string): PaginatedRepositoryResult<Feedback>;
  findPublic(options?: QueryOptions): PaginatedRepositoryResult<Feedback>;
}

/**
 * Audit Log Repository Contract (Append-Only)
 */
export interface IAuditLogRepository {
  logAction(entry: Omit<AuditLog, 'id' | 'timestamp'>): RepositoryResult<AuditLog>;
  findRecent(options?: QueryOptions): PaginatedRepositoryResult<AuditLog>;
}
