/// <reference types="vite/client" />
import { z } from 'zod';

/**
 * Site URL and SEO Configuration Schema
 */
export const siteConfigSchema = z.object({
  siteOrigin: z
    .string()
    .url()
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'Site origin must start with http:// or https://',
    })
    .transform((url) => url.replace(/\/+$/, '')), // Strip trailing slashes
  siteName: z.string().min(1),
  siteTagline: z.string().min(1),
  siteDescription: z.string().min(1),
  defaultOgImage: z.string().min(1),
  twitterHandle: z.string().regex(/^@[A-Za-z0-9_]{1,15}$/),
  environment: z.enum(['development', 'staging', 'production', 'test']),
});

export type SiteConfig = z.infer<typeof siteConfigSchema> & {
  readonly sitemapUrl: string;
  readonly robotsUrl: string;
};

/**
 * Resolves the active site origin from environment variables safely
 */
function resolveSiteOrigin(): string {
  // Check browser/vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const raw = import.meta.env.VITE_SITE_ORIGIN || import.meta.env.VITE_PUBLIC_URL;
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
  }

  // Check Node / process.env for build tools and test scripts
  if (typeof process !== 'undefined' && process.env) {
    const raw = process.env.VITE_SITE_ORIGIN || process.env.SITE_ORIGIN;
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
  }

  return 'https://elsesourav.com';
}

function resolveEnvironment(): 'development' | 'staging' | 'production' | 'test' {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.MODE === 'test') return 'test';
    if (import.meta.env.PROD) return 'production';
    if (import.meta.env.VITE_APP_ENV === 'staging') return 'staging';
    return 'development';
  }

  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NODE_ENV === 'test') return 'test';
    if (process.env.NODE_ENV === 'production') return 'production';
  }

  return 'development';
}

const rawConfig = {
  siteOrigin: resolveSiteOrigin(),
  siteName: 'ElseSourav',
  siteTagline: 'Developer & Software Platform',
  siteDescription:
    'ElseSourav — Developer and software platform publishing apps, games, extensions, tools, and engineering articles.',
  defaultOgImage: 'https://elsesourav.com/og-default.png',
  twitterHandle: '@elsesourav',
  environment: resolveEnvironment(),
};

const parsedConfig = siteConfigSchema.parse(rawConfig);

export const siteConfig: SiteConfig = Object.freeze({
  ...parsedConfig,
  sitemapUrl: `${parsedConfig.siteOrigin}/sitemap.xml`,
  robotsUrl: `${parsedConfig.siteOrigin}/robots.txt`,
});
