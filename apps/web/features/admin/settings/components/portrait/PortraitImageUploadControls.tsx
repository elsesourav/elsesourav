'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@elsesourav/ui';
import { ImageInputWithLibrary } from '@/features/admin/media/components/ImageInputWithLibrary';
import { Moon, Sun, User, Info, RefreshCw, Crop, CheckCircle2 } from 'lucide-react';

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
    <Card className="p-4 sm:p-5 rounded-2xl border-zinc-800 bg-zinc-900/40 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-zinc-800/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Dual-Theme Portrait Assets &amp; Square Crop
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Manage dark and light photographs used by the WebAssembly simulation canvas.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-400">
            1:1 Square Auto-Crop
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
            Alpha Channel PNG / WebP
          </Badge>
        </div>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dark Theme Portrait Card */}
        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/50 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Moon className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Dark Theme Portrait</h4>
                  <p className="text-[10px] text-zinc-400">Active when visitors browse in Dark Mode</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono border-cyan-500/30 text-cyan-300">
                Dark Mode
              </Badge>
            </div>

            <ImageInputWithLibrary
              label="Portrait Asset (Transparent PNG / WebP)"
              value={darkUrl}
              onChange={(val) => onChange('portrait_image_dark_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-dark.png or select from media"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onChange('portrait_image_dark_url', '/about/souravbarui-dark.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-1 rounded-lg h-6 px-2"
            >
              <RefreshCw className="w-2.5 h-2.5 text-cyan-400" />
              <span>Reset Default</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onSyncToAvatar(darkUrl || '/about/souravbarui-dark.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1 rounded-lg h-6 px-2"
            >
              <User className="w-2.5 h-2.5 text-indigo-400" />
              <span>Use as Creator Avatar</span>
            </Button>
          </div>
        </div>

        {/* Light Theme Portrait Card */}
        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/50 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sun className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Light Theme Portrait</h4>
                  <p className="text-[10px] text-zinc-400">Active when visitors browse in Light Mode</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-300">
                Light Mode
              </Badge>
            </div>

            <ImageInputWithLibrary
              label="Portrait Asset (Transparent PNG / WebP)"
              value={lightUrl}
              onChange={(val) => onChange('portrait_image_light_url', val)}
              folder="users"
              defaultCategory="users"
              previewShape="square"
              placeholder="/about/souravbarui-light.png or select from media"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onChange('portrait_image_light_url', '/about/souravbarui-light.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-1 rounded-lg h-6 px-2"
            >
              <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
              <span>Reset Default</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onSyncToAvatar(lightUrl || '/about/souravbarui-light.png')}
              className="text-[10px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1 rounded-lg h-6 px-2"
            >
              <User className="w-2.5 h-2.5 text-indigo-400" />
              <span>Use as Creator Avatar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Aspect Ratio & Silhouette Requirements Info Banner */}
      <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Optimal Portrait Asset Specifications</span>
        </div>
        <p className="leading-relaxed">
          For clean edge detection and contour particle orbits, upload a <strong>1:1 square asset</strong>{' '}
          (e.g. 512×512px or 1024×1024px) with a fully <strong>transparent background (alpha = 0)</strong> around the subject silhouette.
          Cloudinary image transformations automatically apply centered face crop gravity (<code>c_fill,ar_1:1,g_face</code>).
        </p>
      </div>
    </Card>
  );
}
