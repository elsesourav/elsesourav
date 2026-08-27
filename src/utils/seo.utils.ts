import type { App } from '@/types/app.types';
import type { BlogPost } from '@/types/blog.types';
import type { HelpArticle } from '@/types/help.types';
import type { SEOConfig } from '@/types/seo.types';

export const SITE_ORIGIN = 'https://elsesourav.com';
export const SITE_NAME = 'ElseSourav';
export const DEFAULT_TAGLINE = 'Developer & Software Platform';
export const DEFAULT_DESCRIPTION =
  'ElseSourav — Developer and software platform publishing apps, games, extensions, tools, and engineering articles.';
export const DEFAULT_OG_IMAGE = 'https://elsesourav.com/og-default.png';
export const DEFAULT_LOCALE = 'en_US';
export const TWITTER_HANDLE = '@elsesourav';

/**
 * Formats standard page titles: "<Title> | ElseSourav" or exact title
 */
export function formatPageTitle(title?: string, exactTitle?: boolean): string {
  if (!title || !title.trim()) {
    return `${SITE_NAME} — ${DEFAULT_TAGLINE}`;
  }
  if (exactTitle || title.includes(SITE_NAME)) {
    return title.trim();
  }
  return `${title.trim()} | ${SITE_NAME}`;
}

/**
 * Strips query parameters, search tokens, and hashes to construct a stable canonical URL.
 * Rejects unsafe schemas and external origins from untrusted input.
 */
export function normalizeCanonicalUrl(pathOrUrl?: string): string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') {
    return SITE_ORIGIN;
  }

  const clean = pathOrUrl.trim();

  // Guard against malicious protocols
  if (clean.toLowerCase().startsWith('javascript:') || clean.toLowerCase().startsWith('data:')) {
    return SITE_ORIGIN;
  }

  try {
    // If it's already an absolute URL
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const parsed = new URL(clean);
      // Strip search query params and hash
      const cleanPath = parsed.pathname.replace(/\/+$/, '') || '/';
      return `${SITE_ORIGIN}${cleanPath === '/' ? '' : cleanPath}`;
    }

    // Relative path handling
    const pathWithoutParams = clean.split('?')[0]?.split('#')[0] || '';
    const formattedPath = pathWithoutParams.startsWith('/') ? pathWithoutParams : `/${pathWithoutParams}`;
    const normalized = formattedPath.replace(/\/+$/, '') || '';
    return `${SITE_ORIGIN}${normalized}`;
  } catch {
    return SITE_ORIGIN;
  }
}

/**
 * Safely serializes JSON-LD structured data escaping dangerous HTML/script characters.
 */
export function serializeJsonLd(data: unknown): string {
  if (!data) return '';
  const jsonString = JSON.stringify(data);
  return jsonString
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Builds standard App Detail SEO metadata and valid SoftwareApplication JSON-LD
 */
export function buildAppSEO(app?: App | null): SEOConfig {
  if (!app) {
    return {
      title: 'Application Not Found',
      description: 'The requested software application could not be found.',
      noIndex: true,
    };
  }

  const isPublished = app.status === 'published' && !app.deletedAt;
  const canonicalPath = `/apps/${app.slug}`;
  const appTitle = app.name;
  const appDesc = app.shortDescription || app.description;

  // Build SoftwareApplication structured data if published using only real data
  const structuredData: Record<string, unknown> | undefined = isPublished
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: app.name,
        description: app.shortDescription || app.description,
        applicationCategory: app.primaryCategory,
        operatingSystem: (app.platforms || []).join(', ') || 'Web',
        softwareVersion: app.currentVersion || undefined,
        author: {
          '@type': 'Person',
          name: 'Sourav',
          url: SITE_ORIGIN,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }
    : undefined;

  return {
    title: appTitle,
    description: appDesc,
    canonicalPath,
    noIndex: !isPublished,
    openGraph: {
      title: `${app.name} — Applications | ${SITE_NAME}`,
      description: appDesc,
      url: `${SITE_ORIGIN}${canonicalPath}`,
      image: app.iconUrl || DEFAULT_OG_IMAGE,
      type: 'website',
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${app.name} — Applications | ${SITE_NAME}`,
      description: appDesc,
      image: app.iconUrl || DEFAULT_OG_IMAGE,
      site: TWITTER_HANDLE,
    },
    structuredData,
  };
}

/**
 * Builds standard Blog Article SEO metadata and valid Article JSON-LD
 */
export function buildBlogPostSEO(post?: BlogPost | null): SEOConfig {
  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested engineering blog article could not be found.',
      noIndex: true,
    };
  }

  const isPublished = post.status === 'published' && !post.deletedAt;
  const canonicalPath = `/blog/${post.slug}`;
  const postDesc = post.excerpt || post.seoDescription || post.title;
  const coverImage = post.coverImageUrl || post.socialImageUrl || DEFAULT_OG_IMAGE;
  const publishedIso = post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined;
  const modifiedIso = post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined;

  const structuredData: Record<string, unknown> | undefined = isPublished
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: postDesc,
        image: coverImage,
        datePublished: publishedIso,
        dateModified: modifiedIso || publishedIso,
        author: {
          '@type': 'Person',
          name: post.authorName || 'Sourav',
          url: SITE_ORIGIN,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_ORIGIN,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_ORIGIN}/favicon.svg`,
          },
        },
      }
    : undefined;

  return {
    title: post.title,
    description: postDesc,
    canonicalPath,
    noIndex: !isPublished,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: postDesc,
      url: `${SITE_ORIGIN}${canonicalPath}`,
      image: coverImage,
      type: 'article',
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
      article: {
        publishedTime: publishedIso,
        modifiedTime: modifiedIso,
        author: post.authorName || 'Sourav',
        section: post.category,
        tags: post.tags,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: postDesc,
      image: coverImage,
      site: TWITTER_HANDLE,
    },
    structuredData,
  };
}

/**
 * Builds standard Help Article SEO metadata
 */
export function buildHelpArticleSEO(article?: HelpArticle | null): SEOConfig {
  if (!article) {
    return {
      title: 'Help Article Not Found',
      description: 'The requested help documentation guide could not be found.',
      noIndex: true,
    };
  }

  const isPublished = article.status === 'published' && !article.deletedAt;
  const canonicalPath = `/help/${article.categoryId}/${article.slug}`;
  const articleDesc = article.excerpt || article.seoDescription || article.title;
  const publishedIso = article.createdAt ? new Date(article.createdAt).toISOString() : undefined;
  const modifiedIso = article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined;

  const structuredData: Record<string, unknown> | undefined = isPublished
    ? {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: article.title,
        description: articleDesc,
        datePublished: publishedIso,
        dateModified: modifiedIso || publishedIso,
        author: {
          '@type': 'Person',
          name: 'Sourav',
          url: SITE_ORIGIN,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_ORIGIN,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_ORIGIN}${canonicalPath}`,
        },
      }
    : undefined;

  return {
    title: article.title,
    description: articleDesc,
    canonicalPath,
    noIndex: !isPublished,
    openGraph: {
      title: `${article.title} — Help & Documentation | ${SITE_NAME}`,
      description: articleDesc,
      url: `${SITE_ORIGIN}${canonicalPath}`,
      type: 'article',
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
    },
    twitter: {
      card: 'summary',
      title: `${article.title} — Help & Documentation | ${SITE_NAME}`,
      description: articleDesc,
      site: TWITTER_HANDLE,
    },
    structuredData,
  };
}
