import { z } from 'zod';
import type { SiteLinkItem, SiteContactItem, SiteFooterLink } from '@elsesourav/types';

export const SiteLinkPlatformSchema = z.enum([
  'github',
  'twitter',
  'linkedin',
  'youtube',
  'discord',
  'telegram',
  'bluesky',
  'email',
  'website',
  'other',
]);

export const SiteLinkItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Label is required').max(80),
  url: z.string().min(1, 'Target URL is required').max(300),
  platform: SiteLinkPlatformSchema.default('website'),
  priority: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const SiteContactMethodTypeSchema = z.enum([
  'email',
  'support_desk',
  'telegram',
  'discord',
  'calendar',
  'phone',
  'matrix',
  'other',
]);

export const SiteContactItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Label is required').max(80),
  value: z.string().min(1, 'Contact detail or URL is required').max(300),
  type: SiteContactMethodTypeSchema.default('email'),
  description: z.string().max(200).optional(),
  priority: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const SiteFooterLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Label is required').max(80),
  url: z.string().min(1, 'URL is required').max(300),
  isExternal: z.boolean().default(false),
  priority: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

/**
 * Typed Zod schema for all known SiteSetting keys managed via Admin.
 *
 * - Plain text fields: regular z.string()
 * - Markdown fields:  labeled with .describe('markdown')
 * - Optional/clearable: .or(z.literal(''))
 *
 * Source of truth for key names — any write to SiteSetting must
 * pass through this schema to prevent typo keys silently polluting the DB.
 */
export const SiteSettingsSchema = z.object({
  // ── Site Identity & Brand ──────────────────────────────────────────────────
  site_name: z.string().min(1).max(100).optional(),
  site_tagline: z.string().min(1).max(200).optional(),
  site_description: z.string().min(1).max(500).optional(),
  site_logo_url: z.string().url().optional().or(z.literal('')),
  site_og_image_url: z.string().url().optional().or(z.literal('')),
  site_keywords: z.string().max(400).optional().or(z.literal('')),
  site_status_badge: z.string().max(120).optional().or(z.literal('')),

  // ── Footer Customization ───────────────────────────────────────────────────
  footer_text: z.string().max(500).optional().or(z.literal('')),
  footer_copyright: z.string().max(200).optional().or(z.literal('')),
  footer_status_text: z.string().max(120).optional().or(z.literal('')),
  footer_show_socials: z.string().max(10).optional().or(z.literal('')),
  footer_show_back_to_top: z.string().max(10).optional().or(z.literal('')),
  /** Dynamic JSON array of SiteFooterLink objects */
  footer_links_json: z.string().optional().or(z.literal('')),

  // ── Homepage Hero & Sections ───────────────────────────────────────────────
  hero_badge: z.string().max(150).optional().or(z.literal('')),
  hero_headline: z.string().max(300).optional().or(z.literal('')),
  hero_subtitle: z.string().max(500).optional().or(z.literal('')),
  primary_cta_label: z.string().max(80).optional().or(z.literal('')),
  secondary_cta_label: z.string().max(80).optional().or(z.literal('')),
  announcement_banner: z.string().max(300).optional().or(z.literal('')),
  homepage_apps_title: z.string().max(150).optional().or(z.literal('')),
  homepage_apps_subtitle: z.string().max(300).optional().or(z.literal('')),
  homepage_blog_title: z.string().max(150).optional().or(z.literal('')),
  homepage_blog_subtitle: z.string().max(300).optional().or(z.literal('')),

  // ── Creator Identity & Profile ─────────────────────────────────────────────
  creator_name: z.string().min(1).max(100).optional(),
  creator_title: z.string().max(150).optional().or(z.literal('')),
  creator_role: z.string().max(150).optional().or(z.literal('')),
  creator_location: z.string().max(100).optional().or(z.literal('')),
  creator_avatar_url: z.string().url().optional().or(z.literal('')),
  creator_short_bio: z.string().max(400).optional().or(z.literal('')),

  // ── Creator Narrative & About Page ─────────────────────────────────────────
  /** Supports Markdown — rendered via MarkdownRenderer on About page */
  creator_long_bio: z.string().max(8000).optional().or(z.literal('')),
  /** JSON array of creator principles (strings) */
  creator_principles_json: z.string().optional().or(z.literal('')),
  /** JSON array of creator focus tags (strings) */
  creator_focus_json: z.string().optional().or(z.literal('')),

  // ── Platform & Social Links (Channels) ────────────────────────────────────
  github_url: z.string().url().optional().or(z.literal('')),
  twitter_url: z.string().url().optional().or(z.literal('')),
  /** Dynamic JSON array of SiteLinkItem objects with priority index */
  social_links_json: z.string().optional().or(z.literal('')),

  // ── Direct Contact & Inquiries ────────────────────────────────────────────
  contact_email: z.string().email().optional().or(z.literal('')),
  support_url: z.string().url().optional().or(z.literal('')),
  /** Dynamic JSON array of SiteContactItem objects with priority index */
  contact_methods_json: z.string().optional().or(z.literal('')),

  // ── Media Library Asset Registry ──────────────────────────────────────────
  /** Direct uploads saved to Media Library */
  media_library_items_json: z.string().optional().or(z.literal('')),
});

export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;

/** All known valid SiteSetting keys. Used to filter unknown keys before DB writes. */
export const KNOWN_SETTING_KEYS = Object.keys(
  SiteSettingsSchema.shape
) as (keyof SiteSettingsInput)[];

/**
 * Validate a settings map of unknown keys.
 * Returns only the known keys, coercing empty strings to their allowed types.
 * Throws if any known key fails its constraint.
 */
export function parseKnownSettings(raw: Record<string, string>): Partial<SiteSettingsInput> {
  // Strip unknown keys before parsing
  const known = Object.fromEntries(
    Object.entries(raw).filter(([k]) => KNOWN_SETTING_KEYS.includes(k as keyof SiteSettingsInput))
  );
  return SiteSettingsSchema.parse(known);
}

/**
 * Parse a JSON string array with fallback to default string array.
 */
export function parseStringList(
  rawJson?: string | null,
  fallback: readonly string[] = []
): string[] {
  if (rawJson && rawJson.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed;
      }
    } catch {
      // Fall through to fallback
    }
  }
  return [...fallback];
}

/**
 * Parse and sort a JSON string or fallback settings into an array of SiteLinkItem.
 * Guaranteed to return items ordered by priority ascending (0, 1, 2, ...).
 */
export function parseSiteLinks(
  rawJson?: string | null,
  fallbackSettings?: Record<string, string>
): SiteLinkItem[] {
  if (rawJson && rawJson.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        const validated = parsed
          .map((item) => {
            const res = SiteLinkItemSchema.safeParse(item);
            return res.success ? res.data : null;
          })
          .filter((item): item is SiteLinkItem => item !== null);

        return validated.sort((a, b) => a.priority - b.priority);
      }
    } catch {
      // Fall through to fallback
    }
  }

  const defaults: SiteLinkItem[] = [];
  let priority = 0;

  const github = fallbackSettings?.['github_url'];
  if (github) {
    defaults.push({
      id: 'github',
      label: 'GitHub',
      url: github,
      platform: 'github',
      priority: priority++,
      isActive: true,
    });
  }

  const twitter = fallbackSettings?.['twitter_url'];
  if (twitter) {
    defaults.push({
      id: 'twitter',
      label: 'Twitter / X',
      url: twitter,
      platform: 'twitter',
      priority: priority++,
      isActive: true,
    });
  }

  return defaults;
}

/**
 * Parse and sort a JSON string or fallback settings into an array of SiteContactItem.
 * Guaranteed to return items ordered by priority ascending (0, 1, 2, ...).
 */
export function parseContactMethods(
  rawJson?: string | null,
  fallbackSettings?: Record<string, string>
): SiteContactItem[] {
  if (rawJson && rawJson.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        const validated = parsed
          .map((item) => {
            const res = SiteContactItemSchema.safeParse(item);
            return res.success ? res.data : null;
          })
          .filter((item): item is SiteContactItem => item !== null);

        return validated.sort((a, b) => a.priority - b.priority);
      }
    } catch {
      // Fall through to fallback
    }
  }

  const defaults: SiteContactItem[] = [];
  let priority = 0;

  const email = fallbackSettings?.['contact_email'];
  if (email) {
    defaults.push({
      id: 'contact_email',
      label: 'Primary Inquiries',
      value: email,
      type: 'email',
      description: 'Direct communication for technical discussions & collaborations',
      priority: priority++,
      isActive: true,
    });
  }

  const support = fallbackSettings?.['support_url'];
  if (support) {
    defaults.push({
      id: 'support_desk',
      label: 'Support Desk',
      value: support,
      type: 'support_desk',
      description: 'Issue tracker and support tickets',
      priority: priority++,
      isActive: true,
    });
  }

  return defaults;
}

/**
 * Parse and sort a JSON string into an array of SiteFooterLink.
 * Guaranteed to return items ordered by priority ascending (0, 1, 2, ...).
 */
export function parseFooterLinks(rawJson?: string | null): SiteFooterLink[] {
  if (rawJson && rawJson.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        const validated: SiteFooterLink[] = [];
        for (const item of parsed) {
          const res = SiteFooterLinkSchema.safeParse(item);
          if (res.success) {
            validated.push(res.data);
          }
        }
        return validated.sort((a, b) => a.priority - b.priority);
      }
    } catch {
      // Fall through
    }
  }
  return [];
}
