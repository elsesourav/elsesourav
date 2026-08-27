import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SEO } from '@/components/seo/SEO';

describe('SEO Component & DOM Head Updates (Prompt 53)', () => {
  beforeEach(() => {
    document.title = '';
    const metas = document.querySelectorAll('meta, link[rel="canonical"], script[id="seo-structured-data"]');
    metas.forEach((el) => el.remove());
  });

  afterEach(() => {
    const metas = document.querySelectorAll('meta, link[rel="canonical"], script[id="seo-structured-data"]');
    metas.forEach((el) => el.remove());
  });

  it('1. Updates document.title and meta description', () => {
    render(
      <SEO
        title="Explore Applications"
        description="Discover developer tools and web apps."
      />
    );

    expect(document.title).toBe('Explore Applications | ElseSourav');
    const descEl = document.querySelector('meta[name="description"]');
    expect(descEl?.getAttribute('content')).toBe('Discover developer tools and web apps.');
  });

  it('2. Inserts canonical link tag with normalized URL', () => {
    render(<SEO canonicalPath="/apps/cloud-terminal" />);

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    expect(canonicalEl?.getAttribute('href')).toBe('https://elsesourav.com/apps/cloud-terminal');
  });

  it('3. Sets robots directive to "noindex, nofollow" when noIndex prop is true', () => {
    render(<SEO title="Sign In" noIndex />);

    const robotsEl = document.querySelector('meta[name="robots"]');
    expect(robotsEl?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('4. Sets default robots directive to "index, follow" for public pages', () => {
    render(<SEO title="Homepage" />);

    const robotsEl = document.querySelector('meta[name="robots"]');
    expect(robotsEl?.getAttribute('content')).toBe('index, follow');
  });

  it('5. Injects OpenGraph and Twitter/X card meta tags', () => {
    render(
      <SEO
        title="Building WebSockets"
        description="Real-time architecture article"
        openGraph={{
          type: 'article',
          image: 'https://example.com/cover.png',
        }}
        twitter={{
          card: 'summary_large_image',
          image: 'https://example.com/cover.png',
        }}
      />
    );

    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://example.com/cover.png');
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
  });

  it('6. Injects JSON-LD structured data script safely', () => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ElseSourav',
    };

    render(<SEO structuredData={jsonLd} />);

    const scriptEl = document.getElementById('seo-structured-data');
    expect(scriptEl).not.toBeNull();
    expect(scriptEl?.getAttribute('type')).toBe('application/ld+json');
    expect(JSON.parse(scriptEl?.textContent || '{}')).toEqual(jsonLd);
  });
});
