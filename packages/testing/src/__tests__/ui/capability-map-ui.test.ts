import { describe, it, expect } from 'vitest';
import { CAPABILITY_GROUPS_CONFIG } from '@elsesourav/config';

describe('Professional Capability Map Architecture (Prompt 22)', () => {
  it('defines structured capability groups grounded in actual project evidence', () => {
    expect(CAPABILITY_GROUPS_CONFIG.length).toBeGreaterThanOrEqual(6);

    const groupIds = CAPABILITY_GROUPS_CONFIG.map((g) => g.id);
    expect(groupIds).toContain('interactive-games');
    expect(groupIds).toContain('creative-tools');
    expect(groupIds).toContain('ai-ml');
    expect(groupIds).toContain('automation');
    expect(groupIds).toContain('systems-wasm');
    expect(groupIds).toContain('graphics-simulations');
    expect(groupIds).toContain('mobile-offline');
    expect(groupIds).toContain('web-applications');
  });

  it('verifies that every capability group contains verified project links with valid slugs', () => {
    CAPABILITY_GROUPS_CONFIG.forEach((group) => {
      expect(group.projects.length).toBeGreaterThanOrEqual(1);
      group.projects.forEach((proj) => {
        expect(proj.name).toBeDefined();
        expect(proj.name.length).toBeGreaterThan(0);
        expect(proj.slug).toMatch(/^[a-z0-9-]+$/);
        expect(proj.context).toBeDefined();
      });
    });
  });

  it('contains zero artificial skill ratings, percentage numbers, or proficiency meters', () => {
    CAPABILITY_GROUPS_CONFIG.forEach((group) => {
      // Ensure no properties like percentage, rating, level exist
      const raw = group as unknown as Record<string, unknown>;
      expect(raw['percentage']).toBeUndefined();
      expect(raw['rating']).toBeUndefined();
      expect(raw['level']).toBeUndefined();
      expect(raw['stars']).toBeUndefined();
    });
  });

  it('includes secondary technical cues for contextual engineering reference', () => {
    const systemsGroup = CAPABILITY_GROUPS_CONFIG.find((g) => g.id === 'systems-wasm');
    expect(systemsGroup).toBeDefined();
    expect(systemsGroup?.technologies).toContain('C++');
    expect(systemsGroup?.technologies).toContain('WebAssembly');

    const aiGroup = CAPABILITY_GROUPS_CONFIG.find((g) => g.id === 'ai-ml');
    expect(aiGroup).toBeDefined();
    expect(aiGroup?.technologies).toContain('Manifest V3');
  });
});
