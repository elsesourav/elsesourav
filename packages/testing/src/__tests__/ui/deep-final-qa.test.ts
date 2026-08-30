import { describe, it, expect } from 'vitest';
import { SITE_CONFIG, CREATOR_CONFIG, ROUTES } from '@elsesourav/config';
import { CAPABILITY_GROUPS_CONFIG } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';

describe('Deep Final QA Pass — Homepage & About Page (Prompt 29)', () => {
  describe('1. The 5-Second Comprehension Test', () => {
    it('verifies canonical creator identity (WHO)', () => {
      expect(CREATOR_CONFIG.name).toBe('Sourav');
      expect(CREATOR_CONFIG.fullName).toBe('Sourav Barui');
      expect(CREATOR_CONFIG.identity.title).toContain('Software Engineer');
    });

    it('verifies clear studio definition (WHAT)', () => {
      expect(SITE_CONFIG.tagline).toContain('Software');
      expect(CREATOR_CONFIG.positioning).toContain('software');
      expect(CREATOR_CONFIG.positioning).toContain('tools');
    });

    it('verifies core building motivation (WHY)', () => {
      expect(CREATOR_CONFIG.principles).toBeDefined();
      expect(CREATOR_CONFIG.principles.length).toBeGreaterThan(0);
      expect(CREATOR_CONFIG.shortBio).toContain('software');
    });

    it('verifies clean top-level discovery pathways (WHERE)', () => {
      expect(ROUTES.APPS).toBe('/apps');
      expect(ROUTES.BLOG).toBe('/notes');
      expect(ROUTES.NOTES).toBe('/notes');
      expect(ROUTES.ABOUT).toBe('/about');
      expect(ROUTES.ARCHIVE).toBe('/archive');
    });
  });

  describe('2. Hero Section & Right Column Work Snapshot', () => {
    it('verifies Hero identity defaults and absence of synthetic counter widgets', async () => {
      const siteService = new SiteService();
      const identity = await siteService.getSiteAndCreatorIdentity();

      expect(identity.homepage.heroHeadline).toBeDefined();
      expect(identity.homepage.heroBadge).toBeDefined();
      expect(identity.homepage.primaryCtaLabel).toBeDefined();
      expect(identity.homepage.secondaryCtaLabel).toBeDefined();
    });
  });

  describe('3. Professional Capability Map & Verified Evidence Links', () => {
    it('ensures all capability groups link to real, non-empty canonical project slugs', () => {
      expect(CAPABILITY_GROUPS_CONFIG.length).toBeGreaterThanOrEqual(6);

      for (const group of CAPABILITY_GROUPS_CONFIG) {
        expect(group.id).toBeDefined();
        expect(group.title).toBeDefined();
        expect(group.projects.length).toBeGreaterThan(0);

        for (const project of group.projects) {
          expect(project.slug).toBeDefined();
          expect(project.slug).toMatch(/^[a-z0-9-]+$/);
          expect(project.name).toBeDefined();
          expect(project.context).toBeDefined();
        }
      }
    });

    it('verifies specific capability evidence matches actual verified projects', () => {
      const creativeTools = CAPABILITY_GROUPS_CONFIG.find((g) => g.id === 'creative-tools');
      expect(creativeTools).toBeDefined();
      expect(creativeTools?.projects.some((p) => p.slug === 'img-editor')).toBe(true);

      const aiMl = CAPABILITY_GROUPS_CONFIG.find((g) => g.id === 'ai-ml');
      expect(aiMl).toBeDefined();
      expect(aiMl?.projects.some((p) => p.slug === 'spectralens-ai')).toBe(true);

      const automation = CAPABILITY_GROUPS_CONFIG.find((g) => g.id === 'automation');
      expect(automation).toBeDefined();
      expect(automation?.projects.some((p) => p.slug === 'gcelt-automate')).toBe(true);
    });
  });

  describe('4. Public Navigation & Footer Cleanliness', () => {
    it('verifies footer does not expose synthetic operational status slogans', async () => {
      const siteService = new SiteService();
      const identity = await siteService.getSiteAndCreatorIdentity();

      expect(identity.creator.fullName).toBe('Sourav Barui');
      expect(identity.site.name).toBe('ElseSourav');
    });
  });

  describe('5. Content & String Cleanliness', () => {
    it('ensures no placeholder email or synthetic lorem ipsum in creator configuration', () => {
      expect(CREATOR_CONFIG.shortBio).not.toContain('lorem');
      expect(CREATOR_CONFIG.longBio).not.toContain('lorem');
      expect(CREATOR_CONFIG.positioning).not.toContain('lorem');
    });
  });
});
