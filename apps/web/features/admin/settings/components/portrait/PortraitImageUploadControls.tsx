'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@elsesourav/ui';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { Moon, Sun, User, RefreshCw, Crop } from 'lucide-react';

export interface PortraitImageUploadControlsProps {
  darkUrl: string;
  lightUrl: string;
  avatarUrl?: string;
  onChange: (key: string, value: string) => void;
  onSyncToAvatar: (url: string) => void;
}

export function PortraitImageUploadControls({
  darkUrl,
  lightUrl,
  avatarUrl,
  onChange,
  onSyncToAvatar,
}: PortraitImageUploadControlsProps) {
  return (
    <Card className="p-4 rounded-2xl border-zinc-800 bg-zinc-900/40 space-y-3.5">
      {/* Clean Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            Dual-Theme Portrait Assets (1:1 Square)
          </h4>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
          Transparent PNG / WebP
        </Badge>
      </div>

      {/* Upload Cards Stack (Full-width for generous room) */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* Dark Theme Portrait Card */}
        <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/50 space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-zinc-200">Dark Mode Asset</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono border-cyan-500/30 text-cyan-300">
                Dark Cutout
              </Badge>
            </div>

            <ImageInputWithLibrary
              label="Transparent Cutout"
              value={darkUrl}
              onChange={(val) => onChange('portrait_image_dark_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-dark.png or upload"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onChange('portrait_image_dark_url', '/about/souravbarui-dark.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-1 rounded-lg h-6 px-2 whitespace-nowrap"
            >
              <RefreshCw className="w-2.5 h-2.5 text-cyan-400" />
              <span>Reset Default</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onSyncToAvatar(darkUrl || '/about/souravbarui-dark.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1 rounded-lg h-6 px-2 whitespace-nowrap"
            >
              <User className="w-2.5 h-2.5 text-indigo-400" />
              <span>Sync to Creator Avatar</span>
            </Button>
          </div>
        </div>

        {/* Light Theme Portrait Card */}
        <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/50 space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-200">Light Mode Asset</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-300">
                Light Cutout
              </Badge>
            </div>

            <ImageInputWithLibrary
              label="Transparent Cutout"
              value={lightUrl}
              onChange={(val) => onChange('portrait_image_light_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-light.png or upload"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onChange('portrait_image_light_url', '/about/souravbarui-light.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-1 rounded-lg h-6 px-2 whitespace-nowrap"
            >
              <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
              <span>Reset Default</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onSyncToAvatar(lightUrl || '/about/souravbarui-light.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1 rounded-lg h-6 px-2 whitespace-nowrap"
            >
              <User className="w-2.5 h-2.5 text-indigo-400" />
              <span>Sync to Creator Avatar</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
