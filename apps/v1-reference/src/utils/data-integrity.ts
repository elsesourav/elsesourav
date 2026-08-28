import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { SupportTicket } from '@/types/support.types';
import type { AuditLog } from '@/types/audit.types';

export interface IntegrityIssue {
  readonly severity: 'error' | 'warning';
  readonly collection: string;
  readonly documentId: string;
  readonly field: string;
  readonly message: string;
}

export interface IntegrityReport {
  readonly isValid: boolean;
  readonly timestamp: number;
  readonly totalChecked: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly issues: readonly IntegrityIssue[];
}

export interface DatasetForValidation {
  readonly apps?: readonly App[];
  readonly categories?: readonly Category[];
  readonly tags?: readonly Tag[];
  readonly blogPosts?: readonly BlogPost[];
  readonly helpArticles?: readonly HelpArticle[];
  readonly helpCategories?: readonly HelpCategory[];
  readonly supportTickets?: readonly SupportTicket[];
  readonly auditLogs?: readonly AuditLog[];
}

/**
 * Validates cross-entity referential integrity across platform collections
 * Non-destructive and read-only.
 */
export function validateDatasetIntegrity(dataset: DatasetForValidation): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  let totalChecked = 0;

  // 1. Build Category and Tag Lookup Sets
  const validCategorySlugs = new Set<string>();
  const validCategoryIds = new Set<string>();
  if (dataset.categories) {
    for (const cat of dataset.categories) {
      if (cat.slug) validCategorySlugs.add(cat.slug.toLowerCase());
      if (cat.id) validCategoryIds.add(cat.id);
    }
  }

  const validTagSlugs = new Set<string>();
  if (dataset.tags) {
    for (const tag of dataset.tags) {
      if (tag.slug) validTagSlugs.add(tag.slug.toLowerCase());
    }
  }

  const validHelpCategoryIds = new Set<string>();
  const validHelpCategorySlugs = new Set<string>();
  if (dataset.helpCategories) {
    for (const hCat of dataset.helpCategories) {
      if (hCat.id) validHelpCategoryIds.add(hCat.id);
      if (hCat.slug) validHelpCategorySlugs.add(hCat.slug.toLowerCase());
    }
  }

  // 2. Validate Apps
  if (dataset.apps) {
    for (const app of dataset.apps) {
      totalChecked++;
      if (!app.id) {
        issues.push({
          severity: 'error',
          collection: 'apps',
          documentId: 'unknown',
          field: 'id',
          message: 'App document is missing mandatory ID',
        });
      }

      if (!app.slug || app.slug.trim().length === 0) {
        issues.push({
          severity: 'error',
          collection: 'apps',
          documentId: app.id || 'unknown',
          field: 'slug',
          message: 'App is missing a valid URL slug',
        });
      }

      // Check category reference if categories are provided
      if (dataset.categories && dataset.categories.length > 0 && app.primaryCategory) {
        if (!validCategorySlugs.has(app.primaryCategory.toLowerCase())) {
          issues.push({
            severity: 'warning',
            collection: 'apps',
            documentId: app.id,
            field: 'primaryCategory',
            message: `App references non-existent or inactive category "${app.primaryCategory}"`,
          });
        }
      }

      // Check tags
      if (dataset.tags && dataset.tags.length > 0 && Array.isArray(app.tags)) {
        for (const tag of app.tags) {
          if (!validTagSlugs.has(tag.toLowerCase())) {
            issues.push({
              severity: 'warning',
              collection: 'apps',
              documentId: app.id,
              field: 'tags',
              message: `App references unindexed tag "${tag}"`,
            });
          }
        }
      }
    }
  }

  // 3. Validate Blog Posts
  if (dataset.blogPosts) {
    for (const post of dataset.blogPosts) {
      totalChecked++;
      if (!post.id || !post.slug) {
        issues.push({
          severity: 'error',
          collection: 'blogPosts',
          documentId: post.id || 'unknown',
          field: 'slug',
          message: 'Blog post is missing mandatory ID or slug',
        });
      }

      if (!post.authorId || !post.authorName) {
        issues.push({
          severity: 'warning',
          collection: 'blogPosts',
          documentId: post.id,
          field: 'author',
          message: 'Blog post is missing author metadata',
        });
      }
    }
  }

  // 4. Validate Help Articles
  if (dataset.helpArticles) {
    for (const article of dataset.helpArticles) {
      totalChecked++;
      if (!article.id || !article.slug) {
        issues.push({
          severity: 'error',
          collection: 'helpArticles',
          documentId: article.id || 'unknown',
          field: 'slug',
          message: 'Help article is missing mandatory ID or slug',
        });
      }

      if (
        dataset.helpCategories &&
        dataset.helpCategories.length > 0 &&
        article.categoryId &&
        !validHelpCategoryIds.has(article.categoryId) &&
        !validHelpCategorySlugs.has(article.categoryId.toLowerCase())
      ) {
        issues.push({
          severity: 'warning',
          collection: 'helpArticles',
          documentId: article.id,
          field: 'categoryId',
          message: `Help article references unknown category ID "${article.categoryId}"`,
        });
      }
    }
  }

  // 5. Validate Support Tickets
  if (dataset.supportTickets) {
    for (const ticket of dataset.supportTickets) {
      totalChecked++;
      if (!ticket.id || !ticket.userId || !ticket.userEmail) {
        issues.push({
          severity: 'error',
          collection: 'supportTickets',
          documentId: ticket.id || 'unknown',
          field: 'userId/userEmail',
          message: 'Support ticket is missing user ownership fields',
        });
      }
    }
  }

  // 6. Validate Audit Logs
  if (dataset.auditLogs) {
    for (const log of dataset.auditLogs) {
      totalChecked++;
      if (!log.id || !log.actorUserId || !log.action || !log.entityType) {
        issues.push({
          severity: 'error',
          collection: 'auditLogs',
          documentId: log.id || 'unknown',
          field: 'auditMetadata',
          message: 'Audit log is missing actorUserId, action, or entityType metadata',
        });
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    isValid: errorCount === 0,
    timestamp: Date.now(),
    totalChecked,
    errorCount,
    warningCount,
    issues,
  };
}
