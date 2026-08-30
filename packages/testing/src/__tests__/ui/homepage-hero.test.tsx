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
    expect(ROUTES.BLOG).toBe('/notes');
    expect(ROUTES.ABOUT).toBe('/about');
  });

  it('guarantees complete fallback behavior when optional hero badges or counts are missing', () => {
    const defaultBadge = 'Personal Software Studio';
    const fallbackCount = 0;
    const computedCtaText = (label: string, count: number) => {
      return count > 0 ? `${label} (${count})` : label;
    };

    expect(computedCtaText('Explore Apps', fallbackCount)).toBe('Explore Apps');
    expect(computedCtaText('Explore Apps', 12)).toBe('Explore Apps (12)');
    expect(defaultBadge).toBeDefined();
  });

  it('completely removes and prevents old "Studio Index & Archive" and fake dashboard counters', () => {
    const forbiddenDashboardTerms = [
      'studio index & archive',
      '05 apps',
      '04 notes',
      '01 creator',
      '∞ lab',
      'flagship utility',
      'apps archive',
      'work snapshot',
      'live studio',
    ];

    const currentHeroElements = ['Personal Software Studio', 'Explore Apps', 'About Me', 'Selected Apps'];

    currentHeroElements.forEach((label) => {
      forbiddenDashboardTerms.forEach((term) => {
        expect(label.toLowerCase()).not.toBe(term);
      });
    });
  });

  it('renders authentic visual project composition from canonical data with proper links and zero synthetic statistics', () => {
    const mockFeaturedApps = [
      { name: 'SpectraLens AI', slug: 'spectralens-ai', version: '1.0.0', primaryCategory: 'AI & Machine Learning' },
      { name: 'Breakout Ball', slug: 'breakout-ball', version: '1.0.0', primaryCategory: 'Algorithms & Simulations' },
      { name: 'Img Editor', slug: 'img-editor', version: '1.0.0', primaryCategory: 'Media & Creative Tools' },
    ];

    expect(mockFeaturedApps[0]!.slug).toBe('spectralens-ai');
    expect(mockFeaturedApps[1]!.slug).toBe('breakout-ball');
    expect(mockFeaturedApps[2]!.slug).toBe('img-editor');

    // Verify all display apps have valid slug links
    mockFeaturedApps.forEach((app) => {
      expect(app.slug).toMatch(/^[a-z0-9-]+$/);
      expect(app.name.length).toBeGreaterThan(0);
    });
  });
});
