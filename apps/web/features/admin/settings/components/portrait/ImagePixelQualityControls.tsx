'use client';

import * as React from 'react';
import { Grid3X3, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import { IMAGE_RESOLUTION_ITEMS } from './portrait.constants';
import type { PortraitDeviceTarget } from './portrait.types';

export interface ImagePixelQualityControlsProps {
  activeDevice: PortraitDeviceTarget;
  desktopResolution: string;
  tabletResolution: string;
  mobileResolution: string;
  onChange: (key: string, value: string) => void;
}

export function ImagePixelQualityControls({
  activeDevice,
  desktopResolution,
  tabletResolution,
  mobileResolution,
  onChange,
}: ImagePixelQualityControlsProps) {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            Photographic Pixel Quality by Device
          </h4>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          Active Target: <span className="text-cyan-400 uppercase font-bold">{activeDevice}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Desktop Resolution */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            activeDevice === 'desktop'
              ? 'border-cyan-500/50 bg-cyan-950/20'
              : 'border-zinc-800/60 bg-zinc-950/40'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Monitor className="w-3 h-3 text-cyan-400" />
            <label className="text-[11px] font-semibold text-zinc-200">Desktop Grid</label>
          </div>
          <Dropdown
            items={[...IMAGE_RESOLUTION_ITEMS]}
            value={desktopResolution || '256'}
            onChange={(val) => {
              onChange('portrait_image_resolution_desktop', val);
              onChange('portrait_image_resolution', val);
            }}
            className="w-full"
          />
        </div>

        {/* Tablet Resolution */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            activeDevice === 'tablet'
              ? 'border-cyan-500/50 bg-cyan-950/20'
              : 'border-zinc-800/60 bg-zinc-950/40'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Tablet className="w-3 h-3 text-cyan-400" />
            <label className="text-[11px] font-semibold text-zinc-200">Tablet Grid</label>
          </div>
          <Dropdown
            items={[...IMAGE_RESOLUTION_ITEMS]}
            value={tabletResolution || '192'}
            onChange={(val) => onChange('portrait_image_resolution_tablet', val)}
            className="w-full"
          />
        </div>

        {/* Mobile Resolution */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            activeDevice === 'mobile'
              ? 'border-cyan-500/50 bg-cyan-950/20'
              : 'border-zinc-800/60 bg-zinc-950/40'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Smartphone className="w-3 h-3 text-cyan-400" />
            <label className="text-[11px] font-semibold text-zinc-200">Mobile Grid</label>
          </div>
          <Dropdown
            items={[...IMAGE_RESOLUTION_ITEMS]}
            value={mobileResolution || '144'}
            onChange={(val) => onChange('portrait_image_resolution_mobile', val)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
