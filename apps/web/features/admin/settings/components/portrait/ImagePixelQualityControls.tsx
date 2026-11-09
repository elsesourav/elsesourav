'use client';

import * as React from 'react';
import { Grid3X3 } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import { IMAGE_RESOLUTION_ITEMS } from './portrait.constants';

export interface ImagePixelQualityControlsProps {
  resolution: string;
  onChange: (key: string, value: string) => void;
}

export function ImagePixelQualityControls({
  resolution,
  onChange,
}: ImagePixelQualityControlsProps) {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <Grid3X3 className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          Photographic Pixel Quality
        </h4>
      </div>

      <div>
        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
          Grid Resolution &amp; Pixel Fidelity
        </label>
        <Dropdown
          items={[...IMAGE_RESOLUTION_ITEMS]}
          value={resolution || '224'}
          onChange={(val) => onChange('portrait_image_resolution', val)}
          className="w-full"
        />
      </div>
    </div>
  );
}
