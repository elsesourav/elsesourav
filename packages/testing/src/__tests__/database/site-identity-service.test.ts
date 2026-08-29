import { describe, expect, it, vi } from 'vitest';
import { SiteService, AdminRepository } from '@elsesourav/database';
import { SITE_CONFIG, CREATOR_CONFIG } from '@elsesourav/config';

describe('SiteService & Unified Identity Architecture (Prompt 03)', () => {
  it('returns default fallback configuration when database settings are empty', async () => {
    const mockAdminRepo = {
      getAllSettings: vi.fn().mockResolvedValue({}),
    } as unknown as AdminRepository;

    const siteService = new SiteService(mockAdminRepo);
    const identity = await siteService.getSiteAndCreatorIdentity();

    // Site Identity verification
    expect(identity.site.name).toBe(SITE_CONFIG.name);
    expect(identity.site.tagline).toBe(SITE_CONFIG.tagline);
    expect(identity.site.description).toBe(SITE_CONFIG.description);
    expect(identity.site.url).toBe(SITE_CONFIG.url);

    // Creator Identity verification
    expect(identity.creator.name).toBe(CREATOR_CONFIG.name);
    expect(identity.creator.handle).toBe(CREATOR_CONFIG.handle);
    expect(identity.creator.title).toBe(CREATOR_CONFIG.identity.title);
    expect(identity.creator.role).toBe(CREATOR_CONFIG.identity.role);
    expect(identity.creator.location).toBe(CREATOR_CONFIG.identity.location);
    expect(identity.creator.shortBio).toBe(CREATOR_CONFIG.shortBio);
    expect(identity.creator.longBio).toBe(CREATOR_CONFIG.longBio);
    expect(identity.creator.principles).toEqual(CREATOR_CONFIG.principles);
    expect(identity.creator.focus).toEqual(CREATOR_CONFIG.focus);

    // Footer verification
    expect(identity.footer.showSocials).toBe(true);
    expect(identity.footer.showBackToTop).toBe(true);
    expect(identity.footer.links).toEqual([]);
  });

  it('merges and prioritizes database-configured site and creator values over defaults', async () => {
    const mockAdminRepo = {
      getAllSettings: vi.fn().mockResolvedValue({
        site_name: 'ElseSourav Custom',
        site_tagline: 'Custom Engineering & Tools',
        site_description: 'Custom platform description',
        site_logo_url: 'https://cdn.elsesourav.com/logo.svg',
        site_status_badge: '● 99.9% Uptime',
        creator_name: 'Sourav S.',
        creator_title: 'Staff Engineer & Builder',
        creator_role: 'Founder & Software Architect',
        creator_location: 'Global / Remote',
        creator_avatar_url: 'https://cdn.elsesourav.com/avatar.jpg',
        creator_short_bio: 'Custom short biography.',
        creator_long_bio: '# Custom Long Bio\nBuilding resilient software.',
        creator_principles_json: JSON.stringify(['Simplicity first', 'Zero technical debt']),
        creator_focus_json: JSON.stringify(['Distributed Systems', 'UI Architecture']),
        social_links_json: JSON.stringify([
          { id: '1', label: 'GitHub', url: 'https://github.com/custom', platform: 'github', priority: 0, isActive: true },
          { id: '2', label: 'X', url: 'https://x.com/custom', platform: 'twitter', priority: 1, isActive: true },
        ]),
        contact_methods_json: JSON.stringify([
          { id: 'c1', label: 'Direct Email', value: 'hello@custom.com', type: 'email', priority: 0, isActive: true },
        ]),
        footer_copyright: '© 2026 ElseSourav Custom',
        footer_text: 'Built for builders.',
        footer_status_text: '● Operational',
        footer_show_socials: 'true',
        footer_show_back_to_top: 'false',
        footer_links_json: JSON.stringify([
          { id: 'f1', label: 'Privacy Portal', url: '/privacy', isExternal: false, priority: 0, isActive: true },
        ]),
      }),
    } as unknown as AdminRepository;

    const siteService = new SiteService(mockAdminRepo);
    const identity = await siteService.getSiteAndCreatorIdentity();

    // Site Identity
    expect(identity.site.name).toBe('ElseSourav Custom');
    expect(identity.site.tagline).toBe('Custom Engineering & Tools');
    expect(identity.site.logoUrl).toBe('https://cdn.elsesourav.com/logo.svg');
    expect(identity.site.statusBadge).toBe('● 99.9% Uptime');

    // Creator Identity
    expect(identity.creator.name).toBe('Sourav S.');
    expect(identity.creator.title).toBe('Staff Engineer & Builder');
    expect(identity.creator.role).toBe('Founder & Software Architect');
    expect(identity.creator.avatarUrl).toBe('https://cdn.elsesourav.com/avatar.jpg');
    expect(identity.creator.shortBio).toBe('Custom short biography.');
    expect(identity.creator.longBio).toBe('# Custom Long Bio\nBuilding resilient software.');
    expect(identity.creator.principles).toEqual(['Simplicity first', 'Zero technical debt']);
    expect(identity.creator.focus).toEqual(['Distributed Systems', 'UI Architecture']);

    // Links & Contacts
    expect(identity.creator.links).toHaveLength(2);
    expect(identity.creator.links[0]?.platform).toBe('github');
    expect(identity.creator.contacts).toHaveLength(1);
    expect(identity.creator.contacts[0]?.value).toBe('hello@custom.com');

    // Footer
    expect(identity.footer.copyright).toBe('© 2026 ElseSourav Custom');
    expect(identity.footer.text).toBe('Built for builders.');
    expect(identity.footer.statusText).toBe('● Operational');
    expect(identity.footer.showSocials).toBe(true);
    expect(identity.footer.showBackToTop).toBe(false);
    expect(identity.footer.links).toHaveLength(1);
    expect(identity.footer.links[0]?.label).toBe('Privacy Portal');
  });

  it('safely handles database retrieval failures without crashing', async () => {
    const mockAdminRepo = {
      getAllSettings: vi.fn().mockRejectedValue(new Error('Database offline')),
    } as unknown as AdminRepository;

    const siteService = new SiteService(mockAdminRepo);
    const identity = await siteService.getSiteAndCreatorIdentity();

    expect(identity).toBeDefined();
    expect(identity.site.name).toBe(SITE_CONFIG.name);
    expect(identity.creator.name).toBe(CREATOR_CONFIG.name);
    expect(identity.creator.principles).toEqual(CREATOR_CONFIG.principles);
  });
});
