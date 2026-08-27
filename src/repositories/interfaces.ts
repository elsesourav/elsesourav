import type { IRepository } from './base.repository';
import type { RepositoryResult, PaginatedRepositoryResult, QueryOptions } from './types';
import type { User, UserLibraryItem } from '@/types/user.types';
import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type {
  HelpArticle,
  HelpCategory,
  SupportTicket,
  SupportTicketMessage,
} from '@/types/support.types';
import type { Feedback } from '@/types/feedback.types';
import type { AuditLog } from '@/types/audit.types';
import type { CreateAppDto, UpdateAppDto } from './app.repository';

/**
 * App Repository Contract
 */
export interface IAppRepository extends IRepository<App, CreateAppDto, UpdateAppDto> {
  findBySlug(slug: string): RepositoryResult<App | null>;
  publish(id: string): RepositoryResult<App>;
  unpublish(id: string): RepositoryResult<App>;
  archive(id: string): RepositoryResult<App>;
  listPublished(options?: QueryOptions): PaginatedRepositoryResult<App>;
  listFeatured(limit?: number): PaginatedRepositoryResult<App>;
  listLatest(limit?: number): PaginatedRepositoryResult<App>;
  listByCategory(category: string, options?: QueryOptions): PaginatedRepositoryResult<App>;
  listByTag(tag: string, options?: QueryOptions): PaginatedRepositoryResult<App>;
  checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean>;
}

import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { CreateCategoryDto, UpdateCategoryDto } from './category.repository';
import type { CreateTagDto, UpdateTagDto } from './tag.repository';

/**
 * Category Repository Contract
 */
export interface ICategoryRepository extends IRepository<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto
> {
  findBySlug(slug: string): RepositoryResult<Category | null>;
  findActive(): PaginatedRepositoryResult<Category>;
  deactivate(id: string): RepositoryResult<Category>;
  checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean>;
}

/**
 * Tag Repository Contract
 */
export interface ITagRepository extends IRepository<Tag, CreateTagDto, UpdateTagDto> {
  findBySlug(slug: string): RepositoryResult<Tag | null>;
  findActive(): PaginatedRepositoryResult<Tag>;
  deactivate(id: string): RepositoryResult<Tag>;
  checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean>;
}

import type { AppVersion } from '@/types/version.types';
import type { CreateAppVersionDto, UpdateAppVersionDto } from './version.repository';

/**
 * App Version Repository Contract (Subcollection: apps/{appId}/versions/{versionId})
 */
export interface IAppVersionRepository {
  findById(appId: string, versionId: string): RepositoryResult<AppVersion | null>;
  findByVersion(appId: string, version: string): RepositoryResult<AppVersion | null>;
  listByApp(appId: string, options?: QueryOptions): PaginatedRepositoryResult<AppVersion>;
  getLatest(appId: string): RepositoryResult<AppVersion | null>;
  create(appId: string, data: CreateAppVersionDto): RepositoryResult<AppVersion>;
  update(appId: string, versionId: string, data: UpdateAppVersionDto): RepositoryResult<AppVersion>;
  checkVersionUnique(appId: string, version: string, excludeId?: string): RepositoryResult<boolean>;
  setCurrentVersion(appId: string, versionId: string): RepositoryResult<AppVersion>;
}

import type { AppMedia, AppMediaType } from '@/types/media.types';
import type { CreateAppMediaDto, UpdateAppMediaDto } from './media.repository';

/**
 * App Media Repository Contract (Subcollection: apps/{appId}/media/{mediaId})
 */
export interface IAppMediaRepository {
  findById(appId: string, mediaId: string): RepositoryResult<AppMedia | null>;
  listByApp(appId: string, options?: QueryOptions): PaginatedRepositoryResult<AppMedia>;
  listByType(
    appId: string,
    type: AppMediaType,
    options?: QueryOptions
  ): PaginatedRepositoryResult<AppMedia>;
  create(appId: string, data: CreateAppMediaDto): RepositoryResult<AppMedia>;
  update(appId: string, mediaId: string, data: UpdateAppMediaDto): RepositoryResult<AppMedia>;
  delete(appId: string, mediaId: string): RepositoryResult<void>;
  reorder(appId: string, orderedMediaIds: string[]): RepositoryResult<void>;
}

import type { AuthUser } from '@/types/auth.types';
import type {
  CreateUserProfileDto,
  UpdateUserProfileDto,
  UpdateUserPreferencesDto,
} from './user.repository';

/**
 * User Repository Contract (Users & User Library Subcollections)
 */
export interface IUserRepository extends IRepository<
  User,
  CreateUserProfileDto,
  UpdateUserProfileDto
> {
  findByEmail(email: string): RepositoryResult<User | null>;
  findByUsername(username: string): RepositoryResult<User | null>;
  ensureProfile(authUser: AuthUser): RepositoryResult<User>;
  updateProfile(uid: string, data: UpdateUserProfileDto): RepositoryResult<User>;
  updatePreferences(uid: string, preferences: UpdateUserPreferencesDto): RepositoryResult<User>;
  softDelete(uid: string): RepositoryResult<User>;
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
