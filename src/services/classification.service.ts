import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult } from '@/repositories/types';
import {
  categoryRepository,
  tagRepository,
  type ICategoryRepository,
  type ITagRepository,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type CreateTagDto,
  type UpdateTagDto,
} from '@/repositories';
import { err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';
import { slugify, isValidSlug } from '@/utils/slug';

export type { CreateCategoryDto, UpdateCategoryDto, CreateTagDto, UpdateTagDto };

export interface IClassificationService {
  // Categories
  getCategoryById(id: string): Promise<Result<Category | null, AppError>>;
  getCategoryBySlug(slug: string): Promise<Result<Category | null, AppError>>;
  listActiveCategories(): Promise<Result<PaginatedResult<Category>, AppError>>;
  createCategory(data: CreateCategoryDto): Promise<Result<Category, AppError>>;
  updateCategory(id: string, data: UpdateCategoryDto): Promise<Result<Category, AppError>>;
  deactivateCategory(id: string): Promise<Result<Category, AppError>>;

  // Tags
  getTagById(id: string): Promise<Result<Tag | null, AppError>>;
  getTagBySlug(slug: string): Promise<Result<Tag | null, AppError>>;
  listActiveTags(): Promise<Result<PaginatedResult<Tag>, AppError>>;
  createTag(data: CreateTagDto): Promise<Result<Tag, AppError>>;
  updateTag(id: string, data: UpdateTagDto): Promise<Result<Tag, AppError>>;
  deactivateTag(id: string): Promise<Result<Tag, AppError>>;
}

export class ClassificationService implements IClassificationService {
  constructor(
    private readonly categoryRepo: ICategoryRepository = categoryRepository,
    private readonly tagRepo: ITagRepository = tagRepository
  ) {}

  // ===========================================================================
  // CATEGORIES
  // ===========================================================================

  public async getCategoryById(id: string): Promise<Result<Category | null, AppError>> {
    return this.categoryRepo.findById(id);
  }

  public async getCategoryBySlug(slug: string): Promise<Result<Category | null, AppError>> {
    return this.categoryRepo.findBySlug(slug);
  }

  public async listActiveCategories(): Promise<Result<PaginatedResult<Category>, AppError>> {
    return this.categoryRepo.findActive();
  }

  public async createCategory(data: CreateCategoryDto): Promise<Result<Category, AppError>> {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    if (!isValidSlug(slug)) {
      return err(ErrorFactory.badRequest('Invalid slug generated for category', 'slug'));
    }

    const isUnique = await this.categoryRepo.checkSlugUnique(slug);
    if (!isUnique.success) {
      return err(isUnique.error);
    }

    if (!isUnique.data) {
      return err(
        ErrorFactory.badRequest(`A category with the slug "${slug}" already exists.`, 'slug')
      );
    }

    return this.categoryRepo.create({
      ...data,
      slug,
    });
  }

  public async updateCategory(
    id: string,
    data: UpdateCategoryDto
  ): Promise<Result<Category, AppError>> {
    if (data.slug) {
      const slug = slugify(data.slug);
      if (!isValidSlug(slug)) {
        return err(ErrorFactory.badRequest('Invalid slug provided for category', 'slug'));
      }

      const isUnique = await this.categoryRepo.checkSlugUnique(slug, id);
      if (!isUnique.success) {
        return err(isUnique.error);
      }

      if (!isUnique.data) {
        return err(
          ErrorFactory.badRequest(`A category with the slug "${slug}" already exists.`, 'slug')
        );
      }

      return this.categoryRepo.update(id, {
        ...data,
        slug,
      });
    }

    return this.categoryRepo.update(id, data);
  }

  public async deactivateCategory(id: string): Promise<Result<Category, AppError>> {
    return this.categoryRepo.deactivate(id);
  }

  // ===========================================================================
  // TAGS
  // ===========================================================================

  public async getTagById(id: string): Promise<Result<Tag | null, AppError>> {
    return this.tagRepo.findById(id);
  }

  public async getTagBySlug(slug: string): Promise<Result<Tag | null, AppError>> {
    return this.tagRepo.findBySlug(slug);
  }

  public async listActiveTags(): Promise<Result<PaginatedResult<Tag>, AppError>> {
    return this.tagRepo.findActive();
  }

  public async createTag(data: CreateTagDto): Promise<Result<Tag, AppError>> {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    if (!isValidSlug(slug)) {
      return err(ErrorFactory.badRequest('Invalid slug generated for tag', 'slug'));
    }

    const isUnique = await this.tagRepo.checkSlugUnique(slug);
    if (!isUnique.success) {
      return err(isUnique.error);
    }

    if (!isUnique.data) {
      return err(ErrorFactory.badRequest(`A tag with the slug "${slug}" already exists.`, 'slug'));
    }

    return this.tagRepo.create({
      ...data,
      slug,
    });
  }

  public async updateTag(id: string, data: UpdateTagDto): Promise<Result<Tag, AppError>> {
    if (data.slug) {
      const slug = slugify(data.slug);
      if (!isValidSlug(slug)) {
        return err(ErrorFactory.badRequest('Invalid slug provided for tag', 'slug'));
      }

      const isUnique = await this.tagRepo.checkSlugUnique(slug, id);
      if (!isUnique.success) {
        return err(isUnique.error);
      }

      if (!isUnique.data) {
        return err(
          ErrorFactory.badRequest(`A tag with the slug "${slug}" already exists.`, 'slug')
        );
      }

      return this.tagRepo.update(id, {
        ...data,
        slug,
      });
    }

    return this.tagRepo.update(id, data);
  }

  public async deactivateTag(id: string): Promise<Result<Tag, AppError>> {
    return this.tagRepo.deactivate(id);
  }
}

export const classificationService = new ClassificationService();
