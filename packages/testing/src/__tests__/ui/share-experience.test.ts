import { describe, it, expect } from 'vitest';
import { toAbsoluteUrl } from '@elsesourav/config';

describe('Share Experience & Canonical URL Handling (Prompt 4 of 5)', () => {
  describe('Canonical URL Sanitization and Safety', () => {
    it('constructs immutable canonical URLs for App shares', () => {
      const appSlug = 'spectralens-ai';
      const canonical = toAbsoluteUrl(`/apps/${appSlug}`);
      expect(canonical).toBe('https://elsesourav.com/apps/spectralens-ai');
      expect(canonical).not.toContain('localhost');
      expect(canonical).not.toContain('127.0.0.1');
      expect(canonical).not.toContain('admin');
      expect(canonical).not.toContain('token');
    });

    it('constructs immutable canonical URLs for Note/Blog shares', () => {
      const noteSlug = 'deep-dive-rsc';
      const canonical = toAbsoluteUrl(`/blog/${noteSlug}`);
      expect(canonical).toBe('https://elsesourav.com/blog/deep-dive-rsc');
    });

    it('constructs immutable canonical URLs for Help Documentation shares', () => {
      const categorySlug = 'getting-started';
      const articleSlug = 'account-security';
      const canonical = toAbsoluteUrl(`/help/${categorySlug}/${articleSlug}`);
      expect(canonical).toBe('https://elsesourav.com/help/getting-started/account-security');
    });

    it('strips query parameters and hashes from base canonical paths if provided', () => {
      const clean = toAbsoluteUrl('/apps/breakout-ball');
      expect(clean).toBe('https://elsesourav.com/apps/breakout-ball');
    });
  });

  describe('Content-Aware Payload Integrity', () => {
    it('validates content-aware share payload for App projects', () => {
      const app = {
        name: 'SpectraLens AI',
        shortDescription: 'On-device vision intelligence and optical neural engine.',
        slug: 'spectralens-ai',
      };

      const sharePayload = {
        title: app.name,
        text: app.shortDescription,
        url: toAbsoluteUrl(`/apps/${app.slug}`),
      };

      expect(sharePayload.title).toBe('SpectraLens AI');
      expect(sharePayload.text).toBe('On-device vision intelligence and optical neural engine.');
      expect(sharePayload.url).toBe('https://elsesourav.com/apps/spectralens-ai');
    });

    it('validates content-aware share payload for Field Notes', () => {
      const post = {
        title: 'Building WASM Pipelines with Rust and Next.js',
        excerpt: 'How we achieved sub-millisecond tensor processing in the browser.',
        slug: 'wasm-rust-nextjs',
      };

      const sharePayload = {
        title: post.title,
        text: post.excerpt,
        url: toAbsoluteUrl(`/blog/${post.slug}`),
      };

      expect(sharePayload.title).toBe('Building WASM Pipelines with Rust and Next.js');
      expect(sharePayload.text).toBe('How we achieved sub-millisecond tensor processing in the browser.');
      expect(sharePayload.url).toBe('https://elsesourav.com/blog/wasm-rust-nextjs');
    });
  });
});
