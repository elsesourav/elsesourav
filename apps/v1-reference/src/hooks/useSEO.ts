import { useEffect } from 'react';
import type { SEOConfig } from '@/types/seo.types';
import {
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_LOCALE,
  TWITTER_HANDLE,
  formatPageTitle,
  normalizeCanonicalUrl,
  serializeJsonLd,
} from '@/utils/seo.utils';

function setMetaTag(key: string, value?: string, isProperty = false): void {
  if (typeof document === 'undefined') return;

  const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let el = document.querySelector(selector);

  if (!value) {
    if (el) el.remove();
    return;
  }

  if (!el) {
    el = document.createElement('meta');
    if (isProperty) {
      el.setAttribute('property', key);
    } else {
      el.setAttribute('name', key);
    }
    document.head.appendChild(el);
  }

  el.setAttribute('content', value);
}

function setLinkTag(rel: string, href?: string): void {
  if (typeof document === 'undefined') return;

  let el = document.querySelector(`link[rel="${rel}"]`);

  if (!href) {
    if (el) el.remove();
    return;
  }

  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }

  el.setAttribute('href', href);
}

function setStructuredDataTag(id: string, jsonLdString?: string): void {
  if (typeof document === 'undefined') return;

  let el = document.getElementById(id) as HTMLScriptElement | null;

  if (!jsonLdString) {
    if (el) el.remove();
    return;
  }

  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('id', id);
    document.head.appendChild(el);
  }

  el.textContent = jsonLdString;
}

export function useSEO(config: SEOConfig = {}): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Page Title
    const formattedTitle = formatPageTitle(config.title, config.exactTitle);
    document.title = formattedTitle;

    // 2. Meta Description
    const description = config.description || DEFAULT_DESCRIPTION;
    setMetaTag('description', description);

    // 3. Robots Directives
    const robots = config.noIndex
      ? 'noindex, nofollow'
      : config.robots || 'index, follow';
    setMetaTag('robots', robots);

    // 4. Keywords
    if (config.keywords && config.keywords.length > 0) {
      setMetaTag('keywords', config.keywords.join(', '));
    } else {
      setMetaTag('keywords', undefined);
    }

    // 5. Canonical Link
    const canonicalUrl = normalizeCanonicalUrl(
      config.canonicalUrl || config.canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
    );
    setLinkTag('canonical', canonicalUrl);

    // 6. Open Graph Metadata
    const og = config.openGraph || {};
    setMetaTag('og:title', og.title || formattedTitle, true);
    setMetaTag('og:description', og.description || description, true);
    setMetaTag('og:url', og.url || canonicalUrl, true);
    setMetaTag('og:image', og.image || DEFAULT_OG_IMAGE, true);
    setMetaTag('og:type', og.type || 'website', true);
    setMetaTag('og:site_name', og.siteName || SITE_NAME, true);
    setMetaTag('og:locale', og.locale || config.locale || DEFAULT_LOCALE, true);

    if (og.article) {
      setMetaTag('article:published_time', og.article.publishedTime, true);
      setMetaTag('article:modified_time', og.article.modifiedTime, true);
      setMetaTag('article:author', og.article.author, true);
      setMetaTag('article:section', og.article.section, true);
      if (og.article.tags && og.article.tags.length > 0) {
        setMetaTag('article:tag', og.article.tags.join(','), true);
      } else {
        setMetaTag('article:tag', undefined, true);
      }
    } else {
      setMetaTag('article:published_time', undefined, true);
      setMetaTag('article:modified_time', undefined, true);
      setMetaTag('article:author', undefined, true);
      setMetaTag('article:section', undefined, true);
      setMetaTag('article:tag', undefined, true);
    }

    // 7. Twitter / X Card Metadata
    const twitter = config.twitter || {};
    setMetaTag('twitter:card', twitter.card || 'summary_large_image');
    setMetaTag('twitter:title', twitter.title || og.title || formattedTitle);
    setMetaTag('twitter:description', twitter.description || og.description || description);
    setMetaTag('twitter:image', twitter.image || og.image || DEFAULT_OG_IMAGE);
    setMetaTag('twitter:site', twitter.site || TWITTER_HANDLE);
    if (twitter.creator) {
      setMetaTag('twitter:creator', twitter.creator);
    } else {
      setMetaTag('twitter:creator', undefined);
    }

    // 8. JSON-LD Structured Data
    if (config.structuredData) {
      const jsonString = serializeJsonLd(config.structuredData);
      setStructuredDataTag('seo-structured-data', jsonString);
    } else {
      setStructuredDataTag('seo-structured-data', undefined);
    }
  }, [
    config.title,
    config.exactTitle,
    config.description,
    config.canonicalPath,
    config.canonicalUrl,
    config.robots,
    config.noIndex,
    config.keywords,
    config.locale,
    config.openGraph,
    config.twitter,
    config.structuredData,
  ]);
}
