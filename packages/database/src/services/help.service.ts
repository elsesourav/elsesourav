import { AppError } from '@elsesourav/types';
import { generateHelpSlug } from '@elsesourav/validation';
import type { HelpRepository } from '../repositories/help.repository';
import type {
  HelpCategory as DomainHelpCategory,
  HelpCategoryWithArticles,
  HelpArticleListItem,
  PublicHelpArticle,
  HelpArticle as DomainHelpArticle,
  CreateHelpCategoryInput,
  UpdateHelpCategoryInput,
  CreateHelpArticleInput,
  UpdateHelpArticleInput,
  HelpSearchInput,
  HelpSearchResult,
  UserRole,
} from '@elsesourav/types';

export class HelpService {
  constructor(private readonly helpRepo: HelpRepository) {}

  private verifyAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN') {
      throw AppError.forbidden('Administrative privileges are required for this action.');
    }
  }

  // ==========================================
  // Public Query Operations
  // ==========================================

  /**
   * Retrieves all public Help Categories with published article counts and previews
   */
  async listPublicCategories(): Promise<HelpCategoryWithArticles[]> {
    return this.helpRepo.findPublicCategories();
  }

  /**
   * Retrieves a Help Category by slug with its published articles
   */
  async getCategoryBySlug(slug: string): Promise<HelpCategoryWithArticles> {
    const cleanSlug = slug.toLowerCase().trim();
    const category = await this.helpRepo.findCategoryBySlug(cleanSlug);

    if (!category) {
      throw AppError.notFound(`Help category '${slug}' was not found.`);
    }

    return category;
  }

  /**
   * Retrieves a published Help Article by slug
   */
  async getArticleBySlug(slug: string): Promise<PublicHelpArticle> {
    const cleanSlug = slug.toLowerCase().trim();
    const article = await this.helpRepo.findArticleBySlug(cleanSlug);

    if (!article) {
      throw AppError.notFound(`Help article '${slug}' was not found or is not published.`);
    }

    return article;
  }

  /**
   * Searches published Help Articles
   */
  async searchArticles(input: HelpSearchInput): Promise<HelpSearchResult> {
    if (!input.query || input.query.trim().length === 0) {
      return { items: [], totalCount: 0, query: '' };
    }

    return this.helpRepo.searchPublicArticles(input);
  }

  /**
   * Retrieves related published Help Articles in the same category
   */
  async getRelatedArticles(
    articleId: string,
    categoryId: string,
    limit: number = 3
  ): Promise<HelpArticleListItem[]> {
    return this.helpRepo.findRelatedArticles(articleId, categoryId, limit);
  }

  /**
   * Submits a helpfulness vote
   */
  async voteHelpful(articleId: string, isHelpful: boolean): Promise<void> {
    await this.helpRepo.voteHelpful(articleId, isHelpful);
  }

  // ==========================================
  // Admin Mutation Operations
  // ==========================================

  /**
   * Creates a new Help Category (ADMIN only)
   */
  async createCategory(
    callerRole: UserRole | string | undefined,
    input: CreateHelpCategoryInput
  ): Promise<DomainHelpCategory> {
    this.verifyAdmin(callerRole);

    const slug = input.slug ? generateHelpSlug(input.slug) : generateHelpSlug(input.name);
    return this.helpRepo.createCategory(input, slug);
  }

  /**
   * Updates an existing Help Category (ADMIN only)
   */
  async updateCategory(
    callerRole: UserRole | string | undefined,
    id: string,
    input: UpdateHelpCategoryInput
  ): Promise<DomainHelpCategory> {
    this.verifyAdmin(callerRole);

    const data: UpdateHelpCategoryInput = { ...input };
    if (input.slug) {
      data.slug = generateHelpSlug(input.slug);
    } else if (input.name) {
      data.slug = generateHelpSlug(input.name);
    }

    return this.helpRepo.updateCategory(id, data);
  }

  /**
   * Creates a new Help Article in DRAFT status (ADMIN only)
   */
  async createArticle(
    callerUserId: string,
    callerRole: UserRole | string | undefined,
    input: CreateHelpArticleInput
  ): Promise<DomainHelpArticle> {
    this.verifyAdmin(callerRole);

    const slug = input.slug ? generateHelpSlug(input.slug) : generateHelpSlug(input.title);
    return this.helpRepo.createArticle(input, slug, callerUserId);
  }

  /**
   * Updates an existing Help Article (ADMIN only)
   */
  async updateArticle(
    callerRole: UserRole | string | undefined,
    id: string,
    input: UpdateHelpArticleInput
  ): Promise<DomainHelpArticle> {
    this.verifyAdmin(callerRole);

    const data: UpdateHelpArticleInput = { ...input };
    if (input.slug) {
      data.slug = generateHelpSlug(input.slug);
    } else if (input.title) {
      data.slug = generateHelpSlug(input.title);
    }

    return this.helpRepo.updateArticle(id, data);
  }

  /**
   * Publishes a Help Article (ADMIN only)
   */
  async publishArticle(
    callerRole: UserRole | string | undefined,
    id: string
  ): Promise<DomainHelpArticle> {
    this.verifyAdmin(callerRole);
    return this.helpRepo.publishArticle(id);
  }

  /**
   * Archives a Help Article (ADMIN only)
   */
  async archiveArticle(
    callerRole: UserRole | string | undefined,
    id: string
  ): Promise<DomainHelpArticle> {
    this.verifyAdmin(callerRole);
    return this.helpRepo.archiveArticle(id);
  }
}
