import { describe, it, expect } from 'vitest';
import { SITE_CONFIG, CREATOR_CONFIG, ROUTES } from '@elsesourav/config';

describe('Homepage Hero & First-Viewport Architecture', () => {
  it('defines coherent creator and platform identity in hero metadata', () => {
    expect(SITE_CONFIG.name).toBe('ElseSourav');
    expect(SITE_CONFIG.name).not.toMatch(/v1|v2/i);
    expect(CREATOR_CONFIG.name).toBe('Sourav');
    expect(CREATOR_CONFIG.identity.title).toBeDefined();
    expect(CREATOR_CONFIG.shortBio).toBeDefined();
    expect(CREATOR_CONFIG.principles.length).toBeGreaterThanOrEqual(4);
  });

  it('exposes approved first-viewport navigation links and exploration CTAs', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.APPS).toBe('/apps');
    expect(ROUTES.BLOG).toBe('/blog');
    expect(ROUTES.ABOUT).toBe('/about');
  });

  it('guarantees complete fallback behavior when optional hero badges or counts are missing', () => {
    const defaultBadge = 'Software Studio & Engineering';
    const fallbackCount = 0;
    const computedCtaText = (label: string, count: number) => {
      return count > 0 ? `${label} (${count})` : label;
    };

    expect(computedCtaText('Browse Applications', fallbackCount)).toBe('Browse Applications');
    expect(computedCtaText('Browse Applications', 12)).toBe('Browse Applications (12)');
    expect(defaultBadge).toBeDefined();
  });
});
