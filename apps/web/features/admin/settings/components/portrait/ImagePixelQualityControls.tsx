'use client';

import * as React from 'react';
import { Grid, HelpCircle } from 'lucide-react';
import { IMAGE_RESOLUTION_OPTIONS } from './portrait.constants';

export interface ImagePixelQualityControlsProps {
  resolution: string;
  onChange: (key: string, value: string) => void;
}

export function ImagePixelQualityControls({
  resolution,
  onChange,
}: ImagePixelQualityControlsProps) {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
        <Grid className="w-4 h-4 text-cyan-400" />
        <div>
          <h4 className="text-xs font-bold text-zinc-100">
            Image Pixel Quality & Simulation Grid
          </h4>
          <p className="text-[11px] text-zinc-400">
            Control the size and fidelity of the portrait pixels. Smaller pixels yield high photorealistic quality, while larger pixels produce retro pixel art.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Quality Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span>Image Pixel Quality (Grid Resolution)</span>
          </label>
          <select
            value={resolution || '224'}
            onChange={(e) => onChange('portrait_image_resolution', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {IMAGE_RESOLUTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {IMAGE_RESOLUTION_OPTIONS.find((o) => o.value === resolution)?.desc ??
              IMAGE_RESOLUTION_OPTIONS[1]?.desc ??
              ''}
          </p>
        </div>

        {/* Informative Explanation Box */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 text-[11px] text-zinc-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-300 text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Resolution vs Quality</span>
          </div>
          <p className="leading-relaxed">
            <strong>High Quality (256×256)</strong> subdivides the image into smaller micro-pixels for sharper features and curls. <strong>Low Quality (112×112)</strong> merges pixels into chunky retro blocks.
          </p>
        </div>
      </div>
    </div>
  );
}
