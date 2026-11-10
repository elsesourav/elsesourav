'use client';

import * as React from 'react';
import { Card, FormField, Textarea } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { PhilosophySettingsSection } from './PhilosophySettingsSection';
import { HomepageAtmosphereSettingsSection } from './HomepageAtmosphereSettingsSection';

export interface HomepageSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function HomepageSettingsTab({ settings, onChange }: HomepageSettingsTabProps) {
  return (
    <Card className="p-4 sm:p-6 space-y-4 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Hero Badge"
          hint="Small pill badge above the hero headline"
          value={settings['hero_badge'] || ''}
          onChange={(val) => onChange('hero_badge', val)}
          placeholder="Software & Systems Studio"
        />

        <FloatingLabelInput
          label="Announcement Banner"
          hint="Optional top-of-page alert banner"
          value={settings['announcement_banner'] || ''}
          onChange={(val) => onChange('announcement_banner', val)}
          placeholder="e.g. SpectraLens AI v2.4 released with on-device WASM"
        />
      </div>

      <FloatingLabelInput
        label="Hero Headline"
        hint="Main statement rendered below 'I am [Name].'"
        value={settings['hero_headline'] || ''}
        onChange={(val) => onChange('hero_headline', val)}
        placeholder="Building software, tools, games, and experiments that solve real problems and spark new ideas."
      />

      <FormField
        label="Hero Positioning Paragraph"
        description="Supporting narrative below the main hero statement"
      >
        <Textarea
          rows={3}
          value={settings['hero_subtitle'] || ''}
          onChange={(e) => onChange('hero_subtitle', e.target.value)}
          placeholder="ElseSourav is my personal space for the applications I build, the ideas I explore, and the things I learn along the way."
          className="text-xs bg-zinc-50/50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Primary CTA Label"
          hint="First button linking to /apps"
          value={settings['primary_cta_label'] || ''}
          onChange={(val) => onChange('primary_cta_label', val)}
          placeholder="Explore Apps"
        />

        <FloatingLabelInput
          label="Secondary CTA Label"
          hint="Second button linking to /about"
          value={settings['secondary_cta_label'] || ''}
          onChange={(val) => onChange('secondary_cta_label', val)}
          placeholder="About Me"
        />
      </div>

      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Selected Apps Section Title"
          value={settings['homepage_apps_title'] || ''}
          onChange={(val) => onChange('homepage_apps_title', val)}
          placeholder="Selected Apps"
        />

        <FloatingLabelInput
          label="Updates Section Title"
          value={settings['homepage_blog_title'] || ''}
          onChange={(val) => onChange('homepage_blog_title', val)}
          placeholder="Engineering Updates & Devlogs"
        />
      </div>

      <PhilosophySettingsSection settings={settings} onChange={onChange} />

      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Closing Studio Doorway Title"
          value={settings['closing_cta_title'] || ''}
          onChange={(val) => onChange('closing_cta_title', val)}
          placeholder="Explore the ElseSourav Studio"
        />

        <FloatingLabelInput
          label="Closing Studio Doorway Subtitle"
          value={settings['closing_cta_subtitle'] || ''}
          onChange={(val) => onChange('closing_cta_subtitle', val)}
          placeholder="Every application, utility, and field note is built independently with a focus on craft, performance, and usability."
        />
      </div>

      <HomepageAtmosphereSettingsSection
        atmosphereDensity={settings['homepage_atmosphere_density'] || '1.0'}
        meteorFrequency={settings['homepage_meteor_frequency'] || 'standard'}
        starsSpeed={settings['homepage_stars_speed'] || '1.0'}
        mobileEffects={settings['homepage_mobile_effects'] || 'standard'}
        onChange={onChange}
      />
    </Card>
  );
}
