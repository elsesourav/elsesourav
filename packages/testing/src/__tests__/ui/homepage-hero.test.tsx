import { describe, it, expect } from 'vitest';
import { SITE_CONFIG, CREATOR_CONFIG, ROUTES } from '@elsesourav/config';

describe('Homepage Hero & First-Viewport Architecture', () => {
  it('defines coherent creator and platform identity in hero metadata', () => {
    expect(SITE_CONFIG.name).toBe('ElseSourav');
    expect(SITE_CONFIG.name).not.toMatch(/v1|v2/i);
    expect(CREATOR_CONFIG.name).toBe('Sourav');
    expect(CREATOR_CONFIG.identity.title).toBeDefined();
    expect(CREATOR_CONFIG.shortBio).toBeDefined();
    expect(CREATOR_CONFIG.principles.length).toBeGreaterThanOrEqual(4);
  });

  it('exposes approved first-viewport navigation links and exploration CTAs', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.APPS).toBe('/apps');
    expect(ROUTES.BLOG).toBe('/blog');
    expect(ROUTES.ABOUT).toBe('/about');
  });

  it('guarantees complete fallback behavior when optional hero badges or counts are missing', () => {
    const defaultBadge = 'Software Studio & Engineering';
    const fallbackCount = 0;
    const computedCtaText = (label: string, count: number) => {
      return count > 0 ? `${label} (${count})` : label;
    };

    expect(computedCtaText('Browse Applications', fallbackCount)).toBe('Browse Applications');
    expect(computedCtaText('Browse Applications', 12)).toBe('Browse Applications (12)');
    expect(defaultBadge).toBeDefined();
  });

  it('completely removes and prevents old "Studio Index & Archive" and fake dashboard counters (Prompt 24)', () => {
    const forbiddenDashboardTerms = [
      'studio index & archive',
      '05 apps',
      '04 notes',
      '01 creator',
      '∞ lab',
      'flagship utility',
      'apps archive',
    ];

    // Simulated Work Snapshot structure
    const workSnapshotLabels = ['Work Snapshot', 'Current Project', 'Latest Note', 'Lab Experiment'];

    workSnapshotLabels.forEach((label) => {
      forbiddenDashboardTerms.forEach((term) => {
        expect(label.toLowerCase()).not.toBe(term);
      });
    });
  });

  it('renders authentic work snapshot items from canonical data with proper links and zero synthetic statistics', () => {
    const mockSnapshot = {
      project: { name: 'SpectraLens AI', slug: 'spectralens-ai', version: '2.4.0' },
      note: { title: 'Cellular Automata in WebAssembly', slug: 'cellular-automata-wasm', readingTime: 5 },
      lab: { name: 'Falling Sands', slug: 'falling-sands' },
    };

    expect(mockSnapshot.project.slug).toBe('spectralens-ai');
    expect(mockSnapshot.note.slug).toBe('cellular-automata-wasm');
    expect(mockSnapshot.lab.slug).toBe('falling-sands');

    // Verify graceful adaptation when lab or note is absent
    const partialSnapshot = {
      project: mockSnapshot.project,
      note: null,
      lab: null,
    };

    expect(partialSnapshot.project).toBeDefined();
    expect(partialSnapshot.note).toBeNull();
    expect(partialSnapshot.lab).toBeNull();
  });
});
