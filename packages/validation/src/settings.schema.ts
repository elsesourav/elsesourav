import { z } from 'zod';
import type { SiteLinkItem, SiteContactItem, SiteFooterLink } from '@elsesourav/types';

export const SiteLinkPlatformSchema = z.enum([
  'github',
  'twitter',
  'linkedin',
  'youtube',
  'instagram',
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

export const EffectsLevelSchema = z.enum(['high', 'medium', 'low']);

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
  site_logo_url: z.string().max(1000).optional().or(z.literal('')),
  site_brand_logo_url: z.string().max(1000).optional().or(z.literal('')),
  site_logo_pixels_json: z.string().optional().or(z.literal('')),
  site_og_image_url: z.string().url().optional().or(z.literal('')),
  site_keywords: z.string().max(400).optional().or(z.literal('')),
  site_status_badge: z.string().max(120).optional().or(z.literal('')),

  // ── Visual Fidelity & Scroll Performance ──────────────────────────────────
  /** Visual effects fidelity level: high (full blur/shadows), medium (subdued), low (performance-first/flat) */
  effects_level: z.enum(['high', 'medium', 'low']).default('high').optional().or(z.literal('')),
  /** Interactive cyber portrait neon lighting intensity: 0.0 to 1.0 (subdued to vibrant) */
  portrait_light_intensity: z.string().max(10).optional().or(z.literal('')),
  /** 1:1 Aspect ratio square portrait image URL for dark mode (Cloudinary or optimized local) */
  portrait_image_dark_url: z.string().max(1000).optional().or(z.literal('')),
  /** 1:1 Aspect ratio square portrait image URL for light mode (Cloudinary or optimized local) */
  portrait_image_light_url: z.string().max(1000).optional().or(z.literal('')),
  /** Interactive cyber portrait particle density multiplier: 0.5x, 1.0x, 1.5x, 2.0x, 3.0x */
  portrait_particle_density: z.string().max(20).optional().or(z.literal('')),
  /** Interactive cyber portrait particle size multiplier: 0.6x, 0.8x, 1.0x, 1.3x, 1.6x */
  portrait_particle_size: z.string().max(20).optional().or(z.literal('')),
  /** Interactive cyber portrait glow brightness multiplier: 0.5x, 1.0x, 1.5x, 2.0x, 3.0x */
  portrait_glow_brightness: z.string().max(20).optional().or(z.literal('')),
  /** Interactive cyber portrait intro flight movement speed multiplier: 0.5x, 0.75x, 1.0x, 1.5x, 2.0x */
  portrait_flight_speed: z.string().max(20).optional().or(z.literal('')),
  /** Interactive cyber portrait contour path spread ribbon width: 1.0px, 1.8px, 2.6px, 3.8px, 5.2px */
  portrait_path_spread: z.string().max(20).optional().or(z.literal('')),
  /** Admin-only silhouette contour path guide line toggle switch: 'true' | 'false' */
  portrait_show_path_guide: z.string().max(10).optional().or(z.literal('')),
  /** Edge detection algorithm: 'perimeter' | 'sobel' | 'radial' */
  portrait_edge_algorithm: z.string().max(30).optional().or(z.literal('')),
  /** Edge alpha & gradient detection sensitivity threshold: 5 to 100 */
  portrait_edge_threshold: z.string().max(10).optional().or(z.literal('')),
  /** Pin contour endpoints flush to canvas bottom: 'true' | 'false' */
  portrait_pin_bottom_edge: z.string().max(10).optional().or(z.literal('')),
  /** Top glow crystalline particle size multiplier: 0.6x, 0.85x, 1.0x, 1.3x, 1.6x */
  portrait_top_particle_size: z.string().max(20).optional().or(z.literal('')),
  /** Top glow particle count quantity multiplier: 0.5x, 1.0x, 1.5x, 2.0x, 3.0x */
  portrait_top_particle_quantity: z.string().max(20).optional().or(z.literal('')),
  /** Top glow particle travel speed multiplier: 0.5x, 1.0x, 1.5x, 2.0x, 3.0x */
  portrait_top_particle_speed: z.string().max(20).optional().or(z.literal('')),
  /** Top glow crystalline particle reach and halo distance: 4px, 8px, 14px, 22px, 32px */
  portrait_glow_distance: z.string().max(20).optional().or(z.literal('')),
  /** Backside retro diamond stars quantity: 'off', '8', '16', '32', '48' */
  portrait_backside_stars: z.string().max(20).optional().or(z.literal('')),
  /** Backside animated halo ring density multiplier: 'off', 0.5x, 1.0x, 1.5x, 2.0x */
  portrait_backside_halo: z.string().max(20).optional().or(z.literal('')),
  /** Backside celestial orbit loops: '0', '1', '2', '3', '4' */
  portrait_backside_orbits: z.string().max(20).optional().or(z.literal('')),
  /** Backside ambient cosmic specks multiplier: 'off', 0.5x, 1.0x, 2.0x */
  portrait_backside_specks: z.string().max(20).optional().or(z.literal('')),
  /** Photographic pixel simulation grid quality / resolution: '512', '384', '256', '224', '192', '144', '112' */
  portrait_image_resolution: z.string().max(20).optional().or(z.literal('')),
  /** Desktop grid resolution: '512', '384', '256', '224', '192', '144' */
  portrait_image_resolution_desktop: z.string().max(20).optional().or(z.literal('')),
  /** Tablet grid resolution: '384', '256', '224', '192', '144', '112' */
  portrait_image_resolution_tablet: z.string().max(20).optional().or(z.literal('')),
  /** Mobile grid resolution: '224', '192', '160', '144', '112' */
  portrait_image_resolution_mobile: z.string().max(20).optional().or(z.literal('')),
  /** Full per-device settings JSON string for Desktop target */
  portrait_config_desktop: z.string().optional().or(z.literal('')),
  /** Full per-device settings JSON string for Tablet target */
  portrait_config_tablet: z.string().optional().or(z.literal('')),
  /** Full per-device settings JSON string for Mobile target */
  portrait_config_mobile: z.string().optional().or(z.literal('')),
  /** Click & touch impulse blast force multiplier: 0.1x to 1.8x */
  portrait_click_force: z.string().max(20).optional().or(z.literal('')),
  /** Elastic return bounce / spring speed multiplier: 1.5 to 10.0 */
  portrait_bounce_speed: z.string().max(20).optional().or(z.literal('')),
  /** Localized click disturbance radius: 24px, 48px, 80px, 140px, full */
  portrait_click_radius: z.string().max(20).optional().or(z.literal('')),
  /** Touch & cursor hover pixel displacement push speed multiplier: 0.3x, 0.6x, 1.0x, 1.5x, 2.2x */
  portrait_hover_speed: z.string().max(20).optional().or(z.literal('')),
  /** Touch & cursor hover detection proximity radius: 30px, 55px, 85px, 120px, 160px */
  portrait_hover_threshold: z.string().max(20).optional().or(z.literal('')),
  /** Click shockwave blast ripple expansion speed multiplier: 0.3x, 0.6x, 1.0x, 1.6x, 2.4x */
  portrait_click_speed: z.string().max(20).optional().or(z.literal('')),
  /** Initial arrival flight intro animation duration: '0.1s', '0.3s', '0.5s', '0.8s', '1.0s', '1.3s', '1.5s', '1.8s', '2.0s', '2.5s', '3.0s' */
  portrait_intro_animation: z.string().max(20).optional().or(z.literal('')),
  /** Initial arrival intro pixel dispersion spreadness: 0.5x, 0.8x, 1.0x, 1.5x, 2.2x, 3.0x */
  portrait_intro_spread: z.string().max(20).optional().or(z.literal('')),
  /** Initial arrival intro pixel pattern: 'vortex', 'stagger', 'wave', 'warp' */
  portrait_intro_pattern: z.string().max(30).optional().or(z.literal('')),

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
  closing_cta_title: z.string().max(150).optional().or(z.literal('')),
  closing_cta_subtitle: z.string().max(300).optional().or(z.literal('')),
  homepage_atmosphere_density: z.string().max(20).optional().or(z.literal('')),
  homepage_meteor_frequency: z.string().max(30).optional().or(z.literal('')),
  homepage_stars_speed: z.string().max(20).optional().or(z.literal('')),
  homepage_mobile_effects: z.string().max(30).optional().or(z.literal('')),
  philosophy_badge: z.string().max(100).optional().or(z.literal('')),
  philosophy_cta_label: z.string().max(100).optional().or(z.literal('')),
  philosophy_cta_url: z.string().max(300).optional().or(z.literal('')),

  // ── Creator Identity & Profile ─────────────────────────────────────────────
  creator_name: z.string().min(1).max(100).optional(),
  creator_full_name: z.string().max(100).optional().or(z.literal('')),
  creator_title: z.string().max(150).optional().or(z.literal('')),
  creator_role: z.string().max(150).optional().or(z.literal('')),
  creator_location: z.string().max(100).optional().or(z.literal('')),
  creator_avatar_url: z
    .string()
    .url()
    .or(z.string().regex(/^\/[a-zA-Z0-9_\-./]+$/))
    .optional()
    .or(z.literal('')),
  /** Dynamic JSON array of AvatarPreset objects for user account studio */
  account_preset_avatars_json: z.string().optional().or(z.literal('')),
  creator_positioning: z.string().max(500).optional().or(z.literal('')),
  creator_statement: z.string().max(500).optional().or(z.literal('')),
  creator_short_bio: z.string().max(400).optional().or(z.literal('')),

  // ── Creator Narrative & About Page ─────────────────────────────────────────
  /** Supports Markdown — rendered via MarkdownRenderer on About page */
  creator_long_bio: z.string().max(8000).optional().or(z.literal('')),
  about_intro: z.string().max(1000).optional().or(z.literal('')),
  about_philosophy_markdown: z.string().max(8000).optional().or(z.literal('')),
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

  // ── Legal & Compliance Content ────────────────────────────────────────────
  /** Full Privacy Policy content in Markdown — rendered on /privacy */
  legal_privacy_md: z.string().max(50000).optional().or(z.literal('')),
  /** Full Terms of Service content in Markdown — rendered on /terms */
  legal_terms_md: z.string().max(50000).optional().or(z.literal('')),
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
