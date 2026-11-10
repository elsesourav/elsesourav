'use client';

import * as React from 'react';
import { Card, FormField, Textarea, Badge, Button } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { Sparkles, ArrowRight, UserCheck, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_AVATAR_PRESETS } from '@/features/account/constants/avatar-presets';

export interface ProfileSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function ProfileSettingsTab({ settings, onChange }: ProfileSettingsTabProps) {
  return (
    <Card className="p-4 sm:p-6 space-y-5 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none">
      {/* Studio Banner Link */}
      <div className="p-3.5 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span className="text-xs text-zinc-700 dark:text-zinc-300">
            Looking for Dark & Light portrait images, crop guidance, and particle physics?
          </span>
        </div>
        <Badge variant="primary" className="text-[10px] font-mono shrink-0 self-start sm:self-auto">
          Visit Portrait Studio Tab
        </Badge>
      </div>

      <div className="space-y-3">
        <ImageInputWithLibrary
          label="Creator Avatar & Profile Photo"
          value={settings['creator_avatar_url'] || ''}
          onChange={(val) => onChange('creator_avatar_url', val)}
          folder="users"
          defaultCategory="users"
          previewShape="circle"
          placeholder="Avatar image URL or upload/select from library"
        />

        {/* Quick Portrait Preset Selectors */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 text-xs">
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Quick Creator Presets:
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
      </div>

      {/* Account User Preset Avatars Catalog */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
              Account Studio User Preset Avatars
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            {DEFAULT_AVATAR_PRESETS.length} Default Presets
          </span>
        </div>

        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
          These preset avatars are offered to logged-in users in their Account Profile Image Studio. Click any preset to preview or set as the primary creator avatar.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {DEFAULT_AVATAR_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 flex items-center gap-2.5 group transition-colors shadow-sm dark:shadow-none"
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200 truncate">{preset.name}</p>
                <button
                  type="button"
                  onClick={() => onChange('creator_avatar_url', preset.url)}
                  className="text-[9px] text-primary hover:underline block cursor-pointer"
                >
                  Apply to Creator
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Display Name (Homepage)"
          required
          value={settings['creator_name'] || ''}
          onChange={(val) => onChange('creator_name', val)}
          placeholder="Sourav"
        />

        <FloatingLabelInput
          label="Full Name (About & Footer)"
          value={settings['creator_full_name'] || ''}
          onChange={(val) => onChange('creator_full_name', val)}
          placeholder="Sourav Barui"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Professional Title"
          required
          value={settings['creator_title'] || ''}
          onChange={(val) => onChange('creator_title', val)}
          placeholder="Software Engineer & Creator"
        />

        <FloatingLabelInput
          label="Role / Specialization"
          value={settings['creator_role'] || ''}
          onChange={(val) => onChange('creator_role', val)}
          placeholder="Independent Software Creator"
        />
      </div>

      <FloatingLabelInput
        label="Studio Positioning Statement"
        value={settings['creator_positioning'] || ''}
        onChange={(val) => onChange('creator_positioning', val)}
        placeholder="Exploring ideas across web architecture, AI, graphics, and systems..."
      />

      <FormField label="Compact Bio (Hero Cards & Footer)">
        <Textarea
          rows={2}
          value={settings['creator_short_bio'] || ''}
          onChange={(e) => onChange('creator_short_bio', e.target.value)}
          placeholder="Software engineer and independent creator building practical software..."
          className="text-xs bg-zinc-50/50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl"
        />
      </FormField>
    </Card>
  );
}
