import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { sitemapService } from '@/services/sitemap.service';
import { siteConfig } from '@/config/site.config';

async function run(): Promise<void> {
  console.info('[Sitemap] Generating public sitemap.xml and robots.txt for ElseSourav...');
  console.info(`[Sitemap] Configured Public Site Origin: ${siteConfig.siteOrigin}`);

  const result = await sitemapService.generateProductionSitemap();

  const rootDir = process.cwd();
  const publicDir = resolve(rootDir, 'public');
  const distDir = resolve(rootDir, 'dist');

  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Write to public/ directory
  writeFileSync(resolve(publicDir, 'sitemap.xml'), result.sitemapXml, 'utf-8');
  writeFileSync(resolve(publicDir, 'robots.txt'), result.robotsTxt, 'utf-8');
  console.info(`[Sitemap] Successfully wrote to public/ (Entries: ${result.entryCount})`);

  // If dist/ directory exists, write directly to dist/ as well
  if (existsSync(distDir)) {
    writeFileSync(resolve(distDir, 'sitemap.xml'), result.sitemapXml, 'utf-8');
    writeFileSync(resolve(distDir, 'robots.txt'), result.robotsTxt, 'utf-8');
    console.info(`[Sitemap] Successfully synced to dist/`);
  }

  console.info(`[Sitemap] Finished public URL discovery generation.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[Sitemap] Fatal generation error:', err);
  process.exit(1);
});
