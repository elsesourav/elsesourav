'use client';

import * as React from 'react';
import { Card, FormField, Textarea } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { AdminBrandLogoSection } from './AdminBrandLogoSection';

export interface IdentitySettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function IdentitySettingsTab({ settings, onChange }: IdentitySettingsTabProps) {
  return (
    <Card className="p-4 sm:p-6 space-y-6 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Site Name"
          required
          value={settings['site_name'] || ''}
          onChange={(val) => onChange('site_name', val)}
          placeholder="ElseSourav"
        />

        <FloatingLabelInput
          label="Site Tagline"
          required
          value={settings['site_tagline'] || ''}
          onChange={(val) => onChange('site_tagline', val)}
          placeholder="Software, Tools & Engineering Updates"
        />
      </div>

      <FormField label="Meta Description">
        <Textarea
          rows={2}
          value={settings['site_description'] || ''}
          onChange={(e) => onChange('site_description', e.target.value)}
          placeholder="Portfolio, applications, and technical deep-dives..."
          className="text-xs bg-zinc-50/50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl"
        />
      </FormField>

      {/* Brand Logo, Wordmark SVG, and Pre-computed Lightweight Loading Particles */}
      <AdminBrandLogoSection settings={settings} handleChange={onChange} />

      <div className="grid grid-cols-1 gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
        <ImageInputWithLibrary
          label="OpenGraph Social Share Banner"
          value={settings['site_og_image_url'] || ''}
          onChange={(val) => onChange('site_og_image_url', val)}
          folder="general"
          defaultCategory="general"
          previewShape="banner"
          placeholder="Social share banner image URL"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
        <FloatingLabelInput
          label="SEO Keywords (Comma-Separated)"
          value={settings['site_keywords'] || ''}
          onChange={(val) => onChange('site_keywords', val)}
          placeholder="software, developer tools, typescript, web performance"
        />

        <FloatingLabelInput
          label="System Status Badge"
          value={settings['site_status_badge'] || ''}
          onChange={(val) => onChange('site_status_badge', val)}
          placeholder="● All Systems Operational"
        />
      </div>
    </Card>
  );
}
