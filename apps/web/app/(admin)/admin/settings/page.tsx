import type { Metadata } from 'next';
import { requireAdmin } from '@/features/admin/guards/require-admin';
import { AdminRepository } from '@elsesourav/database';
import { SITE_CONFIG, CREATOR_CONFIG } from '@elsesourav/config';
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
    secondary_cta_label: dbSettings['secondary_cta_label'] || 'Read Engineering Notes',
    announcement_banner: dbSettings['announcement_banner'] || '',
    creator_name: dbSettings['creator_name'] || CREATOR_CONFIG.name,
    creator_title: dbSettings['creator_title'] || CREATOR_CONFIG.identity.title,
    creator_role: dbSettings['creator_role'] || CREATOR_CONFIG.identity.role,
    creator_location: dbSettings['creator_location'] || CREATOR_CONFIG.identity.location,
    creator_short_bio: dbSettings['creator_short_bio'] || CREATOR_CONFIG.shortBio,
    creator_long_bio: dbSettings['creator_long_bio'] || CREATOR_CONFIG.longBio,
    github_url: dbSettings['github_url'] || CREATOR_CONFIG.links.github,
    twitter_url: dbSettings['twitter_url'] || CREATOR_CONFIG.links.twitter,
    contact_email: dbSettings['contact_email'] || CREATOR_CONFIG.contact.email,
    support_url: dbSettings['support_url'] || CREATOR_CONFIG.contact.support,
    ...dbSettings,
  };

  return (
    <div className="space-y-6">
      <AdminSettingsForm initialSettings={initialSettings} />
    </div>
  );
}
