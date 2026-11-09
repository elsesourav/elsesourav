'use client';

import * as React from 'react';
import { Sparkles, Eye, Gauge, Waves, Sun } from 'lucide-react';
import {
  TOP_PARTICLE_SIZE_OPTIONS,
  TOP_PARTICLE_QUANTITY_OPTIONS,
  TOP_PARTICLE_SPEED_OPTIONS,
  PATH_SPREAD_OPTIONS,
  LIGHT_INTENSITY_OPTIONS,
} from './portrait.constants';

export interface TopParticleControlsProps {
  topSize: string;
  topQuantity: string;
  topSpeed: string;
  pathSpread: string;
  lightIntensity: string;
  onChange: (key: string, value: string) => void;
}

export function TopParticleControls({
  topSize,
  topQuantity,
  topSpeed,
  pathSpread,
  lightIntensity,
  onChange,
}: TopParticleControlsProps) {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <div>
          <h4 className="text-xs font-bold text-zinc-100">
            Top Globe & Edge Glow Pixels
          </h4>
          <p className="text-[11px] text-zinc-400">
            Controls size, quantity, velocity, and lateral ribbon spread along the silhouette
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Globe Particle Size Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Top Particle Size</span>
          </label>
          <select
            value={topSize || '1.0x'}
            onChange={(e) => onChange('portrait_top_particle_size', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {TOP_PARTICLE_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {TOP_PARTICLE_SIZE_OPTIONS.find((o) => o.value === topSize)?.desc ??
              TOP_PARTICLE_SIZE_OPTIONS[2]?.desc ??
              ''}
          </p>
        </div>

        {/* 2. Particle Quantity Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Particle Quantity / Units</span>
          </label>
          <select
            value={topQuantity || '1.0x'}
            onChange={(e) => onChange('portrait_top_particle_quantity', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {TOP_PARTICLE_QUANTITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {TOP_PARTICLE_QUANTITY_OPTIONS.find((o) => o.value === topQuantity)?.desc ??
              TOP_PARTICLE_QUANTITY_OPTIONS[1]?.desc ??
              ''}
          </p>
        </div>

        {/* 3. Particle Movement Speed Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span>Travel Movement Speed</span>
          </label>
          <select
            value={topSpeed || '1.0x'}
            onChange={(e) => onChange('portrait_top_particle_speed', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {TOP_PARTICLE_SPEED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {TOP_PARTICLE_SPEED_OPTIONS.find((o) => o.value === topSpeed)?.desc ??
              TOP_PARTICLE_SPEED_OPTIONS[1]?.desc ??
              ''}
          </p>
        </div>

        {/* 4. Path Spread Ribbon Width Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-purple-400" />
            <span>Path Spread & Deviation Ribbon</span>
          </label>
          <select
            value={pathSpread || '2.6px'}
            onChange={(e) => onChange('portrait_path_spread', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            {PATH_SPREAD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {PATH_SPREAD_OPTIONS.find((o) => o.value === pathSpread)?.desc ??
              PATH_SPREAD_OPTIONS[2]?.desc ??
              ''}
          </p>
        </div>

        {/* 5. Photograph Rim Proximity Lighting Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Photograph Rim Proximity Lighting</span>
          </label>
          <select
            value={lightIntensity || '0.38'}
            onChange={(e) => onChange('portrait_light_intensity', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {LIGHT_INTENSITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {LIGHT_INTENSITY_OPTIONS.find((o) => o.value === lightIntensity)?.desc ??
              LIGHT_INTENSITY_OPTIONS[2]?.desc ??
              ''}
          </p>
        </div>
      </div>
    </div>
  );
}
