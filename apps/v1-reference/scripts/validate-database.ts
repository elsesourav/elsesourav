import {
  SYSTEM_CATEGORIES,
  SYSTEM_TAGS,
  SYSTEM_HELP_CATEGORIES,
  SYSTEM_HELP_ARTICLES,
  SAMPLE_DEV_APPS,
  SAMPLE_DEV_APP_VERSIONS,
  SAMPLE_DEV_BLOG_POSTS,
} from '../src/config/database-seed.data';
import { isSafeUrl } from '../src/utils/url-safety';

export interface DatabaseValidationReport {
  isValid: boolean;
  totalEntitiesChecked: number;
  duplicateSlugs: string[];
  brokenReferences: string[];
  invalidUrls: string[];
  missingFields: string[];
}

export function validateDatabaseIntegrity(): DatabaseValidationReport {
  const report: DatabaseValidationReport = {
    isValid: true,
    totalEntitiesChecked: 0,
    duplicateSlugs: [],
    brokenReferences: [],
    invalidUrls: [],
    missingFields: [],
  };

  const categoryIds = new Set(SYSTEM_CATEGORIES.map((c) => c.id));
  const tagIds = new Set(SYSTEM_TAGS.map((t) => t.id));
  const helpCategoryIds = new Set(SYSTEM_HELP_CATEGORIES.map((hc) => hc.id));
  const appIds = new Set(SAMPLE_DEV_APPS.map((a) => a.id));

  const checkedSlugs = new Set<string>();

  const checkSlug = (slug: string, collection: string) => {
    report.totalEntitiesChecked++;
    const key = `${collection}:${slug}`;
    if (checkedSlugs.has(key)) {
      report.duplicateSlugs.push(`Duplicate slug detected: ${key}`);
    } else {
      checkedSlugs.add(key);
    }
  };

  // 1. Categories
  for (const cat of SYSTEM_CATEGORIES) {
    checkSlug(cat.slug, 'categories');
    if (!cat.name || !cat.id) {
      report.missingFields.push(`Category missing required name or ID: ${JSON.stringify(cat)}`);
    }
  }

  // 2. Tags
  for (const tag of SYSTEM_TAGS) {
    checkSlug(tag.slug, 'tags');
    if (!tag.name || !tag.id) {
      report.missingFields.push(`Tag missing required name or ID: ${JSON.stringify(tag)}`);
    }
  }

  // 3. Help Categories
  for (const hc of SYSTEM_HELP_CATEGORIES) {
    checkSlug(hc.slug, 'help_categories');
    if (!hc.name || !hc.id) {
      report.missingFields.push(`Help Category missing name or ID: ${JSON.stringify(hc)}`);
    }
  }

  // 4. Help Articles
  for (const art of SYSTEM_HELP_ARTICLES) {
    checkSlug(art.slug, 'help_articles');
    if (!helpCategoryIds.has(art.categoryId)) {
      report.brokenReferences.push(
        `Help Article ${art.id} references non-existent Help Category ${art.categoryId}`
      );
    }
  }

  // 5. Sample Dev Apps
  for (const app of SAMPLE_DEV_APPS) {
    checkSlug(app.slug, 'apps');
    if (!categoryIds.has(app.primaryCategory)) {
      report.brokenReferences.push(
        `App ${app.id} references non-existent Category ${app.primaryCategory}`
      );
    }
    for (const tagId of app.tags) {
      if (!tagIds.has(tagId)) {
        report.brokenReferences.push(`App ${app.id} references non-existent Tag ${tagId}`);
      }
    }
    if (app.iconUrl && !isSafeUrl(app.iconUrl)) {
      report.invalidUrls.push(`App ${app.id} has unsafe iconUrl: ${app.iconUrl}`);
    }
    for (const ss of app.screenshots) {
      if (!isSafeUrl(ss)) {
        report.invalidUrls.push(`App ${app.id} has unsafe screenshot URL: ${ss}`);
      }
    }
  }

  // 6. Sample Dev App Versions
  for (const ver of SAMPLE_DEV_APP_VERSIONS) {
    report.totalEntitiesChecked++;
    if (!appIds.has(ver.appId)) {
      report.brokenReferences.push(`App Version ${ver.id} references non-existent App ${ver.appId}`);
    }
    if (ver.downloadUrl && !isSafeUrl(ver.downloadUrl)) {
      report.invalidUrls.push(`App Version ${ver.id} has unsafe download URL: ${ver.downloadUrl}`);
    }
  }

  // 7. Sample Dev Blog Posts
  for (const post of SAMPLE_DEV_BLOG_POSTS) {
    checkSlug(post.slug, 'blog_posts');
    if (post.categoryId && !categoryIds.has(post.categoryId)) {
      report.brokenReferences.push(
        `Blog Post ${post.id} references non-existent Category ${post.categoryId}`
      );
    }
  }

  report.isValid =
    report.duplicateSlugs.length === 0 &&
    report.brokenReferences.length === 0 &&
    report.invalidUrls.length === 0 &&
    report.missingFields.length === 0;

  return report;
}

const report = validateDatabaseIntegrity();
// eslint-disable-next-line no-console
console.info(`[Database Validation] Checked ${report.totalEntitiesChecked} database entities.`);
if (report.isValid) {
  // eslint-disable-next-line no-console
  console.info('✓ All relationships, slugs, URLs, and required fields are 100% valid.');
} else {
  // eslint-disable-next-line no-console
  console.error('❌ Database integrity issues discovered:', report);
  process.exit(1);
}
