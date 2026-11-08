'use client';

import * as React from 'react';
import { Card, FormField, Textarea, Badge } from '@elsesourav/ui';
import { FloatingLabelInput } from '@elsesourav/ui/interior';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { Sparkles, ArrowRight } from 'lucide-react';

export interface ProfileSettingsTabProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function ProfileSettingsTab({ settings, onChange }: ProfileSettingsTabProps) {
  return (
    <Card className="p-4 sm:p-6 space-y-5 rounded-3xl border-zinc-800 bg-zinc-900/40">
      {/* Studio Banner Link */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-zinc-300">
            Looking for Dark & Light portrait images, crop guidance, and particle physics?
          </span>
        </div>
        <Badge variant="primary" className="text-[10px] font-mono shrink-0 self-start sm:self-auto">
          Visit Portrait Studio Tab
        </Badge>
      </div>

      <ImageInputWithLibrary
        label="Creator Avatar & Profile Photo"
        value={settings['creator_avatar_url'] || ''}
        onChange={(val) => onChange('creator_avatar_url', val)}
        folder="users"
        defaultCategory="users"
        previewShape="circle"
        placeholder="Avatar image URL or upload/select from library"
      />

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingLabelInput
          label="Location / Timezone"
          value={settings['creator_location'] || ''}
          onChange={(val) => onChange('creator_location', val)}
          placeholder="Remote / Worldwide"
        />

        <FloatingLabelInput
          label="Studio Positioning Statement"
          value={settings['creator_positioning'] || ''}
          onChange={(val) => onChange('creator_positioning', val)}
          placeholder="Exploring ideas across web architecture, AI, graphics, and systems..."
        />
      </div>

      <FormField label="Compact Bio (Hero Cards & Footer)">
        <Textarea
          rows={2}
          value={settings['creator_short_bio'] || ''}
          onChange={(e) => onChange('creator_short_bio', e.target.value)}
          placeholder="Software engineer and independent creator building practical software..."
          className="text-xs bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl"
        />
      </FormField>
    </Card>
  );
}
