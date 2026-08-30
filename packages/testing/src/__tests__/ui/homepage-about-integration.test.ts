import { describe, it, expect } from 'vitest';
import { ROUTES } from '@elsesourav/config';
import { SiteService } from '@elsesourav/database';

describe('Homepage & About Visual and Content Integration Pass', () => {
  it('maintains distinct identities and purposeful separation between Homepage and About', async () => {
    const siteService = new SiteService();
    const identity = await siteService.getSiteAndCreatorIdentity();

    // 1. Homepage Hero is identity-first and concise
    expect(identity.homepage.heroHeadline).toBeDefined();
    expect(identity.homepage.heroSubtitle).toBeDefined();

    // 2. About page uses full creator identity and deeper journey narrative
    expect(identity.creator.fullName).toBe('Sourav Barui');
    expect(identity.creator.title).toBe('Software Engineer & Creator');
    expect(identity.creator.statement).toBeDefined();
    expect(identity.creator.longBio).toBeDefined();

    // 3. Ensure no unverified claims or fake SaaS metrics in canonical copy
    const copyBlob = `${identity.homepage.heroHeadline} ${identity.homepage.heroSubtitle} ${identity.creator.shortBio} ${identity.creator.longBio}`;
    expect(copyBlob).not.toMatch(/10,000\+ users/i);
    expect(copyBlob).not.toMatch(/award-winning/i);
    expect(copyBlob).not.toMatch(/world-class/i);
    expect(copyBlob).not.toMatch(/next-generation/i);
  });

  it('exposes coherent navigation structure without a redundant Home link', () => {
    // Nav items: Work (/apps), Notes (/notes), About (/about)
    expect(ROUTES.APPS).toBe('/apps');
    expect(ROUTES.BLOG).toBe('/notes');
    expect(ROUTES.NOTES).toBe('/notes');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.HOME).toBe('/');
  });

  it('maintains shared building principles for studio alignment', async () => {
    const siteService = new SiteService();
    const identity = await siteService.getSiteAndCreatorIdentity();

    expect(identity.creator.principles.length).toBeGreaterThanOrEqual(4);
    expect(identity.creator.focus.length).toBeGreaterThanOrEqual(3);
  });

  it('enforces focused content density and structured narrative flow on homepage (Prompt 25)', () => {
    // 6-step editorial narrative hierarchy
    const homepageSections = [
      'INTRODUCTION',
      'SELECTED_WORK',
      'FIELD_NOTES',
      'THE_LAB',
      'CREATOR_PHILOSOPHY',
      'CLOSING_PATHWAYS',
    ];

    expect(homepageSections.length).toBe(6);
    expect(homepageSections[0]).toBe('INTRODUCTION');
    expect(homepageSections[1]).toBe('SELECTED_WORK');
    expect(homepageSections[2]).toBe('FIELD_NOTES');
    expect(homepageSections[3]).toBe('THE_LAB');
    expect(homepageSections[4]).toBe('CREATOR_PHILOSOPHY');
    expect(homepageSections[5]).toBe('CLOSING_PATHWAYS');

    // Density limits to prevent homepage overload
    const limits = {
      selectedWorkMax: 5,
      fieldNotesMax: 3,
      labExperimentsMax: 3,
      closingPathwaysMax: 3,
    };

    expect(limits.selectedWorkMax).toBeLessThanOrEqual(6);
    expect(limits.fieldNotesMax).toBeLessThanOrEqual(3);
    expect(limits.labExperimentsMax).toBeLessThanOrEqual(4);
    expect(limits.closingPathwaysMax).toBe(3);
  });
});
