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
import type { AuditLog } from '@/types/audit.types';
import type { CreateAppDto, UpdateAppDto } from './app.repository';
import type { AppStatus } from '@/types/app.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';

/**
 * App Repository Contract
 */
export interface IAppRepository extends IRepository<App, CreateAppDto, UpdateAppDto> {
  findBySlug(slug: string): RepositoryResult<App | null>;
  createDraft(data: CreateAppDto): RepositoryResult<App>;
  updateDraft(id: string, data: UpdateAppDto): RepositoryResult<App>;
  validateForPublish(app: App): Result<void, AppError>;
  publish(id: string): RepositoryResult<App>;
  unpublish(id: string): RepositoryResult<App>;
  archive(id: string): RepositoryResult<App>;
  restore(id: string, targetStatus?: AppStatus): RepositoryResult<App>;
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

import type { AnalyticsEvent, AppAnalyticsAggregate } from '@/types/analytics.types';
import type { CreateAnalyticsEventDto } from './analytics.repository';

/**
 * Analytics Repository Contract
 */
export interface IAnalyticsRepository {
  logEvent(data: CreateAnalyticsEventDto): Promise<RepositoryResult<AnalyticsEvent>>;
  getAppStats(appId: string): Promise<RepositoryResult<AppAnalyticsAggregate | null>>;
  incrementStats(
    appId: string,
    metric: 'views' | 'actions' | 'library' | 'feedback',
    amount?: number
  ): Promise<RepositoryResult<void>>;
  listEvents(appId?: string, options?: QueryOptions): PaginatedRepositoryResult<AnalyticsEvent>;
}

import type {
  AppFeedback,
  AppRatingAggregate,
  FeedbackModerationStatus,
} from '@/types/feedback.types';
import type { SubmitFeedbackDto, UpdateFeedbackDto } from './feedback.repository';

/**
 * App Feedback & Rating Repository Contract
 */
export interface IFeedbackRepository {
  getDeterministicId(userId: string, appId: string): string;
  submitFeedback(
    userId: string,
    data: SubmitFeedbackDto,
    userInfo?: { displayName?: string; photoUrl?: string }
  ): Promise<RepositoryResult<AppFeedback>>;
  updateFeedback(
    userId: string,
    appId: string,
    data: UpdateFeedbackDto
  ): Promise<RepositoryResult<AppFeedback>>;
  getUserFeedback(userId: string, appId: string): Promise<RepositoryResult<AppFeedback | null>>;
  listApprovedByApp(appId: string, options?: QueryOptions): PaginatedRepositoryResult<AppFeedback>;
  listAllForModeration(options?: QueryOptions): PaginatedRepositoryResult<AppFeedback>;
  moderate(
    feedbackId: string,
    status: FeedbackModerationStatus,
    adminId: string
  ): Promise<RepositoryResult<AppFeedback>>;
  deleteFeedback(userId: string, appId: string): Promise<RepositoryResult<void>>;
  getAppRatingAggregate(appId: string): Promise<RepositoryResult<AppRatingAggregate | null>>;
  updateAppRatingAggregate(
    appId: string,
    oldRating: number | null,
    newRating: number | null
  ): Promise<RepositoryResult<AppRatingAggregate>>;
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
  getUserLibrary(
    userId: string,
    options?: QueryOptions
  ): PaginatedRepositoryResult<UserLibraryItem>;
  getLibrary(userId: string): PaginatedRepositoryResult<UserLibraryItem>;
  addToLibrary(
    userId: string,
    item: {
      appId: string;
      isFavorite?: boolean;
      isPinned?: boolean;
      customNotes?: string;
    }
  ): RepositoryResult<UserLibraryItem>;
  removeFromLibrary(userId: string, appId: string): RepositoryResult<void>;
  isInLibrary(userId: string, appId: string): RepositoryResult<boolean>;
  getLibraryCount(userId: string): RepositoryResult<number>;
  toggleFavorite(userId: string, appId: string): RepositoryResult<boolean>;
}

import type { BlogPostStatus, BlogCategory, BlogTag } from '@/types/blog.types';

export type CreateBlogCategoryDto = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
  isActive?: boolean;
};

export type UpdateBlogCategoryDto = Partial<CreateBlogCategoryDto> & {
  deletedAt?: number;
};

/**
 * Blog Category Repository Contract
 */
export interface IBlogCategoryRepository extends IRepository<
  BlogCategory,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto
> {
  findBySlug(slug: string): RepositoryResult<BlogCategory | null>;
  findActive(options?: QueryOptions): PaginatedRepositoryResult<BlogCategory>;
  deactivate(id: string): RepositoryResult<BlogCategory>;
  checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean>;
}

export type CreateBlogTagDto = {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateBlogTagDto = Partial<CreateBlogTagDto> & {
  deletedAt?: number;
};

/**
 * Blog Tag Repository Contract
 */
export interface IBlogTagRepository extends IRepository<
  BlogTag,
  CreateBlogTagDto,
  UpdateBlogTagDto
> {
  findBySlug(slug: string): RepositoryResult<BlogTag | null>;
  findActive(options?: QueryOptions): PaginatedRepositoryResult<BlogTag>;
  deactivate(id: string): RepositoryResult<BlogTag>;
  checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean>;
}

export type CreateBlogPostDto = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  authorId?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  category: string;
  categoryId?: string;
  tags?: readonly string[];
  isFeatured?: boolean;
  readingTime?: number;
  readingTimeMinutes?: number;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  socialImageUrl?: string;
};

export type UpdateBlogPostDto = Partial<CreateBlogPostDto> & {
  status?: BlogPostStatus;
  publishedAt?: number;
  updatedAt?: number;
  archivedAt?: number;
  deletedAt?: number;
};

/**
 * Blog Repository Contract
 */
export interface IBlogRepository extends IRepository<
  BlogPost,
  CreateBlogPostDto,
  UpdateBlogPostDto
> {
  findBySlug(slug: string): RepositoryResult<BlogPost | null>;
  createDraft(data: CreateBlogPostDto): RepositoryResult<BlogPost>;
  publish(id: string): RepositoryResult<BlogPost>;
  unpublish(id: string): RepositoryResult<BlogPost>;
  archive(id: string): RepositoryResult<BlogPost>;
  restore(id: string, targetStatus?: BlogPostStatus): RepositoryResult<BlogPost>;
  listPublished(options?: QueryOptions): PaginatedRepositoryResult<BlogPost>;
  listLatest(limit?: number): PaginatedRepositoryResult<BlogPost>;
  listFeatured(limit?: number): PaginatedRepositoryResult<BlogPost>;
  listByCategory(category: string, options?: QueryOptions): PaginatedRepositoryResult<BlogPost>;
  listByTag(tag: string, options?: QueryOptions): PaginatedRepositoryResult<BlogPost>;
  checkSlugUnique(slug: string, excludeId?: string): RepositoryResult<boolean>;
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
 * Audit Log Repository Contract (Append-Only)
 */
export interface IAuditLogRepository {
  logAction(entry: Omit<AuditLog, 'id' | 'timestamp'>): RepositoryResult<AuditLog>;
  findRecent(options?: QueryOptions): PaginatedRepositoryResult<AuditLog>;
}
