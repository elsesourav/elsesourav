'use client';

import * as React from 'react';
import { Grid3X3, Monitor, Tablet, Smartphone, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import { Badge } from '@elsesourav/ui';
import { IMAGE_RESOLUTION_ITEMS, IMAGE_PIXEL_ALGORITHM_ITEMS } from './portrait.constants';
import type { PortraitDeviceTarget } from './portrait.types';

export interface ImagePixelQualityControlsProps {
  activeDevice: PortraitDeviceTarget;
  resolution: string;
  algorithm?: string;
  onChange: (key: string, value: string) => void;
}

export function ImagePixelQualityControls({
  activeDevice,
  resolution,
  algorithm = 'stepped',
  onChange,
}: ImagePixelQualityControlsProps) {
  // Map active device to current resolution and setting key
  const deviceConfig = React.useMemo(() => {
    switch (activeDevice) {
      case 'tablet':
        return {
          label: 'Tablet Grid Resolution',
          subtext: 'Optimal pixel density for iPads and touch tablets (768px – 1023px)',
          badgeLabel: 'Tablet',
          Icon: Tablet,
        };
      case 'mobile':
        return {
          label: 'Mobile Grid Resolution',
          subtext: 'High-speed fluid simulation for phones and small viewports (< 768px)',
          badgeLabel: 'Mobile',
          Icon: Smartphone,
        };
      case 'desktop':
      default:
        return {
          label: 'Desktop Grid Resolution',
          subtext: 'Ultra-high crystalline fidelity for laptops and desktop displays (>= 1024px)',
          badgeLabel: 'Desktop',
          Icon: Monitor,
        };
    }
  }, [activeDevice]);

  const { label, subtext, badgeLabel, Icon } = deviceConfig;
  const currentRes = resolution || (activeDevice === 'mobile' ? '144' : activeDevice === 'tablet' ? '192' : '256');
  const currentAlgo = algorithm || 'stepped';

  return (
    <div className="space-y-3.5 p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
      {/* Header with active device badge */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Photographic Pixel Quality &amp; Downsampling
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] font-mono border-cyan-400/50 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300">
            {badgeLabel} Target
          </Badge>
          <span className="text-[10px] font-mono text-zinc-500 font-bold">{currentRes}px</span>
        </div>
      </div>

      {/* Dynamic Resolution Tuner for Currently Active Device Tab */}
      <div className="p-3.5 rounded-xl border border-cyan-400/50 dark:border-cyan-500/30 bg-zinc-50/60 dark:bg-zinc-950/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{label}</label>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            <span>Active Selection</span>
          </span>
        </div>

        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">{subtext}</p>

        <Dropdown
          items={[...IMAGE_RESOLUTION_ITEMS]}
          value={currentRes}
          onChange={(val) => {
            onChange('portrait_image_resolution', val);
            if (activeDevice === 'desktop') {
              onChange('portrait_image_resolution_desktop', val);
            } else if (activeDevice === 'tablet') {
              onChange('portrait_image_resolution_tablet', val);
            } else if (activeDevice === 'mobile') {
              onChange('portrait_image_resolution_mobile', val);
            }
          }}
          className="w-full"
        />
      </div>

      {/* Downsampling & Conversion Algorithm Selector for Active Device */}
      <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
              Downsampling &amp; Color Algorithm
            </label>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">Per-device</span>
        </div>

        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
          Select how high-resolution images are scaled and quantized down to the simulation matrix.
        </p>

        <Dropdown
          items={[...IMAGE_PIXEL_ALGORITHM_ITEMS]}
          value={currentAlgo}
          onChange={(val) => {
            onChange('portrait_image_algorithm', val);
            if (activeDevice === 'desktop') {
              onChange('portrait_image_algorithm_desktop', val);
            } else if (activeDevice === 'tablet') {
              onChange('portrait_image_algorithm_tablet', val);
            } else if (activeDevice === 'mobile') {
              onChange('portrait_image_algorithm_mobile', val);
            }
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
