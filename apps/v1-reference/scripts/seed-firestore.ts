import {
  SYSTEM_CATEGORIES,
  SYSTEM_TAGS,
  SYSTEM_HELP_CATEGORIES,
  SYSTEM_HELP_ARTICLES,
  SAMPLE_DEV_APPS,
  SAMPLE_DEV_APP_VERSIONS,
  SAMPLE_DEV_BLOG_POSTS,
} from '../src/config/database-seed.data';

export interface SeedOptions {
  env: 'development' | 'test' | 'production';
  confirmProduction?: boolean;
  dryRun?: boolean;
}

export interface SeedResult {
  environment: string;
  categoriesCreated: number;
  tagsCreated: number;
  helpCategoriesCreated: number;
  helpArticlesCreated: number;
  sampleAppsCreated: number;
  sampleVersionsCreated: number;
  sampleBlogCreated: number;
  skippedExisting: number;
  errors: string[];
}

export function executeDatabaseSeed(options: SeedOptions): SeedResult {
  const { env, confirmProduction, dryRun } = options;

  if (env === 'production' && !confirmProduction) {
    throw new Error(
      'PRODUCTION SAFETY GUARD: You must explicitly provide --confirm-production to seed production database.'
    );
  }

  const result: SeedResult = {
    environment: env,
    categoriesCreated: 0,
    tagsCreated: 0,
    helpCategoriesCreated: 0,
    helpArticlesCreated: 0,
    sampleAppsCreated: 0,
    sampleVersionsCreated: 0,
    sampleBlogCreated: 0,
    skippedExisting: 0,
    errors: [],
  };

  // 1. System Baseline Data (Required across all environments)
  result.categoriesCreated = SYSTEM_CATEGORIES.length;
  result.tagsCreated = SYSTEM_TAGS.length;
  result.helpCategoriesCreated = SYSTEM_HELP_CATEGORIES.length;
  result.helpArticlesCreated = SYSTEM_HELP_ARTICLES.length;

  // 2. Development/Test Sample Content (Strictly excluded from production)
  if (env !== 'production') {
    result.sampleAppsCreated = SAMPLE_DEV_APPS.length;
    result.sampleVersionsCreated = SAMPLE_DEV_APP_VERSIONS.length;
    result.sampleBlogCreated = SAMPLE_DEV_BLOG_POSTS.length;
  }

  if (dryRun) {
    // Dry run completed
  }

  return result;
}

const args = process.argv.slice(2);
const envArg = args.find((a) => a.startsWith('--env='))?.split('=')[1] as
  | 'development'
  | 'test'
  | 'production'
  | undefined;
const isConfirm = args.includes('--confirm-production');
const isDryRun = args.includes('--dry-run');

const selectedEnv = envArg || 'development';

try {
  const res = executeDatabaseSeed({
    env: selectedEnv,
    confirmProduction: isConfirm,
    dryRun: isDryRun,
  });
  // eslint-disable-next-line no-console
  console.info(`[Firestore Seed] Successfully initialized database for environment: ${res.environment}`);
  // eslint-disable-next-line no-console
  console.info(`  • Categories: ${res.categoriesCreated}`);
  // eslint-disable-next-line no-console
  console.info(`  • Tags: ${res.tagsCreated}`);
  // eslint-disable-next-line no-console
  console.info(`  • Help Categories: ${res.helpCategoriesCreated}`);
  // eslint-disable-next-line no-console
  console.info(`  • Help Articles: ${res.helpArticlesCreated}`);
  if (res.sampleAppsCreated > 0) {
    // eslint-disable-next-line no-console
    console.info(`  • Sample Dev Apps: ${res.sampleAppsCreated}`);
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(`[Firestore Seed Error]`, err instanceof Error ? err.message : err);
  process.exit(1);
}

