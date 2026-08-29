import { describe, it, expect } from 'vitest';
import {
  isSafeUrl,
  sanitizeUrl,
  slugify,
  isValidSemver,
  compareSemver,
  calculateRelevanceScore,
  formatDate,
  formatCompactNumber,
} from '@elsesourav/utils';

describe('URL Safety Utilities', () => {
  it('identifies safe http and https URLs', () => {
    expect(isSafeUrl('https://elsesourav.com')).toBe(true);
    expect(isSafeUrl('http://localhost:3000')).toBe(true);
    expect(isSafeUrl('/apps/terminal')).toBe(true);
    expect(isSafeUrl('#section')).toBe(true);
  });

  it('rejects dangerous javascript: and data: URLs', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('sanitizes unsafe URLs with fallback', () => {
    expect(sanitizeUrl('javascript:void(0)')).toBe('#');
    expect(sanitizeUrl('https://safe.com')).toBe('https://safe.com');
  });
});

describe('Slugification Utilities', () => {
  it('converts titles to clean kebab-case slugs', () => {
    expect(slugify('Terminal Pro v2.0!')).toBe('terminal-pro-v20');
    expect(slugify('  My Awesome App -- 2026 ')).toBe('my-awesome-app-2026');
  });
});

describe('Semver Utilities', () => {
  it('validates semver strings', () => {
    expect(isValidSemver('1.0.0')).toBe(true);
    expect(isValidSemver('2.1.4-beta.1')).toBe(true);
    expect(isValidSemver('invalid.version')).toBe(false);
  });

  it('compares semver versions correctly', () => {
    expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
  });
});

describe('Search Scoring & Formatting Utilities', () => {
  it('calculates weighted search relevance', () => {
    const scoreExact = calculateRelevanceScore('terminal', { title: 'Terminal', tags: ['cli'] });
    const scorePartial = calculateRelevanceScore('term', { title: 'Terminal Pro' });
    expect(scoreExact).toBeGreaterThan(scorePartial);
  });

  it('formats dates and compact numbers', () => {
    expect(typeof formatDate(Date.now())).toBe('string');
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(2500000)).toBe('2.5M');
  });
});

describe('Sanitization Utilities', () => {
  it('strips dangerous script tags and event handlers', async () => {
    const { sanitizeHtml, sanitizePlainText } = await import('@elsesourav/utils');
    const dirty = '<p>Hello <script>alert("xss")</script><span onclick="stealCookies()">World</span></p>';
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('onclick');
    expect(cleaned).toContain('<p>Hello <span>World</span></p>');

    const plain = sanitizePlainText('<b>Bold text</b> with <i>styles</i> & tags');
    expect(plain).toBe('Bold text with styles & tags');
  });

  it('strips javascript: URLs and dangerous embeds', async () => {
    const { sanitizeHtml } = await import('@elsesourav/utils');
    const dirty = '<a href="javascript:alert(1)">Link</a><iframe src="https://evil.com"></iframe>';
    const cleaned = sanitizeHtml(dirty);
    expect(cleaned).not.toContain('javascript:');
    expect(cleaned).not.toContain('<iframe');
  });
});

describe('Rate Limiter Utilities', () => {
  it('enforces request rate limits correctly', async () => {
    const { createRateLimiter } = await import('@elsesourav/utils');
    const limiter = createRateLimiter({ max: 3, windowMs: 10000 });

    expect(limiter.consume('user-1').success).toBe(true);
    expect(limiter.consume('user-1').success).toBe(true);
    expect(limiter.consume('user-1').success).toBe(true);
    expect(limiter.consume('user-1').success).toBe(false);
    expect(limiter.consume('user-2').success).toBe(true);
    limiter.destroy();
  });
});

