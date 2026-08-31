import { describe, it, expect } from 'vitest';
import {
  SITE_CONFIG,
  toAbsoluteUrl,
  resolveAppShareImage,
  resolveNoteShareImage,
  buildAppMetadata,
  buildNoteMetadata,
  buildHelpArticleMetadata,
  buildPageMetadata,
} from '@elsesourav/config';

describe('Universal Content-Aware Share Preview Metadata System', () => {
  describe('toAbsoluteUrl helper', () => {
    it('prepends canonical SITE_CONFIG.url to relative paths', () => {
      expect(toAbsoluteUrl('/apps/spectralens-ai')).toBe(
        'https://elsesourav.com/apps/spectralens-ai'
      );
      expect(toAbsoluteUrl('notes/nextjs-deepdive')).toBe(
        'https://elsesourav.com/notes/nextjs-deepdive'
      );
    });

    it('preserves valid absolute HTTPS URLs', () => {
      expect(toAbsoluteUrl('https://cdn.elsesourav.com/banners/app.png')).toBe(
        'https://cdn.elsesourav.com/banners/app.png'
      );
    });

    it('sanitizes accidental localhost / development URLs to production canonical', () => {
      expect(toAbsoluteUrl('http://localhost:3000/apps/img-editor')).toBe(
        'https://elsesourav.com/apps/img-editor'
      );
      expect(toAbsoluteUrl('http://127.0.0.1:3000/og-image.png')).toBe(
        'https://elsesourav.com/og-image.png'
      );
    });

    it('falls back to base SITE_CONFIG.url for empty or null inputs', () => {
      expect(toAbsoluteUrl(null)).toBe('https://elsesourav.com');
      expect(toAbsoluteUrl('')).toBe('https://elsesourav.com');
    });
  });

  describe('Image Priority Resolution', () => {
    it('prioritizes explicit featured image for applications', () => {
      const img = resolveAppShareImage({
        name: 'SpectraLens AI',
        featuredImageUrl: '/uploads/spectralens-banner.png',
        iconUrl: '/uploads/spectralens-icon.png',
      });
      expect(img.url).toBe('https://elsesourav.com/uploads/spectralens-banner.png');
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
    });

    it('falls back to icon image when no banner is available for applications', () => {
      const img = resolveAppShareImage({
        name: 'Breakout Ball',
        iconUrl: '/uploads/breakout-icon.png',
      });
      expect(img.url).toBe('https://elsesourav.com/uploads/breakout-icon.png');
      expect(img.width).toBe(512);
      expect(img.height).toBe(512);
    });

    it('falls back to global ElseSourav OpenGraph banner when no app images are present', () => {
      const img = resolveAppShareImage({
        name: 'Utility Tool',
      });
      expect(img.url).toBe('https://elsesourav.com/og-image.png');
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
    });

    it('prioritizes cover image for blog notes and falls back to global banner', () => {
      const noteWithCover = resolveNoteShareImage({
        title: 'Building WASM Pipelines',
        coverImageUrl: '/uploads/wasm-cover.jpg',
      });
      expect(noteWithCover.url).toBe('https://elsesourav.com/uploads/wasm-cover.jpg');

      const noteWithoutCover = resolveNoteShareImage({
        title: 'Quick Engineering Thought',
      });
      expect(noteWithoutCover.url).toBe('https://elsesourav.com/og-image.png');
    });
  });

  describe('Dynamic App Metadata Generation (buildAppMetadata)', () => {
    it('generates rich Open Graph and Twitter card tags from dynamic database app data', () => {
      const meta = buildAppMetadata({
        name: 'SpectraLens AI',
        slug: 'spectralens-ai',
        shortDescription: 'On-device vision intelligence and optical neural engine.',
        featuredImageUrl: '/images/apps/spectralens-hero.png',
        category: { name: 'Artificial Intelligence' },
        tags: [{ tag: { name: 'WASM' } }, { tag: { name: 'Vision' } }],
      });

      expect(meta.title).toBe(`SpectraLens AI — ${SITE_CONFIG.name}`);
      expect(meta.description).toBe('On-device vision intelligence and optical neural engine.');
      expect(meta.alternates?.canonical).toBe('https://elsesourav.com/apps/spectralens-ai');

      // Open Graph
      expect(meta.openGraph?.title).toBe(
        `SpectraLens AI — ${SITE_CONFIG.name} | ${SITE_CONFIG.name}`
      );
      expect(meta.openGraph?.url).toBe('https://elsesourav.com/apps/spectralens-ai');
      expect(meta.openGraph?.type).toBe('article');
      expect(meta.openGraph?.images).toBeDefined();

      // Twitter
      expect(meta.twitter?.card).toBe('summary_large_image');
      expect(meta.twitter?.title).toBe(
        `SpectraLens AI — ${SITE_CONFIG.name} | ${SITE_CONFIG.name}`
      );
    });
  });

  describe('Dynamic Note Metadata Generation (buildNoteMetadata)', () => {
    it('generates complete article Open Graph tags and author credentials', () => {
      const meta = buildNoteMetadata({
        title: 'Understanding React Server Components Architecture',
        slug: 'rsc-architecture',
        excerpt: 'A deep exploration into streaming SSR and server action lifecycles.',
        coverImageUrl: '/blog/rsc-cover.png',
        author: { displayName: 'Sourav Barui' },
        publishedAt: new Date('2026-08-28T12:00:00Z'),
        updatedAt: new Date('2026-08-29T15:00:00Z'),
      });

      expect(meta.title).toBe(
        `Understanding React Server Components Architecture — ${SITE_CONFIG.name} Journal`
      );
      expect(meta.description).toBe(
        'A deep exploration into streaming SSR and server action lifecycles.'
      );
      expect(meta.alternates?.canonical).toBe('https://elsesourav.com/notes/rsc-architecture');

      expect(meta.openGraph?.type).toBe('article');
      expect(meta.openGraph?.publishedTime).toBe('2026-08-28T12:00:00.000Z');
      expect(meta.openGraph?.authors).toContain('Sourav Barui');
      expect(meta.twitter?.card).toBe('summary_large_image');
    });
  });

  describe('Universal Page Metadata Generation (buildPageMetadata)', () => {
    it('builds canonical metadata for homepage and handles search parameter noIndex robots', () => {
      const homeMeta = buildPageMetadata({
        title: `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`,
        description: 'Building software, tools, games, and experiments.',
        path: '/',
      });

      expect(homeMeta.title).toBe(
        `${SITE_CONFIG.name} — Personal Software Studio & Digital Archive`
      );
      expect(homeMeta.alternates?.canonical).toBe('https://elsesourav.com/');
      expect(homeMeta.robots).toEqual({ index: true, follow: true });

      const filteredMeta = buildPageMetadata({
        title: 'Search: "game" in Apps',
        description: 'Filtered results',
        path: '/apps',
        noIndex: true,
      });
      expect(filteredMeta.robots).toEqual({ index: false, follow: false });
    });

    it('generates profile OpenGraph type for the About page', () => {
      const aboutMeta = buildPageMetadata({
        title: 'About Sourav Barui — Independent Software Creator',
        path: '/about',
        type: 'profile',
      });
      expect(aboutMeta.openGraph?.type).toBe('profile');
      expect(aboutMeta.alternates?.canonical).toBe('https://elsesourav.com/about');
    });
  });

  describe('Help Article Metadata Generation (buildHelpArticleMetadata)', () => {
    it('generates documentation article metadata with category breadcrumb canonical url', () => {
      const helpMeta = buildHelpArticleMetadata({
        title: 'Authentication & Session Troubleshooting',
        slug: 'auth-troubleshooting',
        categorySlug: 'troubleshooting',
        summary: 'Step-by-step resolution for authentication cookie states.',
      });

      expect(helpMeta.title).toBe(
        `Authentication & Session Troubleshooting — ${SITE_CONFIG.name} Help`
      );
      expect(helpMeta.alternates?.canonical).toBe(
        'https://elsesourav.com/help/troubleshooting/auth-troubleshooting'
      );
    });
  });
});
