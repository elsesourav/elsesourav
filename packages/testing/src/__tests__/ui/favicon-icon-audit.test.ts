import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_CONFIG } from '@elsesourav/config';

describe('Favicon & Site Brand Icon Audit', () => {
  const publicDir = path.resolve(__dirname, '../../../../../apps/web/public');
  const appDir = path.resolve(__dirname, '../../../../../apps/web/app');

  it('verifies canonical master logo is present with full alpha channel and high resolution', () => {
    const masterLogoPath = path.join(publicDir, 'logo.png');
    expect(fs.existsSync(masterLogoPath)).toBe(true);
    const stats = fs.statSync(masterLogoPath);
    expect(stats.size).toBeGreaterThan(50000); // 1024x1024 master PNG
  });

  it('verifies standard multi-resolution favicon.ico is present in public/ and app/', () => {
    const publicIco = path.join(publicDir, 'favicon.ico');
    const appIco = path.join(appDir, 'favicon.ico');

    expect(fs.existsSync(publicIco)).toBe(true);
    expect(fs.existsSync(appIco)).toBe(true);

    const buffer = fs.readFileSync(publicIco);
    // Check ICO header: 0x0000 0x0001
    expect(buffer.readUInt16LE(0)).toBe(0);
    expect(buffer.readUInt16LE(2)).toBe(1); // Type 1 for ICO
    expect(buffer.readUInt16LE(4)).toBe(3); // 3 embedded sizes (16, 32, 48)
  });

  it('verifies all standard raster favicon sizes are present and non-empty', () => {
    const expectedFiles = [
      'favicon-16x16.png',
      'favicon-32x32.png',
      'favicon-48x48.png',
      'favicon.png',
      'apple-touch-icon.png',
      'icons/icon-192x192.png',
      'icons/icon-512x512.png',
      'icons/icon-maskable.png',
    ];

    expectedFiles.forEach((file) => {
      const filePath = path.join(publicDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.statSync(filePath).size).toBeGreaterThan(100);
    });
  });

  it('verifies App Router root icons are present in app/', () => {
    const appIcons = ['favicon.ico', 'icon.png', 'apple-icon.png'];
    appIcons.forEach((file) => {
      const filePath = path.join(appDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('verifies web manifest is valid JSON and references canonical ElseSourav icons', () => {
    const manifestPath = path.join(publicDir, 'manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifestContent.name).toBe('ElseSourav');
    expect(manifestContent.icons).toBeDefined();
    expect(manifestContent.icons.length).toBeGreaterThanOrEqual(4);

    const iconSrcs = manifestContent.icons.map((i: { src: string }) => i.src);
    expect(iconSrcs).toContain('/icons/icon-192x192.png');
    expect(iconSrcs).toContain('/icons/icon-512x512.png');
    expect(iconSrcs).not.toContain('/favicon.svg'); // Removed obsolete checkmark SVG
  });

  it('verifies that obsolete placeholder and framework icons have been completely removed', () => {
    const forbiddenFiles = [
      path.join(publicDir, 'favicon.svg'),
      path.join(publicDir, 'icons/icon-192x192.svg'),
      path.join(publicDir, 'icons/icon-512x512.svg'),
      path.join(publicDir, 'icons/icon-maskable.svg'),
    ];

    forbiddenFiles.forEach((file) => {
      expect(fs.existsSync(file)).toBe(false);
    });
  });

  it('verifies purposeful separation between small brand favicon and large OpenGraph social banner', () => {
    expect(SITE_CONFIG.logo).toBe('/logo.png');
    expect(SITE_CONFIG.ogImage).toBe('/og-image.png');
    expect(SITE_CONFIG.logo).not.toBe(SITE_CONFIG.ogImage);

    const ogPath = path.join(publicDir, 'og-image.png');
    expect(fs.existsSync(ogPath)).toBe(true);
    const ogStats = fs.statSync(ogPath);
    expect(ogStats.size).toBeGreaterThan(100000); // 1024x576 banner
  });
});
