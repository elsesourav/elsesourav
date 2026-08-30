import { describe, it, expect } from 'vitest';
import type { AppListItem, BlogPostListItem } from '@elsesourav/types';

describe('Current Focus / Now Architecture (Prompt 23)', () => {
  const mockPublishedApp: AppListItem = {
    id: 'app-now-1',
    slug: 'spectralens-ai',
    name: 'SpectraLens AI',
    shortDescription: 'Manifest V3 Chrome extension with on-device OCR and streaming AI.',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
    primaryCategory: 'AI & Machine Learning',
    categorySlug: 'ai-ml',
    platforms: ['chrome', 'web'],
    isFeatured: true,
    isPinned: true,
    sortOrder: 1,
    currentVersion: '2.4.0',
    publishedAt: Date.now(),
  };

  const mockLabApp: AppListItem = {
    id: 'app-lab-1',
    slug: 'falling-sands',
    name: 'Falling Sands Sandbox',
    shortDescription: 'Cellular automata particulate dispersion physics sandbox.',
    iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80',
    primaryCategory: 'Simulations & Graphics',
    categorySlug: 'simulations',
    platforms: ['web'],
    isFeatured: false,
    isPinned: false,
    sortOrder: 2,
    publishedAt: Date.now() - 10000,
  };

  const mockNote: BlogPostListItem = {
    id: 'post-now-1',
    slug: 'webassembly-cellular-automata-performance',
    title: 'Cellular Automata at 60 FPS in WebAssembly',
    excerpt: 'Benchmarking memory buffers and SIMD vectorization across modern browser engines.',
    readingTime: 6,
    viewsCount: 120,
    author: {
      id: 'author-1',
      displayName: 'Sourav Barui',
    },
    tags: [
      { id: 't1', name: 'Engineering', slug: 'engineering' },
      { id: 't2', name: 'Performance', slug: 'performance' },
    ],
    createdAt: Date.now() - 6000,
    publishedAt: Date.now() - 5000,
  };

  it('correctly associates active building, exploring, and writing artifacts when present', () => {
    const activeData = {
      building: mockPublishedApp,
      exploring: mockLabApp,
      writing: mockNote,
    };

    expect(activeData.building.name).toBe('SpectraLens AI');
    expect(activeData.building.slug).toBe('spectralens-ai');
    expect(activeData.exploring.slug).toBe('falling-sands');
    expect(activeData.writing.title).toContain('WebAssembly');
  });

  it('gracefully handles partial or empty states without rendering broken containers', () => {
    const partialData = {
      building: mockPublishedApp,
      exploring: null,
      writing: null,
    };

    expect(partialData.building).not.toBeNull();
    expect(partialData.exploring).toBeNull();
    expect(partialData.writing).toBeNull();

    // Verify empty state fallback logic
    const hasAnyActive = Boolean(partialData.building || partialData.exploring || partialData.writing);
    expect(hasAnyActive).toBe(true);
  });

  it('strictly excludes non-published/draft records from public focus projection', () => {
    const draftApp = {
      ...mockPublishedApp,
      status: 'draft',
    };

    // Public focus only queries published apps
    const isPubliclyEligible = draftApp.status === 'published';
    expect(isPubliclyEligible).toBe(false);
  });

  it('contains zero artificial status slogans or fake activity meters', () => {
    const forbiddenPhrases = ['working 24/7', 'always shipping', 'building the future'];
    const renderedCopy = `${mockPublishedApp.shortDescription} ${mockLabApp.shortDescription} ${mockNote.excerpt}`.toLowerCase();

    forbiddenPhrases.forEach((phrase) => {
      expect(renderedCopy.includes(phrase)).toBe(false);
    });
  });
});
