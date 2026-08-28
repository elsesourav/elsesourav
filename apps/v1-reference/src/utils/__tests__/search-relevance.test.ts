import { describe, it, expect } from 'vitest';
import {
  normalizeSearchQuery,
  extractSearchTokens,
  calculateRelevance,
} from '@/utils/search-relevance';

describe('Search Relevance Engine (Prompt 52)', () => {
  describe('Query Normalization & Token Extraction', () => {
    it('1. Trims leading and trailing whitespace and collapses multiple spaces', () => {
      expect(normalizeSearchQuery('   hello    world   ')).toBe('hello world');
    });

    it('2. Normalizes uppercase to lowercase and handles punctuation', () => {
      expect(normalizeSearchQuery('CLOUD-TERMINAL: Pro!')).toBe('cloud-terminal pro');
    });

    it('3. Splits query into distinct alphanumeric tokens', () => {
      const tokens = extractSearchTokens('cloud terminal ssh');
      expect(tokens).toEqual(['cloud', 'terminal', 'ssh']);
    });
  });

  describe('Relevance Scoring Hierarchy', () => {
    const tokens = extractSearchTokens('cloud terminal');

    it('4. Tier 1: Exact title match receives highest score (>= 100)', () => {
      const result = calculateRelevance('cloud terminal', tokens, {
        title: 'Cloud Terminal',
        slug: 'cloud-terminal',
        description: 'Developer SSH client',
        category: 'developer-tools',
        tags: ['ssh'],
        isApp: true,
      });

      expect(result).not.toBeNull();
      expect(result?.matchReason).toBe('exact_title');
      expect(result?.score).toBeGreaterThanOrEqual(100);
    });

    it('5. Tier 2: Title prefix match receives high score (>= 80)', () => {
      const result = calculateRelevance('cloud', ['cloud'], {
        title: 'Cloud Terminal Pro',
        slug: 'cloud-terminal-pro',
        description: 'Developer SSH client',
        category: 'developer-tools',
        tags: ['ssh'],
        isApp: true,
      });

      expect(result).not.toBeNull();
      expect(result?.matchReason).toBe('prefix_title');
      expect(result?.score).toBeGreaterThanOrEqual(80);
    });

    it('6. Tier 3: Title contains query receives score >= 60', () => {
      const result = calculateRelevance('terminal', ['terminal'], {
        title: 'Fast Cloud Terminal',
        slug: 'fast-cloud-terminal',
        description: 'Web client',
        category: 'developer-tools',
        isApp: true,
      });

      expect(result).not.toBeNull();
      expect(result?.matchReason).toBe('title_contains');
      expect(result?.score).toBeGreaterThanOrEqual(60);
    });

    it('7. Tier 4: Tag/Category match receives score >= 40', () => {
      const result = calculateRelevance('ssh', ['ssh'], {
        title: 'Remote Shell Connector',
        slug: 'remote-shell-connector',
        description: 'Remote tool',
        category: 'developer-tools',
        tags: ['ssh', 'terminal'],
        isApp: true,
      });

      expect(result).not.toBeNull();
      expect(result?.matchReason).toBe('tag_match');
      expect(result?.score).toBeGreaterThanOrEqual(40);
    });

    it('8. Tier 5: Description match receives score >= 20', () => {
      const result = calculateRelevance('latency', ['latency'], {
        title: 'Performance Benchmark',
        slug: 'performance-benchmark',
        description: 'Benchmark for low latency applications',
        category: 'engineering',
        isApp: false,
      });

      expect(result).not.toBeNull();
      expect(result?.matchReason).toBe('content_match');
      expect(result?.score).toBeGreaterThanOrEqual(20);
    });

    it('9. Returns null when required tokens do not match', () => {
      const result = calculateRelevance('unrelated query', ['unrelated', 'query'], {
        title: 'Cloud Terminal',
        slug: 'cloud-terminal',
        description: 'Developer tool',
      });

      expect(result).toBeNull();
    });
  });
});
