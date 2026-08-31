import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Dynamic Content-Aware Social Image System (Prompt 3 of 5)', () => {
  const webAppDir = path.resolve(__dirname, '../../../../../apps/web');

  it('verifies root opengraph-image.tsx is configured with 1200x630 dimensions', () => {
    const rootOgPath = path.join(webAppDir, 'app/opengraph-image.tsx');
    expect(fs.existsSync(rootOgPath)).toBe(true);

    const content = fs.readFileSync(rootOgPath, 'utf8');
    expect(content).toContain('width: 1200');
    expect(content).toContain('height: 630');
    expect(content).toContain("contentType = 'image/png'");
    expect(content).toContain('ImageResponse');
  });

  it('verifies App-specific opengraph-image.tsx is configured with 1200x630 dimensions and dynamic app loader', () => {
    const appOgPath = path.join(webAppDir, 'app/(public)/apps/[slug]/opengraph-image.tsx');
    expect(fs.existsSync(appOgPath)).toBe(true);

    const content = fs.readFileSync(appOgPath, 'utf8');
    expect(content).toContain('width: 1200');
    expect(content).toContain('height: 630');
    expect(content).toContain('getPublicAppBySlug');
    expect(content).toContain('ImageResponse');
  });

  it('verifies Note-specific opengraph-image.tsx is configured with 1200x630 dimensions and dynamic post loader', () => {
    const blogOgPath = path.join(webAppDir, 'app/(public)/notes/[slug]/opengraph-image.tsx');
    expect(fs.existsSync(blogOgPath)).toBe(true);

    const content = fs.readFileSync(blogOgPath, 'utf8');
    expect(content).toContain('width: 1200');
    expect(content).toContain('height: 630');
    expect(content).toContain('getPublicBlogPostBySlug');
    expect(content).toContain('ImageResponse');
  });

  it('verifies About page opengraph-image.tsx is configured with 1200x630 dimensions', () => {
    const aboutOgPath = path.join(webAppDir, 'app/(public)/about/opengraph-image.tsx');
    expect(fs.existsSync(aboutOgPath)).toBe(true);

    const content = fs.readFileSync(aboutOgPath, 'utf8');
    expect(content).toContain('width: 1200');
    expect(content).toContain('height: 630');
    expect(content).toContain('ImageResponse');
  });

  it('verifies static fallback og-image.png exists at 1200x630 in public directory', () => {
    const ogPath = path.join(webAppDir, 'public/og-image.png');
    expect(fs.existsSync(ogPath)).toBe(true);
    const stats = fs.statSync(ogPath);
    expect(stats.size).toBeGreaterThan(50000);
  });

  it('verifies that dynamic image generators do not expose private database or auth credentials', () => {
    const ogFiles = [
      path.join(webAppDir, 'app/opengraph-image.tsx'),
      path.join(webAppDir, 'app/(public)/apps/[slug]/opengraph-image.tsx'),
      path.join(webAppDir, 'app/(public)/notes/[slug]/opengraph-image.tsx'),
      path.join(webAppDir, 'app/(public)/about/opengraph-image.tsx'),
    ];

    ogFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('password');
      expect(content).not.toContain('secret');
      expect(content).not.toContain('PRIVATE_');
      expect(content).not.toContain('DATABASE_URL');
    });
  });
});
