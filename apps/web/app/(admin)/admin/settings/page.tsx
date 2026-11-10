import type { Metadata } from 'next';
import { requireAdmin } from '@/features/admin/guards/require-admin';
import { AdminRepository } from '@elsesourav/database';
import { SITE_CONFIG, CREATOR_CONFIG } from '@elsesourav/config';
import { Badge } from '@elsesourav/ui';
import { AdminSettingsForm } from '@/features/admin/settings/components/AdminSettingsForm';

export const metadata: Metadata = {
  title: 'Portal & Content Configuration | Admin',
  description:
    'Manage dynamic website identity, creator bio, and homepage copy without code changes.',
};

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();

  const adminRepo = new AdminRepository();
  const dbSettings: Record<string, string> = await adminRepo.getAllSettings().catch(() => ({}));

  // Initial merged settings (DB overrides static defaults)
  const initialSettings: Record<string, string> = {
    site_name: dbSettings['site_name'] || SITE_CONFIG.name,
    site_tagline: dbSettings['site_tagline'] || SITE_CONFIG.tagline,
    site_description: dbSettings['site_description'] || SITE_CONFIG.description,
    hero_badge: dbSettings['hero_badge'] || `Software & Digital Tools by ${CREATOR_CONFIG.name}`,
    hero_headline:
      dbSettings['hero_headline'] || 'Thoughtful software, practical tools, & engineering ideas.',
    hero_subtitle: dbSettings['hero_subtitle'] || CREATOR_CONFIG.positioning,
    primary_cta_label: dbSettings['primary_cta_label'] || 'Explore Applications',
    secondary_cta_label: dbSettings['secondary_cta_label'] || 'Read Updates',
    announcement_banner: dbSettings['announcement_banner'] || '',
    homepage_apps_title: dbSettings['homepage_apps_title'] || 'Software Crafted with Purpose',
    homepage_blog_title: dbSettings['homepage_blog_title'] || 'Engineering Updates & Devlogs',
    philosophy_badge: dbSettings['philosophy_badge'] || 'Craft & Principles',
    philosophy_cta_label: dbSettings['philosophy_cta_label'] || 'About the journey',
    philosophy_cta_url: dbSettings['philosophy_cta_url'] || '/about',
    creator_statement:
      dbSettings['creator_statement'] ||
      'I care about software that is useful, fast, and considerate.',
    closing_cta_title: dbSettings['closing_cta_title'] || 'Explore the ElseSourav Archive',
    closing_cta_subtitle:
      dbSettings['closing_cta_subtitle'] ||
      'Discover software tools, read architectural writings, or get in touch directly.',
    creator_name: dbSettings['creator_name'] || CREATOR_CONFIG.name,
    creator_full_name: dbSettings['creator_full_name'] || 'Sourav Barui',
    creator_title: dbSettings['creator_title'] || CREATOR_CONFIG.identity.title,
    creator_role: dbSettings['creator_role'] || CREATOR_CONFIG.identity.role,
    creator_location: dbSettings['creator_location'] || '',
    creator_positioning: dbSettings['creator_positioning'] || CREATOR_CONFIG.positioning,
    creator_short_bio: dbSettings['creator_short_bio'] || CREATOR_CONFIG.shortBio,
    creator_long_bio: dbSettings['creator_long_bio'] || CREATOR_CONFIG.longBio,
    about_intro: dbSettings['about_intro'] || '',
    github_url: dbSettings['github_url'] || CREATOR_CONFIG.links.github,
    twitter_url: dbSettings['twitter_url'] || CREATOR_CONFIG.links.twitter,
    contact_email: dbSettings['contact_email'] || CREATOR_CONFIG.contact.email,
    support_url: dbSettings['support_url'] || CREATOR_CONFIG.contact.support,
    // UI & Appearance fidelity
    effects_level: dbSettings['effects_level'] || 'high',
    // Portrait & Avatar Studio defaults (empty string indicates using built-in default asset)
    portrait_image_dark_url:
      dbSettings['portrait_image_dark_url'] === '/about/souravbarui-dark.png'
        ? ''
        : dbSettings['portrait_image_dark_url'] || '',
    portrait_image_light_url:
      dbSettings['portrait_image_light_url'] === '/about/souravbarui-light.png'
        ? ''
        : dbSettings['portrait_image_light_url'] || '',
    portrait_particle_density: dbSettings['portrait_particle_density'] || '1.0x',
    portrait_particle_size: dbSettings['portrait_particle_size'] || '1.0x',
    portrait_glow_brightness: dbSettings['portrait_glow_brightness'] || '1.0x',
    portrait_flight_speed: dbSettings['portrait_flight_speed'] || '1.0x',
    portrait_path_spread: dbSettings['portrait_path_spread'] || '2.6px',
    portrait_light_intensity: dbSettings['portrait_light_intensity'] || '0.38',
    portrait_show_path_guide: dbSettings['portrait_show_path_guide'] || 'false',
    portrait_edge_algorithm: dbSettings['portrait_edge_algorithm'] || 'perimeter',
    portrait_edge_threshold: dbSettings['portrait_edge_threshold'] || '28',
    portrait_pin_bottom_edge: dbSettings['portrait_pin_bottom_edge'] || 'true',
    portrait_top_particle_size: dbSettings['portrait_top_particle_size'] || '1.0x',
    portrait_top_particle_quantity: dbSettings['portrait_top_particle_quantity'] || '1.0x',
    portrait_top_particle_speed: dbSettings['portrait_top_particle_speed'] || '1.0x',
    portrait_glow_distance: dbSettings['portrait_glow_distance'] || '8px',
    portrait_backside_stars: dbSettings['portrait_backside_stars'] || '32',
    portrait_backside_halo: dbSettings['portrait_backside_halo'] || '1.0x',
    portrait_backside_orbits: dbSettings['portrait_backside_orbits'] || '2',
    portrait_backside_specks: dbSettings['portrait_backside_specks'] || '1.0x',
    portrait_image_resolution: dbSettings['portrait_image_resolution'] || '224',
    portrait_image_resolution_desktop: dbSettings['portrait_image_resolution_desktop'] || '256',
    portrait_image_resolution_tablet: dbSettings['portrait_image_resolution_tablet'] || '192',
    portrait_image_resolution_mobile: dbSettings['portrait_image_resolution_mobile'] || '144',
    portrait_click_force: dbSettings['portrait_click_force'] || '1.0x',
    portrait_bounce_speed: dbSettings['portrait_bounce_speed'] || '8.2',
    portrait_click_radius: dbSettings['portrait_click_radius'] || '80px',
    portrait_hover_speed: dbSettings['portrait_hover_speed'] || '1.0x',
    portrait_hover_threshold: dbSettings['portrait_hover_threshold'] || '55px',
    portrait_click_speed: dbSettings['portrait_click_speed'] || '1.0x',
    portrait_intro_animation: dbSettings['portrait_intro_animation'] || '1.0s',
    portrait_intro_spread: dbSettings['portrait_intro_spread'] || '1.0x',
    portrait_intro_pattern: dbSettings['portrait_intro_pattern'] || 'vortex',
    portrait_config_desktop: dbSettings['portrait_config_desktop'] || '',
    portrait_config_tablet: dbSettings['portrait_config_tablet'] || '',
    portrait_config_mobile: dbSettings['portrait_config_mobile'] || '',
    // Legal content defaults
    legal_privacy_md: dbSettings['legal_privacy_md'] || '',
    legal_terms_md: dbSettings['legal_terms_md'] || '',
    ...dbSettings,
  };

  return (
    <div className="space-y-6">
      {/* Standard Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              PORTAL CONFIG
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
            >
              Settings
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Portal Configuration
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Configure site identity, creator biography, homepage narrative, and legal policies across
            the platform.
          </p>
        </div>
      </div>

      <AdminSettingsForm initialSettings={initialSettings} />
    </div>
  );
}
