import { describe, it, expect } from 'vitest';
import { appConfig } from '@/config/app.config';
import { PLATFORM_RELEASES, getLatestPlatformRelease } from '@/config/releases.config';
import packageJson from '../../package.json';
import { errorLogger } from '@/services/error-logger.service';

describe('Professional Release Management System (Prompt 79)', () => {
  describe('Task 1: Authoritative Application Versioning', () => {
    it('synchronizes application version with package.json single source of truth', () => {
      expect(appConfig.version).toBe(packageJson.version);
      expect(appConfig.version).toMatch(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/);
    });

    it('attaches the authoritative package version to error telemetry reports', () => {
      const report = errorLogger.logError(new Error('Test error telemetry versioning'));
      expect(report.appVersion).toBe(packageJson.version);
    });
  });

  describe('Task 2 & 3: Platform Changelog & Release Notes Metadata', () => {
    it('maintains structured platform release notes conforming to SemVer standard', () => {
      expect(PLATFORM_RELEASES.length).toBeGreaterThan(0);

      const latest = getLatestPlatformRelease();
      expect(latest.version).toBe(packageJson.version);
      expect(latest.title).toBeDefined();
      expect(latest.summary).toBeDefined();
      expect(latest.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(latest.highlights.length).toBeGreaterThan(0);
    });

    it('contains categorized entries conforming to Keep a Changelog standard', () => {
      const latest = getLatestPlatformRelease();
      expect(latest.categories).toBeDefined();
      expect(latest.categories.added).toBeDefined();
      expect(latest.categories.added?.length).toBeGreaterThan(0);
      expect(latest.categories.security?.length).toBeGreaterThan(0);
      expect(latest.categories.performance?.length).toBeGreaterThan(0);
    });
  });
});
