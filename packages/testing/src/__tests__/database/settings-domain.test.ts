import {
  AdminRepository,
  AppRepository,
  mapPrismaAppToDomain,
  mapPrismaAppToPublicDetail,
  PrismaClient,
  PublishStatus,
} from '@elsesourav/database';
import {
  KNOWN_SETTING_KEYS,
  parseContactMethods,
  parseFooterLinks,
  parseKnownSettings,
  parseSiteLinks,
  parseStringList,
  SiteLinkItemSchema,
  SiteSettingsSchema,
} from '@elsesourav/validation';
import { describe, expect, it, vi } from 'vitest';

describe('Site Settings & Content Architecture (Prompt 01 + Prompt 02 Extended)', () => {
  describe('Site Settings Schema & Validation', () => {
    it('contains all defined setting keys including site branding, footer customization, and creator profile', () => {
      expect(KNOWN_SETTING_KEYS.length).toBeGreaterThanOrEqual(39);
      expect(KNOWN_SETTING_KEYS).toContain('site_name');
      expect(KNOWN_SETTING_KEYS).toContain('site_logo_url');
      expect(KNOWN_SETTING_KEYS).toContain('creator_full_name');
      expect(KNOWN_SETTING_KEYS).toContain('creator_positioning');
      expect(KNOWN_SETTING_KEYS).toContain('closing_cta_title');
      expect(KNOWN_SETTING_KEYS).toContain('site_og_image_url');
      expect(KNOWN_SETTING_KEYS).toContain('site_keywords');
      expect(KNOWN_SETTING_KEYS).toContain('creator_avatar_url');
      expect(KNOWN_SETTING_KEYS).toContain('social_links_json');
      expect(KNOWN_SETTING_KEYS).toContain('contact_methods_json');
      expect(KNOWN_SETTING_KEYS).toContain('footer_links_json');
      expect(KNOWN_SETTING_KEYS).toContain('footer_status_text');
      expect(KNOWN_SETTING_KEYS).toContain('footer_show_socials');
      expect(KNOWN_SETTING_KEYS).toContain('footer_show_back_to_top');
      expect(KNOWN_SETTING_KEYS).toContain('media_library_items_json');
      expect(KNOWN_SETTING_KEYS).toContain('creator_long_bio');
      expect(KNOWN_SETTING_KEYS).toContain('creator_principles_json');
      expect(KNOWN_SETTING_KEYS).toContain('creator_focus_json');
      expect(KNOWN_SETTING_KEYS).toContain('homepage_apps_title');
      expect(KNOWN_SETTING_KEYS).toContain('homepage_blog_title');
      expect(KNOWN_SETTING_KEYS).toContain('footer_copyright');
      expect(KNOWN_SETTING_KEYS).toContain('footer_text');
      expect(KNOWN_SETTING_KEYS).toContain('hero_headline');
      expect(KNOWN_SETTING_KEYS).toContain('github_url');
      expect(KNOWN_SETTING_KEYS).toContain('contact_email');
    });

    it('parses string list JSON arrays with fallback', () => {
      const parsed = parseStringList(JSON.stringify(['Principle 1', 'Principle 2']), ['Default 1']);
      expect(parsed).toEqual(['Principle 1', 'Principle 2']);

      const fallbackResult = parseStringList(null, ['Default 1', 'Default 2']);
      expect(fallbackResult).toEqual(['Default 1', 'Default 2']);

      const corruptedResult = parseStringList('invalid-json', ['Default']);
      expect(corruptedResult).toEqual(['Default']);
    });

    it('filters out unknown/typo keys when parsing raw input', () => {
      const raw = {
        site_name: 'ElseSourav Platform',
        unknown_hacked_key: 'malicious_content',
        creator_title: 'Software Architect',
        creator_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        another_typo: 'ignored',
      };

      const result = parseKnownSettings(raw);
      expect(result).toEqual({
        site_name: 'ElseSourav Platform',
        creator_title: 'Software Architect',
        creator_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      });
      expect(result).not.toHaveProperty('unknown_hacked_key');
      expect(result).not.toHaveProperty('another_typo');
    });

    it('enforces url and email formats', () => {
      expect(() =>
        SiteSettingsSchema.parse({
          contact_email: 'not-an-email',
        })
      ).toThrow();

      expect(() =>
        SiteSettingsSchema.parse({
          github_url: 'not-a-valid-url',
        })
      ).toThrow();

      expect(() =>
        SiteSettingsSchema.parse({
          creator_avatar_url: 'not-a-valid-avatar-url',
        })
      ).toThrow();

      const valid = SiteSettingsSchema.parse({
        contact_email: 'contact@elsesourav.com',
        github_url: 'https://github.com/elsesourav',
        twitter_url: 'https://twitter.com/elsesourav',
        creator_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      });
      expect(valid.contact_email).toBe('contact@elsesourav.com');
      expect(valid.github_url).toBe('https://github.com/elsesourav');
      expect(valid.creator_avatar_url).toBe(
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
      );
    });

    it('allows empty strings for clearable optional fields', () => {
      const parsed = SiteSettingsSchema.parse({
        announcement_banner: '',
        github_url: '',
        twitter_url: '',
        contact_email: '',
        creator_avatar_url: '',
        social_links_json: '',
        contact_methods_json: '',
      });
      expect(parsed.announcement_banner).toBe('');
      expect(parsed.github_url).toBe('');
      expect(parsed.creator_avatar_url).toBe('');
    });
  });

  describe('Dynamic Links & Priority Index System', () => {
    it('validates SiteLinkItemSchema correctly', () => {
      const validItem = SiteLinkItemSchema.parse({
        id: 'link-1',
        label: 'GitHub Profile',
        url: 'https://github.com/elsesourav',
        platform: 'github',
        priority: 0,
        isActive: true,
      });
      expect(validItem.platform).toBe('github');
      expect(validItem.priority).toBe(0);

      expect(() =>
        SiteLinkItemSchema.parse({
          id: 'link-bad',
          label: '',
          url: 'not-url',
        })
      ).toThrow();
    });

    it('parses and sorts JSON links by priority ascending', () => {
      const rawJson = JSON.stringify([
        {
          id: '3',
          label: 'Discord',
          url: 'https://discord.gg/test',
          platform: 'discord',
          priority: 5,
          isActive: true,
        },
        {
          id: '1',
          label: 'GitHub',
          url: 'https://github.com/test',
          platform: 'github',
          priority: 0,
          isActive: true,
        },
        {
          id: '2',
          label: 'Twitter',
          url: 'https://x.com/test',
          platform: 'twitter',
          priority: 2,
          isActive: true,
        },
      ]);

      const links = parseSiteLinks(rawJson);
      expect(links).toHaveLength(3);
      expect(links[0]?.label).toBe('GitHub');
      expect(links[0]?.priority).toBe(0);
      expect(links[1]?.label).toBe('Twitter');
      expect(links[1]?.priority).toBe(2);
      expect(links[2]?.label).toBe('Discord');
      expect(links[2]?.priority).toBe(5);
    });

    it('falls back to constructing priority-ordered links from individual settings keys if JSON is missing', () => {
      const fallback = {
        github_url: 'https://github.com/elsesourav',
        twitter_url: 'https://twitter.com/elsesourav',
      };

      const links = parseSiteLinks(null, fallback);
      expect(links).toHaveLength(2);
      expect(links[0]?.platform).toBe('github');
      expect(links[0]?.priority).toBe(0);
      expect(links[1]?.platform).toBe('twitter');
      expect(links[1]?.priority).toBe(1);
    });
  });

  describe('Direct Contact Methods System', () => {
    it('validates and parses SiteContactItem correctly', () => {
      const rawJson = JSON.stringify([
        {
          id: 'c1',
          label: 'Primary Inquiries',
          value: 'contact@elsesourav.com',
          type: 'email',
          priority: 0,
          isActive: true,
        },
        {
          id: 'c2',
          label: 'Support Desk',
          value: 'https://elsesourav.com/support',
          type: 'support_desk',
          priority: 1,
          isActive: true,
        },
      ]);

      const contacts = parseContactMethods(rawJson);
      expect(contacts).toHaveLength(2);
      expect(contacts[0]?.type).toBe('email');
      expect(contacts[1]?.type).toBe('support_desk');
    });

    it('falls back to constructing contact methods from contact_email and support_url', () => {
      const fallback = {
        contact_email: 'contact@elsesourav.com',
        support_url: 'https://elsesourav.com/support',
      };

      const contacts = parseContactMethods(null, fallback);
      expect(contacts).toHaveLength(2);
      expect(contacts[0]?.value).toBe('contact@elsesourav.com');
      expect(contacts[1]?.value).toBe('https://elsesourav.com/support');
    });
  });

  describe('Custom Footer Navigation System', () => {
    it('validates and parses SiteFooterLink correctly', () => {
      const rawJson = JSON.stringify([
        {
          id: 'f1',
          label: 'Status',
          url: 'https://status.elsesourav.com',
          isExternal: true,
          priority: 0,
          isActive: true,
        },
        {
          id: 'f2',
          label: 'Changelog',
          url: '/changelog',
          isExternal: false,
          priority: 1,
          isActive: true,
        },
      ]);

      const footerLinks = parseFooterLinks(rawJson);
      expect(footerLinks).toHaveLength(2);
      expect(footerLinks[0]?.label).toBe('Status');
      expect(footerLinks[0]?.isExternal).toBe(true);
      expect(footerLinks[1]?.label).toBe('Changelog');
      expect(footerLinks[1]?.isExternal).toBe(false);
    });

    it('returns empty array when footer_links_json is missing or corrupted', () => {
      expect(parseFooterLinks(null)).toEqual([]);
      expect(parseFooterLinks('invalid-json')).toEqual([]);
    });
  });

  describe('AdminRepository Site Settings Operations', () => {
    it('fetches a single setting key', async () => {
      const mockPrisma = {
        siteSetting: {
          findUnique: vi.fn().mockResolvedValue({
            key: 'site_name',
            value: 'ElseSourav',
            description: 'Site title',
          }),
        },
      } as unknown as PrismaClient;

      const repo = new AdminRepository(mockPrisma);
      const val = await repo.getSetting('site_name');

      expect(val).toBe('ElseSourav');
      expect(mockPrisma.siteSetting.findUnique).toHaveBeenCalledWith({
        where: { key: 'site_name' },
      });
    });

    it('upserts a setting with description and updatedBy audit info', async () => {
      const mockPrisma = {
        siteSetting: {
          upsert: vi.fn().mockResolvedValue({}),
        },
      } as unknown as PrismaClient;

      const repo = new AdminRepository(mockPrisma);
      await repo.upsertSetting('hero_headline', 'New Headline', 'Hero headline', 'user-admin-1');

      expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'hero_headline' },
        update: { value: 'New Headline', description: 'Hero headline', updatedBy: 'user-admin-1' },
        create: {
          key: 'hero_headline',
          value: 'New Headline',
          description: 'Hero headline',
          updatedBy: 'user-admin-1',
        },
      });
    });

    it('fetches all settings as a key-value record', async () => {
      const mockPrisma = {
        siteSetting: {
          findMany: vi.fn().mockResolvedValue([
            { key: 'site_name', value: 'ElseSourav' },
            { key: 'creator_name', value: 'Sourav' },
          ]),
        },
      } as unknown as PrismaClient;

      const repo = new AdminRepository(mockPrisma);
      const all = await repo.getAllSettings();

      expect(all).toEqual({
        site_name: 'ElseSourav',
        creator_name: 'Sourav',
      });
    });
  });

  describe('App documentationMd Markdown Architecture', () => {
    const basePrismaApp = {
      id: 'app-terminal',
      slug: 'terminal-pro',
      name: 'Terminal Pro',
      shortDescription: 'Hardware accelerated terminal',
      description: 'A full-featured terminal emulator.',
      documentationMd: '## Terminal Pro Documentation\n\nFull guide here.',
      iconUrl: 'https://elsesourav.com/icon.png',
      featuredImageUrl: null,
      demoUrl: null,
      videoUrl: null,
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      isFeatured: true,
      isPinned: false,
      currentVersion: '2.1.0',
      seoTitle: null,
      seoDescription: null,
      publishedAt: new Date('2026-01-01T00:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
      deletedAt: null,
      categoryId: 'cat-1',
      category: {
        id: 'cat-1',
        name: 'Developer Tools',
        slug: 'dev-tools',
        description: null,
        icon: null,
        orderIndex: 0,
        isActive: true,
      },
      tags: [],
      links: [],
      versions: [],
      stats: {
        appId: 'app-terminal',
        views: 10,
        launches: 5,
        libraryAdds: 2,
        ratingAverage: 5.0,
        ratingCount: 1,
      },
    };

    it('maps documentationMd from Prisma model to domain App and PublicApp entities', () => {
      const domainApp = mapPrismaAppToDomain(basePrismaApp);
      expect(domainApp.documentationMd).toBe('## Terminal Pro Documentation\n\nFull guide here.');

      const publicDetail = mapPrismaAppToPublicDetail(basePrismaApp);
      expect(publicDetail.documentationMd).toBe(
        '## Terminal Pro Documentation\n\nFull guide here.'
      );
    });

    it('handles null documentationMd cleanly without crashing', () => {
      const appWithoutDocs = { ...basePrismaApp, documentationMd: null };
      const domainApp = mapPrismaAppToDomain(appWithoutDocs);
      expect(domainApp.documentationMd).toBeUndefined();

      const publicDetail = mapPrismaAppToPublicDetail(appWithoutDocs);
      expect(publicDetail.documentationMd).toBeUndefined();
    });

    it('creates an app with documentationMd in AppRepository', async () => {
      const mockPrisma = {
        app: {
          create: vi.fn().mockResolvedValue(basePrismaApp),
        },
      } as unknown as PrismaClient;

      const repo = new AppRepository(mockPrisma);
      await repo.create({
        name: 'Terminal Pro',
        slug: 'terminal-pro',
        shortDescription: 'Hardware accelerated terminal',
        description: 'A full-featured terminal emulator.',
        documentationMd: '## Getting Started Guide',
        iconUrl: 'https://elsesourav.com/icon.png',
        categoryId: 'cat-1',
      });

      expect(mockPrisma.app.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            documentationMd: '## Getting Started Guide',
          }),
        })
      );
    });

    it('updates an app with documentationMd in AppRepository', async () => {
      const mockPrisma = {
        app: {
          update: vi.fn().mockResolvedValue(basePrismaApp),
        },
      } as unknown as PrismaClient;

      const repo = new AppRepository(mockPrisma);
      await repo.update('app-terminal', {
        documentationMd: '## Updated Guide',
      });

      expect(mockPrisma.app.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'app-terminal' },
          data: expect.objectContaining({
            documentationMd: '## Updated Guide',
          }),
        })
      );
    });
  });
});
