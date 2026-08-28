import { describe, it, expect } from 'vitest';
import { executeDatabaseSeed } from '../../scripts/seed-firestore';
import { validateDatabaseIntegrity } from '../../scripts/validate-database';
import {
  SYSTEM_CATEGORIES,
  SYSTEM_TAGS,
  SYSTEM_HELP_CATEGORIES,
  SYSTEM_HELP_ARTICLES,
  SAMPLE_DEV_APPS,
} from '@/config/database-seed.data';
import fs from 'node:fs';
import path from 'node:path';

describe('Firestore Database Initialization & Production Readiness (Prompt 86)', () => {
  describe('Task 3 & 4: Safe Seeding & Production Guards', () => {
    it('throws a production safety error when seeding production without confirmation', () => {
      expect(() =>
        executeDatabaseSeed({
          env: 'production',
          confirmProduction: false,
        })
      ).toThrowError(/PRODUCTION SAFETY GUARD/);
    });

    it('successfully seeds baseline system data when production confirmation is provided', () => {
      const result = executeDatabaseSeed({
        env: 'production',
        confirmProduction: true,
      });

      expect(result.environment).toBe('production');
      expect(result.categoriesCreated).toBe(SYSTEM_CATEGORIES.length);
      expect(result.tagsCreated).toBe(SYSTEM_TAGS.length);
      expect(result.helpCategoriesCreated).toBe(SYSTEM_HELP_CATEGORIES.length);
      expect(result.helpArticlesCreated).toBe(SYSTEM_HELP_ARTICLES.length);
      // Sample apps and blog posts must NEVER be seeded to production
      expect(result.sampleAppsCreated).toBe(0);
      expect(result.sampleBlogCreated).toBe(0);
    });

    it('seeds sample demo applications and devlogs in development environment', () => {
      const result = executeDatabaseSeed({
        env: 'development',
      });

      expect(result.environment).toBe('development');
      expect(result.categoriesCreated).toBe(SYSTEM_CATEGORIES.length);
      expect(result.sampleAppsCreated).toBe(SAMPLE_DEV_APPS.length);
      expect(result.sampleAppsCreated).toBeGreaterThan(0);
    });

    it('executes idempotently without errors when invoked multiple times', () => {
      const run1 = executeDatabaseSeed({ env: 'test' });
      const run2 = executeDatabaseSeed({ env: 'test' });

      expect(run1.categoriesCreated).toBe(run2.categoriesCreated);
      expect(run1.errors.length).toBe(0);
      expect(run2.errors.length).toBe(0);
    });
  });

  describe('Task 8: Required Firestore Composite Indexes', () => {
    it('validates firestore.indexes.json structure and required compound indexes', () => {
      const indexesPath = path.resolve(process.cwd(), 'firestore.indexes.json');
      expect(fs.existsSync(indexesPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
      expect(content.indexes).toBeDefined();
      expect(content.indexes.length).toBeGreaterThanOrEqual(5);

      const collections = content.indexes.map((idx: { collectionGroup: string }) => idx.collectionGroup);
      expect(collections).toContain('apps');
      expect(collections).toContain('blog_posts');
      expect(collections).toContain('help_articles');
      expect(collections).toContain('support_tickets');
      expect(collections).toContain('audit_logs');
    });
  });

  describe('Task 7 & 10: Database Referential Integrity Validation', () => {
    it('validates that baseline system entities pass all relational and URL checks', () => {
      const report = validateDatabaseIntegrity();

      expect(report.isValid).toBe(true);
      expect(report.duplicateSlugs.length).toBe(0);
      expect(report.brokenReferences.length).toBe(0);
      expect(report.invalidUrls.length).toBe(0);
      expect(report.missingFields.length).toBe(0);
      expect(report.totalEntitiesChecked).toBeGreaterThan(10);
    });
  });
});
