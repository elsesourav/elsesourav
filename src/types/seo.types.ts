/**
 * Standardized SEO Architecture Types
 */

export type RobotsDirective =
  | 'index, follow'
  | 'noindex, follow'
  | 'noindex, nofollow'
  | 'index, nofollow'
  | 'noarchive';

export type OpenGraphType =
  | 'website'
  | 'article'
  | 'profile'
  | 'book'
  | 'product';

export type TwitterCardType =
  | 'summary'
  | 'summary_large_image'
  | 'app';

export interface OpenGraphArticleMeta {
  readonly publishedTime?: string;
  readonly modifiedTime?: string;
  readonly author?: string;
  readonly section?: string;
  readonly tags?: readonly string[];
}

export interface OpenGraphConfig {
  readonly title?: string;
  readonly description?: string;
  readonly url?: string;
  readonly image?: string;
  readonly imageAlt?: string;
  readonly type?: OpenGraphType;
  readonly siteName?: string;
  readonly locale?: string;
  readonly article?: OpenGraphArticleMeta;
}

export interface TwitterConfig {
  readonly card?: TwitterCardType;
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly imageAlt?: string;
  readonly site?: string;
  readonly creator?: string;
}

export interface SEOConfig {
  readonly title?: string;
  readonly exactTitle?: boolean;
  readonly description?: string;
  readonly canonicalPath?: string;
  readonly canonicalUrl?: string;
  readonly robots?: RobotsDirective;
  readonly noIndex?: boolean;
  readonly keywords?: readonly string[];
  readonly openGraph?: OpenGraphConfig;
  readonly twitter?: TwitterConfig;
  readonly structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  readonly locale?: string;
}
