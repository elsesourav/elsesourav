import { describe, it, expect } from 'vitest';
import { normalizeTimestamp, isValidTimestamp, formatIsoTimestamp } from '@/utils/timestamp.utils';
import { SlugSchema, FlexibleTimestampSchema } from '@/schemas/common.schema';
import { appStatusSchema, createAppSchema } from '@/schemas/app.schema';
import { blogStatusSchema } from '@/schemas/blog.schema';

describe('Long-Term Database Integrity & Schema Evolution (Prompt 87)', () => {
  describe('Task 6: Standardized Timestamp Normalization', () => {
    it('normalizes numeric milliseconds without alteration', () => {
      const ms = 1724580000000;
      expect(normalizeTimestamp(ms)).toBe(ms);
    });

    it('normalizes 10-digit unix seconds into milliseconds', () => {
      const seconds = 1724580000;
      expect(normalizeTimestamp(seconds)).toBe(1724580000000);
    });

    it('normalizes ISO 8601 string dates into epoch milliseconds', () => {
      const iso = '2026-08-25T10:00:00.000Z';
      const expected = Date.parse(iso);
      expect(normalizeTimestamp(iso)).toBe(expected);
    });

    it('normalizes Firestore Timestamp-like objects with seconds and nanoseconds', () => {
      const firestoreTs = { seconds: 1724580000, nanoseconds: 500000000 };
      expect(normalizeTimestamp(firestoreTs)).toBe(1724580000500);
    });

    it('normalizes Firestore Timestamp-like objects with toMillis() method', () => {
      const firestoreTsWithMethod = {
        seconds: 1724580000,
        nanoseconds: 0,
        toMillis: () => 1724580000000,
      };
      expect(normalizeTimestamp(firestoreTsWithMethod)).toBe(1724580000000);
    });

    it('returns custom fallback when timestamp input is invalid or null', () => {
      const fallback = 1700000000000;
      expect(normalizeTimestamp(null, fallback)).toBe(fallback);
      expect(normalizeTimestamp(undefined, fallback)).toBe(fallback);
      expect(normalizeTimestamp('invalid-date-string', fallback)).toBe(fallback);
    });

    it('formats normalized timestamp as ISO string', () => {
      const ms = 1724580000000;
      expect(formatIsoTimestamp(ms)).toBe(new Date(ms).toISOString());
    });

    it('validates timestamp inputs using isValidTimestamp', () => {
      expect(isValidTimestamp(1724580000000)).toBe(true);
      expect(isValidTimestamp('2026-08-25T10:00:00.000Z')).toBe(true);
      expect(isValidTimestamp({ seconds: 1724580000, nanoseconds: 0 })).toBe(true);
      expect(isValidTimestamp(null)).toBe(false);
      expect(isValidTimestamp('not-a-date')).toBe(false);
    });

    it('coerces flexible timestamps in Zod schema', () => {
      const res1 = FlexibleTimestampSchema.parse(1724580000000);
      expect(res1).toBe(1724580000000);

      const res2 = FlexibleTimestampSchema.parse('2026-08-25T10:00:00.000Z');
      expect(res2).toBe(Date.parse('2026-08-25T10:00:00.000Z'));

      const res3 = FlexibleTimestampSchema.parse({ seconds: 1724580000, nanoseconds: 0 });
      expect(res3).toBe(1724580000000);
    });
  });

  describe('Task 8: Public Slug Stability & Validation', () => {
    it('accepts valid lowercase kebab-case slugs', () => {
      expect(SlugSchema.parse('developer-tools')).toBe('developer-tools');
      expect(SlugSchema.parse('terminal-pro')).toBe('terminal-pro');
      expect(SlugSchema.parse('react-19-architecture')).toBe('react-19-architecture');
      expect(SlugSchema.parse('cli')).toBe('cli');
    });

    it('rejects invalid slugs with uppercase letters, spaces, or illegal punctuation', () => {
      expect(() => SlugSchema.parse('Developer-Tools')).toThrow();
      expect(() => SlugSchema.parse('terminal pro')).toThrow();
      expect(() => SlugSchema.parse('terminal_pro')).toThrow();
      expect(() => SlugSchema.parse('terminal-pro/')).toThrow();
      expect(() => SlugSchema.parse('')).toThrow();
    });
  });

  describe('Task 7: Strongly Typed Status Enums', () => {
    it('accepts valid app publication status values', () => {
      expect(appStatusSchema.parse('draft')).toBe('draft');
      expect(appStatusSchema.parse('published')).toBe('published');
      expect(appStatusSchema.parse('archived')).toBe('archived');
    });

    it('rejects invalid app status values', () => {
      expect(() => appStatusSchema.parse('deleted')).toThrow();
      expect(() => appStatusSchema.parse('pending')).toThrow();
      expect(() => appStatusSchema.parse('')).toThrow();
    });

    it('accepts valid blog status values', () => {
      expect(blogStatusSchema.parse('draft')).toBe('draft');
      expect(blogStatusSchema.parse('published')).toBe('published');
      expect(blogStatusSchema.parse('archived')).toBe('archived');
    });
  });

  describe('Task 5 & 10: Backward Compatibility & Schema Evolution', () => {
    it('safely parses legacy document shape with default values for newer fields', () => {
      // Legacy document from older version (missing stats, screenshots default, isFeatured default)
      const legacyAppDoc = {
        slug: 'legacy-terminal',
        name: 'Legacy Terminal',
        shortDescription: 'Legacy terminal emulator',
        description: 'Detailed description of legacy tool',
        iconUrl: 'https://example.com/icon.png',
        primaryCategory: 'cat-developer-tools',
        platforms: ['macos'],
      };

      const parsed = createAppSchema.parse(legacyAppDoc);
      expect(parsed.name).toBe('Legacy Terminal');
      expect(parsed.status).toBe('draft'); // Defaulted
      expect(parsed.isFeatured).toBe(false); // Defaulted
      expect(parsed.stats.views).toBe(0); // Defaulted
      expect(parsed.screenshots).toEqual([]); // Defaulted
      expect(parsed.tags).toEqual([]); // Defaulted
    });

    it('rejects invalid document with missing required primaryCategory or name', () => {
      const invalidDoc = {
        slug: 'broken-app',
        description: 'Missing name and primary category',
        iconUrl: 'https://example.com/icon.png',
        platforms: ['macos'],
      };

      expect(() => createAppSchema.parse(invalidDoc)).toThrow();
    });
  });
});
