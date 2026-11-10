'use client';

import * as React from 'react';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { FormField, Textarea } from '@elsesourav/ui';
import { Sparkles, User, Image as ImageIcon } from 'lucide-react';

export interface PhilosophySettingsSectionProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function PhilosophySettingsSection({
  settings,
  onChange,
}: PhilosophySettingsSectionProps) {
  return (
    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Craft &amp; Principles Section (Homepage)
          </h3>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Configure the creator philosophy statement, positioning narrative, portrait photo, and journey link on the homepage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Section Pill Badge"
          value={settings['philosophy_badge'] || ''}
          onChange={(val) => onChange('philosophy_badge', val)}
          placeholder="Craft & Principles"
        />

        <FloatingLabelInput
          label="Creator Display Name"
          value={settings['creator_name'] || ''}
          onChange={(val) => onChange('creator_name', val)}
          placeholder="Sourav"
        />
      </div>

      <FloatingLabelInput
        label="Philosophy Statement (Primary Headline)"
        value={settings['creator_statement'] || ''}
        onChange={(val) => onChange('creator_statement', val)}
        placeholder="I care about software that is useful, fast, and considerate."
      />

      <FormField
        label="Creator Positioning (Supporting Narrative)"
        description="Paragraph explaining what you build and your engineering philosophy"
      >
        <Textarea
          rows={3}
          value={settings['creator_positioning'] || ''}
          onChange={(e) => onChange('creator_positioning', e.target.value)}
          placeholder="Independent creator building practical software, developer tools, and thoughtful web experiences with strong engineering fundamentals."
          className="text-xs bg-zinc-50/50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Professional Title"
          value={settings['creator_title'] || ''}
          onChange={(val) => onChange('creator_title', val)}
          placeholder="Software Engineer & Creator"
        />

        <FloatingLabelInput
          label="Creator Portrait / Avatar URL"
          value={settings['creator_avatar_url'] || ''}
          onChange={(val) => onChange('creator_avatar_url', val)}
          placeholder="/about/souravbarui-dark-512.webp"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
        <span className="text-[11px] font-medium flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          Quick Portrait Presets:
        </span>
        <button
          type="button"
          onClick={() => onChange('creator_avatar_url', '/about/souravbarui-dark-512.webp')}
          className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
        >
          Sourav Dark Portrait
        </button>
        <button
          type="button"
          onClick={() => onChange('creator_avatar_url', '/about/souravbarui-light-512.webp')}
          className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
        >
          Sourav Light Portrait
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <FloatingLabelInput
          label="Journey CTA Button Label"
          value={settings['philosophy_cta_label'] || ''}
          onChange={(val) => onChange('philosophy_cta_label', val)}
          placeholder="About the journey"
        />

        <FloatingLabelInput
          label="Journey CTA Link Target"
          value={settings['philosophy_cta_url'] || ''}
          onChange={(val) => onChange('philosophy_cta_url', val)}
          placeholder="/about"
        />
      </div>
    </div>
  );
}
