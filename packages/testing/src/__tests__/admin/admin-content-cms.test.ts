import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SiteSettingsSchema,
  parseKnownSettings,
  parseStringList,
  parseSiteLinks,
  parseContactMethods,
} from '@elsesourav/validation';
import { SiteService, AdminRepository } from '@elsesourav/database';

describe('Admin Content Management Layer — Homepage, Creator, About (Prompt 26)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates canonical homepage and hero settings via Zod schema', () => {
    const validHomepageInput = {
      hero_badge: 'Software Creator & Engineer',
      hero_headline: "I'm Sourav. I build software, tools, games, and experiments.",
      hero_subtitle: 'Exploring ideas across web architecture, AI, graphics, and systems.',
      primary_cta_label: 'Explore Work',
      secondary_cta_label: 'Read Notes',
      announcement_banner: 'New release: SpectraLens AI v2.4',
      homepage_apps_title: "A few things I've built.",
      homepage_apps_subtitle: 'A curated selection of software, developer tools, and games.',
      homepage_blog_title: 'Field Notes & Reflections',
      homepage_blog_subtitle: 'Things I write about while building software and learning tools.',
      closing_cta_title: 'Explore the ElseSourav Studio',
      closing_cta_subtitle: 'Every project, note, and experiment is built independently.',
    };

    const parsed = SiteSettingsSchema.safeParse(validHomepageInput);
    expect(parsed.success).toBe(true);
  });

  it('validates canonical creator profile and narrative settings via Zod schema', () => {
    const validCreatorInput = {
      creator_name: 'Sourav',
      creator_full_name: 'Sourav Barui',
      creator_title: 'Software Engineer & Creator',
      creator_role: 'Independent Software Creator',
      creator_location: 'Kolkata, India / Worldwide',
      creator_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      creator_positioning: 'Independent software creator building practical tools.',
      creator_statement:
        'I care about software that is understandable, useful, fast, and considerate.',
      creator_short_bio: 'Software engineer building tools and games.',
      creator_long_bio:
        '### My Journey\n\nI started programming by exploring low-level algorithms...',
      about_intro: 'About Sourav Barui, an independent software creator.',
      about_philosophy_markdown: '### Philosophy\n\n- Deterministic builds\n- Zero vanity metrics',
    };

    const parsed = SiteSettingsSchema.safeParse(validCreatorInput);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid email and malformed URL values in settings payload', () => {
    const invalidInput = {
      contact_email: 'not-an-email',
      github_url: 'htt//invalid-url',
    };

    const parsed = SiteSettingsSchema.safeParse(invalidInput);
    expect(parsed.success).toBe(false);
  });

  it('filters unknown keys from raw payload using parseKnownSettings', () => {
    const rawWithExtra = {
      creator_name: 'Sourav',
      unknown_hack_key: 'malicious_content',
      site_name: 'ElseSourav',
    };

    const clean = parseKnownSettings(rawWithExtra);
    expect(clean.creator_name).toBe('Sourav');
    expect(clean.site_name).toBe('ElseSourav');
    expect((clean as Record<string, unknown>)['unknown_hack_key']).toBeUndefined();
  });

  it('correctly serializes and deserializes structured principles, focus tags, and links', () => {
    const principles = ['Accessibility by default', 'Deterministic builds', 'Zero vanity metrics'];
    const serializedPrinciples = JSON.stringify(principles);
    const parsedPrinciples = parseStringList(serializedPrinciples);
    expect(parsedPrinciples).toEqual(principles);

    const links = [
      {
        id: 'l1',
        label: 'GitHub',
        url: 'https://github.com/elsesourav',
        platform: 'github' as const,
        priority: 0,
        isActive: true,
      },
      {
        id: 'l2',
        label: 'Twitter',
        url: 'https://x.com/elsesourav',
        platform: 'twitter' as const,
        priority: 1,
        isActive: true,
      },
    ];
    const serializedLinks = JSON.stringify(links);
    const parsedLinks = parseSiteLinks(serializedLinks);
    expect(parsedLinks.length).toBe(2);
    expect(parsedLinks[0]?.label).toBe('GitHub');
    expect(parsedLinks[1]?.platform).toBe('twitter');

    const contacts = [
      {
        id: 'c1',
        label: 'Email',
        value: 'hello@sourav.dev',
        type: 'email' as const,
        priority: 0,
        isActive: true,
      },
    ];
    const serializedContacts = JSON.stringify(contacts);
    const parsedContacts = parseContactMethods(serializedContacts);
    expect(parsedContacts.length).toBe(1);
    expect(parsedContacts[0]?.value).toBe('hello@sourav.dev');
  });

  it('verifies SiteService merges database settings into unified public identity', async () => {
    const mockAdminRepo = {
      getAllSettings: vi.fn().mockResolvedValue({
        creator_name: 'Sourav Custom',
        creator_full_name: 'Sourav Barui Custom',
        hero_headline: 'Custom Headline',
        creator_principles_json: JSON.stringify(['Custom Principle 1']),
      }),
    } as unknown as AdminRepository;

    const siteService = new SiteService(mockAdminRepo);
    const identity = await siteService.getSiteAndCreatorIdentity();

    expect(identity.creator.name).toBe('Sourav Custom');
    expect(identity.creator.fullName).toBe('Sourav Barui Custom');
    expect(identity.homepage.heroHeadline).toBe('Custom Headline');
    expect(identity.creator.principles).toEqual(['Custom Principle 1']);
  });
});
