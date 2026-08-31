import { SITE_CONFIG } from './site';

export interface SeoImageDescriptor {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface AppMetadataSource {
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featuredImageUrl?: string | null;
  iconUrl?: string | null;
  category?: { name: string } | string | null;
  tags?: ReadonlyArray<{ tag: { name: string } } | { name: string } | string> | null;
}

export interface NoteMetadataSource {
  title: string;
  slug: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: Date | string | number | null;
  updatedAt?: Date | string | number | null;
  author?: { displayName?: string; name?: string } | string | null;
  tags?: ReadonlyArray<{ tag: { name: string } } | { name: string } | string> | null;
}

export interface HelpArticleMetadataSource {
  title: string;
  slug: string;
  categorySlug: string;
  categoryName?: string | null;
  summary?: string | null;
  updatedAt?: Date | string | number | null;
}

export interface PageMetadataOptions {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
}

/**
 * Resolves a given path or relative URL to a fully qualified, production-safe HTTPS URL.
 * Automatically sanitizes any accidental localhost or malformed host entries.
 */
export function toAbsoluteUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl || pathOrUrl.trim() === '') {
    return SITE_CONFIG.url;
  }
  const clean = pathOrUrl.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return `${SITE_CONFIG.url}${parsed.pathname}${parsed.search}`;
      }
      return clean;
    } catch {
      return clean;
    }
  }
  const normalizedPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `${SITE_CONFIG.url}${normalizedPath}`;
}

/**
 * Content-Aware Image Priority Resolver for Applications:
 * Priority 1: Explicit featured/share banner image
 * Priority 2: High-resolution project icon
 * Priority 3: Global ElseSourav OpenGraph fallback banner
 */
export function resolveAppShareImage(app: {
  featuredImageUrl?: string | null;
  iconUrl?: string | null;
  name?: string;
}): SeoImageDescriptor {
  const alt = `${app.name || 'Application'} — ${SITE_CONFIG.name}`;

  if (app.featuredImageUrl && app.featuredImageUrl.trim() !== '') {
    return {
      url: toAbsoluteUrl(app.featuredImageUrl),
      width: 1200,
      height: 630,
      alt,
    };
  }

  if (app.iconUrl && app.iconUrl.trim() !== '' && !app.iconUrl.includes('favicon')) {
    return {
      url: toAbsoluteUrl(app.iconUrl),
      width: 512,
      height: 512,
      alt,
    };
  }

  return {
    url: toAbsoluteUrl(SITE_CONFIG.ogImage),
    width: 1200,
    height: 630,
    alt: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  };
}

/**
 * Content-Aware Image Priority Resolver for Notes / Articles:
 * Priority 1: Note cover image
 * Priority 2: Global ElseSourav OpenGraph fallback banner
 */
export function resolveNoteShareImage(note: {
  coverImageUrl?: string | null;
  title?: string;
}): SeoImageDescriptor {
  const alt = `${note.title || 'Field Note'} — ${SITE_CONFIG.name}`;

  if (note.coverImageUrl && note.coverImageUrl.trim() !== '') {
    return {
      url: toAbsoluteUrl(note.coverImageUrl),
      width: 1200,
      height: 630,
      alt,
    };
  }

  return {
    url: toAbsoluteUrl(SITE_CONFIG.ogImage),
    width: 1200,
    height: 630,
    alt: `${SITE_CONFIG.name} — Engineering Journal`,
  };
}

/**
 * Universal metadata builder for standard static and collection pages.
 */
export function buildPageMetadata(options: PageMetadataOptions) {
  const title = options.title.includes(SITE_CONFIG.name)
    ? options.title
    : `${options.title} — ${SITE_CONFIG.name}`;
  const description =
    options.description ||
    SITE_CONFIG.description ||
    'Software, developer tools, and engineering notes by Sourav Barui.';
  const canonicalUrl = toAbsoluteUrl(options.path || '/');
  const imageUrl = toAbsoluteUrl(options.image || SITE_CONFIG.ogImage);
  const type = options.type || 'website';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: options.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type,
      publishedTime: options.publishedTime,
      modifiedTime: options.modifiedTime,
      authors: options.authors,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [imageUrl],
      creator: '@elsesourav',
    },
  };
}

/**
 * Centralized dynamic metadata generator for individual App / Project pages.
 */
export function buildAppMetadata(app: AppMetadataSource) {
  const title = app.seoTitle || `${app.name} — ${SITE_CONFIG.name}`;
  const description =
    app.seoDescription ||
    app.shortDescription ||
    app.description?.slice(0, 160) ||
    `Explore ${app.name} on ${SITE_CONFIG.name}.`;
  const canonicalUrl = toAbsoluteUrl(`/apps/${app.slug}`);
  const image = resolveAppShareImage(app);

  const tagList = Array.isArray(app.tags)
    ? app.tags
        .map((t) => (typeof t === 'string' ? t : 'tag' in t ? t.tag.name : t.name))
        .filter(Boolean)
    : [];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type: 'article',
      images: [image],
      tags: tagList.length > 0 ? tagList : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [image.url],
      creator: '@elsesourav',
    },
  };
}

/**
 * Centralized dynamic metadata generator for individual Note / Blog Post pages.
 */
export function buildNoteMetadata(post: NoteMetadataSource) {
  const title = post.seoTitle || `${post.title} — ${SITE_CONFIG.name} Journal`;
  const description =
    post.seoDescription || post.excerpt || `Read ${post.title} on ${SITE_CONFIG.name}.`;
  const canonicalUrl = toAbsoluteUrl(`/notes/${post.slug}`);
  const image = resolveNoteShareImage(post);

  const authorName =
    typeof post.author === 'string'
      ? post.author
      : post.author?.displayName || post.author?.name || 'Sourav';

  const tagList = Array.isArray(post.tags)
    ? post.tags
        .map((t) => (typeof t === 'string' ? t : 'tag' in t ? t.tag.name : t.name))
        .filter(Boolean)
    : [];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: [authorName],
      images: [image],
      tags: tagList.length > 0 ? tagList : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [image.url],
      creator: '@elsesourav',
    },
  };
}

/**
 * Centralized dynamic metadata generator for Help Article pages.
 */
export function buildHelpArticleMetadata(article: HelpArticleMetadataSource) {
  const title = `${article.title} — ${SITE_CONFIG.name} Help`;
  const description =
    article.summary ||
    `Documentation, troubleshooting, and architectural guides for ${article.title} on ${SITE_CONFIG.name}.`;
  const canonicalUrl = toAbsoluteUrl(`/help/${article.categorySlug}/${article.slug}`);
  const image = {
    url: toAbsoluteUrl(SITE_CONFIG.ogImage),
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type: 'article',
      modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [image.url],
      creator: '@elsesourav',
    },
  };
}
