import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassificationService } from '../classification.service';
import type {
  ICategoryRepository,
  ITagRepository,
  CreateCategoryDto,
  CreateTagDto,
} from '@/repositories';
import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import { ok } from '@/lib/result';
import { createCategorySchema, createTagSchema } from '@/schemas/classification.schema';
import { slugify, isValidSlug } from '@/utils/slug';

describe('ClassificationService & Taxonomy System', () => {
  let mockCategoryRepo: ICategoryRepository;
  let mockTagRepo: ITagRepository;
  let classificationService: ClassificationService;

  const mockCategory: Category = {
    id: 'cat-web-apps',
    name: 'Web Applications',
    slug: 'web-apps',
    description: 'High-performance web apps built with modern web technologies.',
    icon: 'globe',
    orderIndex: 1,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockTag: Tag = {
    id: 'tag-calculator',
    name: 'Calculator',
    slug: 'calculator',
    description: 'Math, scientific, and financial calculators.',
    color: '#3b82f6',
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  beforeEach(() => {
    mockCategoryRepo = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findActive: vi.fn(),
      deactivate: vi.fn(),
      checkSlugUnique: vi.fn(),
    } as unknown as ICategoryRepository;

    mockTagRepo = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findActive: vi.fn(),
      deactivate: vi.fn(),
      checkSlugUnique: vi.fn(),
    } as unknown as ITagRepository;

    classificationService = new ClassificationService(mockCategoryRepo, mockTagRepo);
  });

  describe('1. Slug Utility & Normalization', () => {
    it('generates clean, URL-friendly kebab-case slugs from diverse inputs', () => {
      expect(slugify('Web Apps')).toBe('web-apps');
      expect(slugify('Web Applications')).toBe('web-applications');
      expect(slugify('Chrome & Browser Extensions!')).toBe('chrome-browser-extensions');
      expect(slugify('  Developer Tools 2.0  ')).toBe('developer-tools-20');
      expect(slugify('AI / Machine Learning')).toBe('ai-machine-learning');
    });

    it('accurately validates slug format', () => {
      expect(isValidSlug('web-apps')).toBe(true);
      expect(isValidSlug('developer-tools-20')).toBe(true);
      expect(isValidSlug('Invalid Slug')).toBe(false);
      expect(isValidSlug('slug_with_underscores')).toBe(false);
      expect(isValidSlug('-leading-hyphen')).toBe(false);
      expect(isValidSlug('')).toBe(false);
    });
  });

  describe('2. Category Creation and Validation', () => {
    it('creates a category when slug is unique', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Web Applications',
        slug: 'web-apps',
        description: 'High-performance web apps.',
        orderIndex: 1,
        isActive: true,
      };

      vi.mocked(mockCategoryRepo.checkSlugUnique).mockResolvedValue(ok(true));
      vi.mocked(mockCategoryRepo.create).mockResolvedValue(ok({ ...mockCategory, ...createDto }));

      const result = await classificationService.createCategory(createDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Web Applications');
        expect(result.data.slug).toBe('web-apps');
      }
      expect(mockCategoryRepo.checkSlugUnique).toHaveBeenCalledWith('web-apps');
      expect(mockCategoryRepo.create).toHaveBeenCalled();
    });

    it('rejects category creation if slug already exists', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Web Applications',
        slug: 'web-apps',
        orderIndex: 1,
        isActive: true,
      };

      vi.mocked(mockCategoryRepo.checkSlugUnique).mockResolvedValue(ok(false));

      const result = await classificationService.createCategory(createDto);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('BAD_REQUEST');
        expect(result.error.message).toContain('already exists');
      }
      expect(mockCategoryRepo.create).not.toHaveBeenCalled();
    });

    it('rejects invalid category schema (e.g. empty name or invalid slug)', () => {
      const invalidCategory = {
        name: '',
        slug: 'INVALID SLUG',
      };

      const parsed = createCategorySchema.safeParse(invalidCategory);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const errorFields = parsed.error.issues.map((e) => e.path[0]);
        expect(errorFields).toContain('name');
        expect(errorFields).toContain('slug');
      }
    });
  });

  describe('3. Tag Creation and Validation', () => {
    it('creates a tag when slug is unique', async () => {
      const createDto: CreateTagDto = {
        name: 'Calculator',
        slug: 'calculator',
        description: 'Math calculators.',
        isActive: true,
      };

      vi.mocked(mockTagRepo.checkSlugUnique).mockResolvedValue(ok(true));
      vi.mocked(mockTagRepo.create).mockResolvedValue(ok({ ...mockTag, ...createDto }));

      const result = await classificationService.createTag(createDto);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Calculator');
        expect(result.data.slug).toBe('calculator');
      }
      expect(mockTagRepo.checkSlugUnique).toHaveBeenCalledWith('calculator');
    });

    it('rejects duplicate tag slugs', async () => {
      const createDto: CreateTagDto = {
        name: 'Calculator',
        slug: 'calculator',
        isActive: true,
      };

      vi.mocked(mockTagRepo.checkSlugUnique).mockResolvedValue(ok(false));

      const result = await classificationService.createTag(createDto);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('BAD_REQUEST');
        expect(result.error.message).toContain('already exists');
      }
      expect(mockTagRepo.create).not.toHaveBeenCalled();
    });

    it('rejects invalid tag schema', () => {
      const invalidTag = {
        name: '',
        slug: 'bad slug',
      };

      const parsed = createTagSchema.safeParse(invalidTag);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const errorFields = parsed.error.issues.map((e) => e.path[0]);
        expect(errorFields).toContain('name');
        expect(errorFields).toContain('slug');
      }
    });
  });

  describe('4. Active Category & Tag Discovery Queries', () => {
    it('lists only active categories ordered by index', async () => {
      vi.mocked(mockCategoryRepo.findActive).mockResolvedValue(
        ok({
          items: [mockCategory],
          hasMore: false,
        })
      );

      const result = await classificationService.listActiveCategories();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.items[0]?.isActive).toBe(true);
      }
      expect(mockCategoryRepo.findActive).toHaveBeenCalled();
    });

    it('lists only active tags', async () => {
      vi.mocked(mockTagRepo.findActive).mockResolvedValue(
        ok({
          items: [mockTag],
          hasMore: false,
        })
      );

      const result = await classificationService.listActiveTags();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items[0]?.isActive).toBe(true);
      }
      expect(mockTagRepo.findActive).toHaveBeenCalled();
    });
  });

  describe('5. Deactivation and Lifecycle', () => {
    it('deactivates category by setting isActive to false', async () => {
      const deactivatedCategory: Category = {
        ...mockCategory,
        isActive: false,
        updatedAt: Date.now(),
      };

      vi.mocked(mockCategoryRepo.deactivate).mockResolvedValue(ok(deactivatedCategory));

      const result = await classificationService.deactivateCategory('cat-web-apps');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
      expect(mockCategoryRepo.deactivate).toHaveBeenCalledWith('cat-web-apps');
    });

    it('deactivates tag by setting isActive to false', async () => {
      const deactivatedTag: Tag = {
        ...mockTag,
        isActive: false,
        updatedAt: Date.now(),
      };

      vi.mocked(mockTagRepo.deactivate).mockResolvedValue(ok(deactivatedTag));

      const result = await classificationService.deactivateTag('tag-calculator');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
      expect(mockTagRepo.deactivate).toHaveBeenCalledWith('tag-calculator');
    });
  });
});
