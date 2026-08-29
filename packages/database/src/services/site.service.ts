import { AdminRepository } from '../repositories/admin.repository';
import { SITE_CONFIG, CREATOR_CONFIG } from '@elsesourav/config';
import {
  parseSiteLinks,
  parseContactMethods,
  parseFooterLinks,
  parseStringList,
} from '@elsesourav/validation';
import type { SiteAndCreatorIdentity } from '@elsesourav/types';

export class SiteService {
  constructor(private readonly adminRepo: AdminRepository = new AdminRepository()) {}

  /**
   * Retrieves the authoritative, consolidated Site and Creator identity context.
   * Merges database-managed SiteSetting entries with static configuration fallbacks.
   * This ensures a single unified source of truth across all public pages, metadata,
   * components, and structured data schemas.
   */
  async getSiteAndCreatorIdentity(): Promise<SiteAndCreatorIdentity> {
    const dbSettings = await this.adminRepo
      .getAllSettings()
      .catch(() => ({} as Record<string, string>));

    const siteName = dbSettings['site_name'] || SITE_CONFIG.name;
    const siteTagline = dbSettings['site_tagline'] || SITE_CONFIG.tagline;
    const siteDescription = dbSettings['site_description'] || SITE_CONFIG.description;
    const siteUrl = SITE_CONFIG.url;
    const siteLogoUrl = dbSettings['site_logo_url'] || undefined;
    const siteOgImageUrl = dbSettings['site_og_image_url'] || undefined;
    const siteKeywords = dbSettings['site_keywords'] || undefined;
    const siteStatusBadge = dbSettings['site_status_badge'] || undefined;

    const footerCopyright =
      dbSettings['footer_copyright'] ||
      `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
    const footerText = dbSettings['footer_text'] || '';
    const footerStatusText =
      dbSettings['footer_status_text'] || siteStatusBadge || '● All Systems Operational';
    const footerShowSocials = dbSettings['footer_show_socials'] !== 'false';
    const footerShowBackToTop = dbSettings['footer_show_back_to_top'] !== 'false';
    const footerLinks = parseFooterLinks(dbSettings['footer_links_json']);

    const heroBadge =
      dbSettings['hero_badge'] || `Software & Digital Tools by ${CREATOR_CONFIG.name}`;
    const heroHeadline =
      dbSettings['hero_headline'] || 'Thoughtful software, practical tools, & engineering ideas.';
    const heroSubtitle = dbSettings['hero_subtitle'] || CREATOR_CONFIG.positioning;
    const primaryCtaLabel = dbSettings['primary_cta_label'] || 'Explore Applications';
    const secondaryCtaLabel = dbSettings['secondary_cta_label'] || 'Read Engineering Notes';
    const announcementBanner = dbSettings['announcement_banner'] || undefined;
    const appsTitle = dbSettings['homepage_apps_title'] || 'Featured Software & Tools';
    const appsSubtitle =
      dbSettings['homepage_apps_subtitle'] ||
      'Practical utilities and digital tools crafted for real workflows.';
    const blogTitle = dbSettings['homepage_blog_title'] || 'Technical Writing & Exploration';
    const blogSubtitle =
      dbSettings['homepage_blog_subtitle'] ||
      'Deep-dives on software design, performance, and architecture lessons.';

    const creatorName = dbSettings['creator_name'] || CREATOR_CONFIG.name;
    const creatorHandle = CREATOR_CONFIG.handle;
    const creatorTitle = dbSettings['creator_title'] || CREATOR_CONFIG.identity.title;
    const creatorRole = dbSettings['creator_role'] || CREATOR_CONFIG.identity.role;
    const creatorLocation = dbSettings['creator_location'] || CREATOR_CONFIG.identity.location;
    const creatorAvatarUrl = dbSettings['creator_avatar_url'] || undefined;
    const creatorShortBio = dbSettings['creator_short_bio'] || CREATOR_CONFIG.shortBio;
    const creatorLongBio = dbSettings['creator_long_bio'] || CREATOR_CONFIG.longBio;
    const creatorPositioning = dbSettings['hero_subtitle'] || CREATOR_CONFIG.positioning;

    const creatorPrinciples = parseStringList(
      dbSettings['creator_principles_json'],
      CREATOR_CONFIG.principles
    );
    const creatorFocus = parseStringList(
      dbSettings['creator_focus_json'],
      CREATOR_CONFIG.focus
    );
    const creatorTechnologies = CREATOR_CONFIG.technologies;

    const creatorLinks = parseSiteLinks(dbSettings['social_links_json'], dbSettings);
    const creatorContacts = parseContactMethods(dbSettings['contact_methods_json'], dbSettings);

    return {
      site: {
        name: siteName,
        tagline: siteTagline,
        description: siteDescription,
        url: siteUrl,
        logoUrl: siteLogoUrl,
        ogImageUrl: siteOgImageUrl,
        keywords: siteKeywords,
        statusBadge: siteStatusBadge,
      },
      footer: {
        copyright: footerCopyright,
        text: footerText,
        statusText: footerStatusText,
        showSocials: footerShowSocials,
        showBackToTop: footerShowBackToTop,
        links: footerLinks,
      },
      homepage: {
        heroBadge,
        heroHeadline,
        heroSubtitle,
        primaryCtaLabel,
        secondaryCtaLabel,
        announcementBanner,
        appsTitle,
        appsSubtitle,
        blogTitle,
        blogSubtitle,
      },
      creator: {
        name: creatorName,
        handle: creatorHandle,
        title: creatorTitle,
        role: creatorRole,
        location: creatorLocation,
        avatarUrl: creatorAvatarUrl,
        shortBio: creatorShortBio,
        longBio: creatorLongBio,
        positioning: creatorPositioning,
        principles: creatorPrinciples,
        focus: creatorFocus,
        technologies: creatorTechnologies,
        links: creatorLinks,
        contacts: creatorContacts,
      },
    };
  }
}
