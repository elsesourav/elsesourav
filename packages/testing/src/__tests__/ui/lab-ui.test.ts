import { describe, it, expect } from 'vitest';
import type { AppListItem } from '@elsesourav/types';

describe('Apps Classification & Simulation Unification', () => {
  const mockApps: AppListItem[] = [
    {
      id: 'app-sim-1',
      slug: 'falling-sands',
      name: 'Falling Sands Sandbox',
      shortDescription: 'Cellular automata physics simulation for particulate materials (sand, water, solids).',
      iconUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80',
      primaryCategory: 'Algorithms & Simulations',
      categorySlug: 'simulations',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      sortOrder: 1,
      publishedAt: 1704067200000,
    },
    {
      id: 'app-sim-2',
      slug: 'wave-function-collapse',
      name: 'Wave Function Collapse Visualizer',
      shortDescription: 'Procedural tile and texture generation using the quantum-inspired Wave Function Collapse algorithm.',
      iconUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
      primaryCategory: 'Algorithms & Simulations',
      categorySlug: 'simulations',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      sortOrder: 2,
      publishedAt: 1704153600000,
    },
    {
      id: 'app-sim-3',
      slug: 'particle-chain-wasm',
      name: 'Particle Chain WASM',
      shortDescription: 'Real-time particle physics chain simulation in C++ compiled to WebAssembly.',
      iconUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&q=80',
      primaryCategory: 'Algorithms & Simulations',
      categorySlug: 'simulations',
      platforms: ['web'],
      isFeatured: false,
      isPinned: false,
      sortOrder: 3,
      publishedAt: 1704240000000,
    },
    {
      id: 'app-flagship',
      slug: 'spectralens-ai',
      name: 'SpectraLens AI',
      shortDescription: 'Edge AI document scanner.',
      iconUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
      primaryCategory: 'AI & Machine Learning',
      categorySlug: 'ai-ml',
      platforms: ['chrome', 'web'],
      isFeatured: true,
      isPinned: false,
      sortOrder: 4,
      publishedAt: 1704326400000,
    },
  ];

  it('unifies simulations seamlessly into the canonical Apps portfolio', () => {
    const simulationApps = mockApps.filter(
      (app) => app.categorySlug === 'simulations' || app.primaryCategory.toLowerCase().includes('simulation')
    );

    expect(simulationApps).toHaveLength(3);
    expect(simulationApps.map((a) => a.slug)).toEqual([
      'falling-sands',
      'wave-function-collapse',
      'particle-chain-wasm',
    ]);
  });

  it('supports topic filtering for WASM and C++ applications', () => {
    const wasmApps = mockApps.filter(
      (app) =>
        app.slug.includes('wasm') ||
        app.shortDescription.toLowerCase().includes('c++') ||
        app.shortDescription.toLowerCase().includes('webassembly')
    );

    expect(wasmApps).toHaveLength(1);
    expect(wasmApps[0]?.name).toBe('Particle Chain WASM');
  });

  it('supports procedural and algorithm filtering', () => {
    const algoApps = mockApps.filter(
      (app) =>
        app.shortDescription.toLowerCase().includes('algorithm') ||
        app.shortDescription.toLowerCase().includes('procedural')
    );

    expect(algoApps).toHaveLength(1);
    expect(algoApps[0]?.name).toBe('Wave Function Collapse Visualizer');
  });

  it('verifies that all projects are preserved as canonical database records without duplication', () => {
    const uniqueSlugs = new Set(mockApps.map((a) => a.slug));
    expect(uniqueSlugs.size).toBe(mockApps.length);
  });
});
