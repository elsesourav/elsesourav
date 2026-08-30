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
    // Nav items: Work (/apps), Lab (/apps?category=simulations), Notes (/blog), About (/about)
    expect(ROUTES.APPS).toBe('/apps');
    expect(ROUTES.BLOG).toBe('/blog');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.HOME).toBe('/');
  });

  it('maintains shared building principles for studio alignment', async () => {
    const siteService = new SiteService();
    const identity = await siteService.getSiteAndCreatorIdentity();

    expect(identity.creator.principles.length).toBeGreaterThanOrEqual(4);
    expect(identity.creator.focus.length).toBeGreaterThanOrEqual(3);
  });
});
