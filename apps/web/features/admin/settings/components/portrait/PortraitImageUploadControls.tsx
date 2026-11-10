'use client';

import * as React from 'react';
import { Card, Badge } from '@elsesourav/ui';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { Moon, Sun, Crop } from 'lucide-react';

export interface PortraitImageUploadControlsProps {
  darkUrl: string;
  lightUrl: string;
  avatarUrl?: string;
  onChange: (key: string, value: string) => void;
  onSyncToAvatar?: (url: string) => void;
}

export function PortraitImageUploadControls({
  darkUrl,
  lightUrl,
  onChange,
}: PortraitImageUploadControlsProps) {
  return (
    <Card className="p-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none space-y-3.5">
      {/* Clean Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Dual-Theme Portrait Assets (1:1 Square)
          </h4>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
          Transparent PNG / WebP
        </Badge>
      </div>

      {/* 2-Column Responsive Grid for Dark & Light Cutouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Dark Mode Asset Card */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Dark Mode Asset</span>
            </div>
            <Badge variant="outline" className="text-[9px] font-mono border-cyan-400/50 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300">
              Dark Cutout
            </Badge>
          </div>

          <ImageInputWithLibrary
            value={darkUrl}
            onChange={(val) => onChange('portrait_image_dark_url', val)}
            folder="users"
            defaultCategory="users"
            previewShape="square"
            fallbackUrl="/about/souravbarui-dark.png"
            placeholder="Default dark asset (or upload custom)"
          />
        </div>

        {/* Light Mode Asset Card */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Light Mode Asset</span>
            </div>
            <Badge variant="outline" className="text-[9px] font-mono border-amber-400/50 dark:border-amber-500/30 text-amber-700 dark:text-amber-300">
              Light Cutout
            </Badge>
          </div>

          <ImageInputWithLibrary
            value={lightUrl}
            onChange={(val) => onChange('portrait_image_light_url', val)}
            folder="users"
            defaultCategory="users"
            previewShape="square"
            fallbackUrl="/about/souravbarui-light.png"
            placeholder="Default light asset (or upload custom)"
          />
        </div>
      </div>
    </Card>
  );
}
