'use client';

import * as React from 'react';
import { Grid3X3, Monitor, Tablet, Smartphone, Sparkles } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import { Badge } from '@elsesourav/ui';
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
  // Map active device to current resolution and setting key
  const deviceConfig = React.useMemo(() => {
    switch (activeDevice) {
      case 'tablet':
        return {
          key: 'portrait_image_resolution_tablet',
          value: tabletResolution || '192',
          label: 'Tablet Grid Resolution',
          subtext: 'Optimal pixel density for iPads and touch tablets (768px – 1023px)',
          badgeLabel: 'Tablet',
          Icon: Tablet,
        };
      case 'mobile':
        return {
          key: 'portrait_image_resolution_mobile',
          value: mobileResolution || '144',
          label: 'Mobile Grid Resolution',
          subtext: 'High-speed fluid simulation for phones and small viewports (< 768px)',
          badgeLabel: 'Mobile',
          Icon: Smartphone,
        };
      case 'desktop':
      default:
        return {
          key: 'portrait_image_resolution_desktop',
          value: desktopResolution || '256',
          label: 'Desktop Grid Resolution',
          subtext: 'Ultra-high crystalline fidelity for laptops and desktop displays (>= 1024px)',
          badgeLabel: 'Desktop',
          Icon: Monitor,
        };
    }
  }, [activeDevice, desktopResolution, tabletResolution, mobileResolution]);

  const { key, value, label, subtext, badgeLabel, Icon } = deviceConfig;

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      {/* Header with active device badge */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            Photographic Pixel Quality
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/40 text-cyan-300">
            {badgeLabel} Target
          </Badge>
          <span className="text-[10px] font-mono text-zinc-500 font-bold">{value}px</span>
        </div>
      </div>

      {/* Dynamic Single-Device Resolution Tuner */}
      <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-zinc-950/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-cyan-400" />
            <label className="text-xs font-semibold text-zinc-200">{label}</label>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Active Selection</span>
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-normal">{subtext}</p>

        <Dropdown
          items={[...IMAGE_RESOLUTION_ITEMS]}
          value={value}
          onChange={(val) => {
            onChange(key, val);
            if (activeDevice === 'desktop') {
              onChange('portrait_image_resolution', val);
            }
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
