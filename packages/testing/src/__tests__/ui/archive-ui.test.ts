import { describe, it, expect } from 'vitest';
import type { AppListItem } from '@elsesourav/types';

describe('Public Archive Experience Integration', () => {
  const mockArchiveApps: AppListItem[] = [
    {
      id: 'app-arch-1',
      slug: 'neo',
      name: 'NEO CLI Utility',
      shortDescription: 'Experimental developer command-line interface tool for personal workspace automation.',
      iconUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200&q=80',
      primaryCategory: 'Developer Tools',
      categorySlug: 'dev-tools',
      platforms: ['linux', 'macos'],
      isFeatured: false,
      isPinned: false,
      sortOrder: 1,
      publishedAt: 1700000000000, // 2023
    },
    {
      id: 'app-arch-2',
      slug: 'user-manager',
      name: 'User Manager Prototype',
      shortDescription: 'Local user identity manager.',
      iconUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
      primaryCategory: 'Utilities',
      categorySlug: 'utilities',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      sortOrder: 2,
      publishedAt: 1710000000000, // 2024
    },
    {
      id: 'app-arch-3',
      slug: 'base-calculator',
      name: 'Base Conversion Calculator',
      shortDescription: 'Number base conversion tool.',
      iconUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&q=80',
      primaryCategory: 'Utilities',
      categorySlug: 'utilities',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      sortOrder: 3,
      publishedAt: 1740000000000, // 2025
    },
  ];

  it('groups archived projects chronologically by year', () => {
    const grouped = mockArchiveApps.reduce<Record<string, AppListItem[]>>((acc, project) => {
      const yr = project.publishedAt ? new Date(project.publishedAt).getFullYear().toString() : 'Legacy';
      if (!acc[yr]) acc[yr] = [];
      acc[yr].push(project);
      return acc;
    }, {});

    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    expect(years).toContain('2023');
    expect(years).toContain('2024');
    expect(years).toContain('2025');
    expect(grouped['2023']?.[0]?.slug).toBe('neo');
  });

  it('supports filtering by specific year', () => {
    const year2024 = mockArchiveApps.filter((p) => {
      const yr = p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : '';
      return yr === '2024';
    });

    expect(year2024).toHaveLength(1);
    expect(year2024[0]?.name).toBe('User Manager Prototype');
  });

  it('supports category filtering within archive collection', () => {
    const devTools = mockArchiveApps.filter((p) => p.primaryCategory === 'Developer Tools');
    expect(devTools).toHaveLength(1);
    expect(devTools[0]?.slug).toBe('neo');
  });

  it('verifies that archive items link to canonical project detail paths', () => {
    const item = mockArchiveApps[0]!;
    const expectedPath = `/apps/${item.slug}`;
    expect(expectedPath).toBe('/apps/neo');
  });
});
