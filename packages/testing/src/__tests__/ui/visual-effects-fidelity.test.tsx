import * as React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SiteSettingsSchema } from '@elsesourav/validation';
import { SiteService, AdminRepository } from '@elsesourav/database';
import { ThemeProvider, useTheme } from '../../../../../apps/web/components/theme/ThemeProvider';
import fs from 'node:fs';
import path from 'node:path';

describe('Visual Effects & Scroll Performance Fidelity Engine', () => {
  describe('1. Zod Validation & Schema', () => {
    it('accepts valid effects_level: high, medium, low', () => {
      const high = SiteSettingsSchema.parse({ effects_level: 'high' });
      expect(high.effects_level).toBe('high');

      const medium = SiteSettingsSchema.parse({ effects_level: 'medium' });
      expect(medium.effects_level).toBe('medium');

      const low = SiteSettingsSchema.parse({ effects_level: 'low' });
      expect(low.effects_level).toBe('low');
    });

    it('rejects invalid visual fidelity levels', () => {
      expect(() => SiteSettingsSchema.parse({ effects_level: 'ultra' as unknown as 'high' })).toThrow();
      expect(() => SiteSettingsSchema.parse({ effects_level: 'none' as unknown as 'high' })).toThrow();
    });

    it('allows empty string or omitted effects_level and defaults gracefully', () => {
      const omitted = SiteSettingsSchema.parse({});
      expect(omitted.effects_level).toBeUndefined();

      const empty = SiteSettingsSchema.parse({ effects_level: '' });
      expect(empty.effects_level).toBe('');
    });
  });

  describe('2. SiteService Identity Mapping', () => {
    it('defaults effectsLevel to high when database setting is absent', async () => {
      const mockAdminRepo = {
        getAllSettings: vi.fn().mockResolvedValue({}),
      } as unknown as AdminRepository;

      const siteService = new SiteService(mockAdminRepo);
      const identity = await siteService.getSiteAndCreatorIdentity();

      expect(identity.site.effectsLevel).toBe('high');
    });

    it('faithfully propagates low and medium settings from database', async () => {
      const mockAdminRepoLow = {
        getAllSettings: vi.fn().mockResolvedValue({ effects_level: 'low' }),
      } as unknown as AdminRepository;

      const siteServiceLow = new SiteService(mockAdminRepoLow);
      const identityLow = await siteServiceLow.getSiteAndCreatorIdentity();
      expect(identityLow.site.effectsLevel).toBe('low');

      const mockAdminRepoMedium = {
        getAllSettings: vi.fn().mockResolvedValue({ effects_level: 'medium' }),
      } as unknown as AdminRepository;

      const siteServiceMed = new SiteService(mockAdminRepoMedium);
      const identityMed = await siteServiceMed.getSiteAndCreatorIdentity();
      expect(identityMed.site.effectsLevel).toBe('medium');
    });
  });

  describe('3. Frontend State Synchronization (ThemeProvider)', () => {
    function EffectsTestConsumer() {
      const { effectsLevel, setEffectsLevel } = useTheme();
      return (
        <div>
          <span data-testid="current-effects">{effectsLevel}</span>
          <button onClick={() => setEffectsLevel('low')}>Set Low</button>
          <button onClick={() => setEffectsLevel('medium')}>Set Medium</button>
          <button onClick={() => setEffectsLevel('high')}>Set High</button>
        </div>
      );
    }

    beforeEach(() => {
      document.documentElement.removeAttribute('data-effects');
      localStorage.clear();
    });

    it('initializes data-effects on documentElement and allows reactive updates', () => {
      render(
        <ThemeProvider initialEffects="medium">
          <EffectsTestConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-effects').textContent).toBe('medium');
      expect(document.documentElement.getAttribute('data-effects')).toBe('medium');

      // Click to switch to low
      fireEvent.click(screen.getByText('Set Low'));
      expect(screen.getByTestId('current-effects').textContent).toBe('low');
      expect(document.documentElement.getAttribute('data-effects')).toBe('low');
      // Admin-only setting: not stored in user localStorage
      expect(localStorage.getItem('effects_level')).toBeNull();

      // Click to switch to high
      fireEvent.click(screen.getByText('Set High'));
      expect(screen.getByTestId('current-effects').textContent).toBe('high');
      expect(document.documentElement.getAttribute('data-effects')).toBe('high');
      expect(localStorage.getItem('effects_level')).toBeNull();
    });
  });

  describe('4. Design System CSS Fidelity Rules', () => {
    it('contains all necessary CSS selectors for high, medium, and low modes', () => {
      const cssPath = path.resolve(__dirname, '../../../../ui/src/styles/globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Verify medium rules
      expect(cssContent).toContain("[data-effects='medium']");
      expect(cssContent).toContain("[data-effects='medium'] [class*='backdrop-blur']");
      expect(cssContent).toContain("[data-effects='medium'] .shadow-2xl");
      expect(cssContent).toContain("[data-effects='medium'] .hero-atmospheric-canvas");

      // Verify low rules (performance-first / scroll-optimized)
      expect(cssContent).toContain("[data-effects='low']");
      expect(cssContent).toContain("[data-effects='low'] [class*='backdrop-blur']");
      expect(cssContent).toContain('--tw-backdrop-blur: none !important');
      expect(cssContent).toContain('backdrop-filter: none !important');
      expect(cssContent).toContain("[data-effects='low'] .ambient-glow-orb");
      expect(cssContent).toContain("[data-effects='low'] .hero-atmospheric-canvas");
      expect(cssContent).toContain("[data-effects='low'] .shadow-2xl");
      expect(cssContent).toContain("[data-effects='low'] header");
      expect(cssContent).toContain("[data-effects='low'] [class*='bg-background/']");
    });
  });
});
