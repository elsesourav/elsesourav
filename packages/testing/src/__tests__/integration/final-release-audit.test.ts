import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  SITE_CONFIG,
  toAbsoluteUrl,
  resolveAppShareImage,
  resolveNoteShareImage,
  buildAppMetadata,
  buildNoteMetadata,
  buildPageMetadata,
  buildHelpArticleMetadata,
} from '@elsesourav/config';

describe('PROMPT 5 OF 5: Final Favicon, SEO, Social Sharing and Release Audit', () => {
  const rootDir = path.resolve(__dirname, '../../../../..');
  const webAppDir = path.join(rootDir, 'apps/web');
  const publicDir = path.join(webAppDir, 'public');

  // 1. Favicon & Brand Icon Audit
  describe('1. Favicon & Canonical Brand Icon Audit', () => {
    it('verifies the official ElseSourav master logo exists in public directory', () => {
      expect(fs.existsSync(path.join(publicDir, 'logo.png'))).toBe(true);
    });

    it('verifies multi-resolution favicon.ico exists in both public/ and app/', () => {
      expect(fs.existsSync(path.join(publicDir, 'favicon.ico'))).toBe(true);
      expect(fs.existsSync(path.join(webAppDir, 'app/favicon.ico'))).toBe(true);
    });

    it('verifies standard raster favicons and apple-touch-icon exist', () => {
      expect(fs.existsSync(path.join(publicDir, 'favicon-16x16.png'))).toBe(true);
      expect(fs.existsSync(path.join(publicDir, 'favicon-32x32.png'))).toBe(true);
      expect(fs.existsSync(path.join(publicDir, 'favicon-48x48.png'))).toBe(true);
      expect(fs.existsSync(path.join(publicDir, 'apple-touch-icon.png'))).toBe(true);
    });

    it('verifies manifest.webmanifest is configured with ElseSourav raster icons', () => {
      const manifestPath = path.join(publicDir, 'manifest.webmanifest');
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expect(manifest.name).toBe('ElseSourav');
      expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    });

    it('verifies that obsolete checkmark and default placeholder SVG icons are removed', () => {
      const obsolete = [
        path.join(publicDir, 'favicon.svg'),
        path.join(publicDir, 'icons/icon-192x192.svg'),
        path.join(publicDir, 'icons/icon-512x512.svg'),
        path.join(publicDir, 'icons/icon-maskable.svg'),
      ];
      obsolete.forEach((file) => {
        expect(fs.existsSync(file)).toBe(false);
      });
    });
  });

  // 2. Content-Aware Distinct Metadata Audit
  describe('2. Content-Aware Distinct Metadata Audit (2 Apps, 2 Notes, About, Help, Home)', () => {
    it('produces genuinely distinct metadata for 2 different Apps', () => {
      const app1 = buildAppMetadata({
        name: 'SpectraLens AI',
        slug: 'spectralens-ai',
        shortDescription: 'Computer vision neural pipeline.',
        featuredImageUrl: '/uploads/spectralens-cover.jpg',
        tags: ['AI', 'Vision'],
      });

      const app2 = buildAppMetadata({
        name: 'Breakout Ball Turbo',
        slug: 'breakout-ball',
        shortDescription: 'Retro 2D arcade breakout physics game.',
        iconUrl: '/uploads/breakout-icon.png',
        tags: ['Game', 'Arcade'],
      });

      expect(app1.title).not.toBe(app2.title);
      expect(app1.description).not.toBe(app2.description);
      expect(app1.alternates?.canonical).not.toBe(app2.alternates?.canonical);
      expect(app1.openGraph?.images?.[0]?.url).not.toBe(app2.openGraph?.images?.[0]?.url);
      expect(app1.alternates?.canonical).toBe('https://elsesourav.com/apps/spectralens-ai');
      expect(app2.alternates?.canonical).toBe('https://elsesourav.com/apps/breakout-ball');
    });

    it('produces genuinely distinct metadata for 2 different Notes', () => {
      const note1 = buildNoteMetadata({
        title: 'Scaling Next.js 15 Server Actions',
        slug: 'scaling-nextjs-15',
        excerpt: 'High-throughput database connection pooling in server actions.',
        publishedAt: '2026-08-01T10:00:00Z',
        author: 'Sourav Barui',
      });

      const note2 = buildNoteMetadata({
        title: 'Sub-Millisecond Browser Vector Search with WASM',
        slug: 'wasm-vector-search',
        excerpt: 'Compiling SIMD-accelerated HNSW index into WebAssembly.',
        publishedAt: '2026-08-15T12:00:00Z',
        author: 'Sourav Barui',
      });

      expect(note1.title).not.toBe(note2.title);
      expect(note1.description).not.toBe(note2.description);
      expect(note1.alternates.canonical).not.toBe(note2.alternates.canonical);
      expect(note1.openGraph.publishedTime).not.toBe(note2.openGraph.publishedTime);
      expect(note1.alternates.canonical).toBe('https://elsesourav.com/blog/scaling-nextjs-15');
      expect(note2.alternates.canonical).toBe('https://elsesourav.com/blog/wasm-vector-search');
    });

    it('produces distinct metadata for About, Help, and Homepage', () => {
      const home = buildPageMetadata({
        title: 'ElseSourav — Personal Software Studio',
        description: 'Building software, tools, and digital systems.',
        path: '/',
      });

      const about = buildPageMetadata({
        title: 'About Sourav Barui',
        description: 'Software engineer and independent creator.',
        path: '/about',
        type: 'profile',
      });

      const help = buildHelpArticleMetadata({
        title: 'Account Security Guide',
        slug: 'account-security',
        categorySlug: 'security',
        summary: 'How to manage multi-factor authentication.',
      });

      expect(home.alternates.canonical).toBe('https://elsesourav.com/');
      expect(about.alternates.canonical).toBe('https://elsesourav.com/about');
      expect(help.alternates.canonical).toBe('https://elsesourav.com/help/security/account-security');
      expect(about.openGraph.type).toBe('profile');
      expect(help.openGraph.type).toBe('article');
      expect(home.openGraph.type).toBe('website');
    });
  });

  // 3. Image Fallback Priority Cascade
  describe('3. Image Priority & Fallback Logic Audit', () => {
    it('verifies App with custom cover uses custom 1200x630 image', () => {
      const img = resolveAppShareImage({
        name: 'Test App',
        featuredImageUrl: '/uploads/custom-cover.jpg',
      });
      expect(img.url).toBe('https://elsesourav.com/uploads/custom-cover.jpg');
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
    });

    it('verifies App with only icon uses 512x512 icon', () => {
      const img = resolveAppShareImage({
        name: 'Test App',
        iconUrl: '/uploads/app-icon.png',
      });
      expect(img.url).toBe('https://elsesourav.com/uploads/app-icon.png');
      expect(img.width).toBe(512);
      expect(img.height).toBe(512);
    });

    it('verifies App with no images falls back to global branded 1200x630 banner', () => {
      const img = resolveAppShareImage({
        name: 'Test App',
      });
      expect(img.url).toBe('https://elsesourav.com/og-image.png');
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
    });

    it('verifies Note with cover image uses cover image', () => {
      const img = resolveNoteShareImage({
        title: 'Test Note',
        coverImageUrl: '/uploads/note-cover.png',
      });
      expect(img.url).toBe('https://elsesourav.com/uploads/note-cover.png');
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
    });

    it('verifies Note without cover image falls back to global branded 1200x630 banner', () => {
      const img = resolveNoteShareImage({
        title: 'Test Note',
      });
      expect(img.url).toBe('https://elsesourav.com/og-image.png');
      expect(img.width).toBe(1200);
      expect(img.height).toBe(630);
    });
  });

  // 4. URL Safety & Host Sanitization
  describe('4. URL Safety and Host Sanitization Audit', () => {
    it('sanitizes relative paths to https://elsesourav.com', () => {
      expect(toAbsoluteUrl('/apps/audio-dsp')).toBe('https://elsesourav.com/apps/audio-dsp');
      expect(toAbsoluteUrl('about')).toBe('https://elsesourav.com/about');
    });

    it('intercepts accidental localhost/127.0.0.1 development URLs and normalizes them', () => {
      expect(toAbsoluteUrl('http://localhost:3000/apps/audio-dsp')).toBe('https://elsesourav.com/apps/audio-dsp');
      expect(toAbsoluteUrl('http://127.0.0.1:8080/blog/post-one')).toBe('https://elsesourav.com/blog/post-one');
    });

    it('preserves valid external HTTPS URLs', () => {
      expect(toAbsoluteUrl('https://images.unsplash.com/photo-123')).toBe('https://images.unsplash.com/photo-123');
    });
  });

  // 5. Native Dynamic OG Generation Endpoints
  describe('5. Native Dynamic OpenGraph Endpoints Audit', () => {
    it('verifies dynamic og generators exist for Root, Apps, Notes, and About', () => {
      const endpoints = [
        path.join(webAppDir, 'app/opengraph-image.tsx'),
        path.join(webAppDir, 'app/(public)/apps/[slug]/opengraph-image.tsx'),
        path.join(webAppDir, 'app/(public)/blog/[slug]/opengraph-image.tsx'),
        path.join(webAppDir, 'app/(public)/about/opengraph-image.tsx'),
      ];

      endpoints.forEach((ep) => {
        expect(fs.existsSync(ep)).toBe(true);
        const content = fs.readFileSync(ep, 'utf8');
        expect(content).toContain('1200');
        expect(content).toContain('630');
      });
    });
  });

  // 6. Navigation and Lab Deprecation Audit
  describe('6. Navigation & Routing Architecture Audit', () => {
    it('verifies public navigation includes Apps, Notes, About, Help and excludes Lab', () => {
      const navPath = path.join(webAppDir, 'components/navigation/PublicHeader.tsx');
      const content = fs.readFileSync(navPath, 'utf8');
      expect(content).toContain('ROUTES.APPS');
      expect(content).toContain('ROUTES.BLOG');
      expect(content).toContain('ROUTES.ABOUT');
      expect(content).not.toMatch(/\/lab["'\s]/);
      expect(content).not.toContain('ROUTES.LAB');
    });
  });
});
