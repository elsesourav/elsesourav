'use client';

import * as React from 'react';
import { Disc, Star, Orbit, Sparkles } from 'lucide-react';
import {
  HALO_RING_OPTIONS,
  DIAMOND_STARS_OPTIONS,
  ORBIT_LOOPS_OPTIONS,
  AMBIENT_SPECKS_OPTIONS,
} from './portrait.constants';

export interface BacksideObjectControlsProps {
  halo: string;
  stars: string;
  orbits: string;
  specks: string;
  onChange: (key: string, value: string) => void;
}

export function BacksideObjectControls({
  halo,
  stars,
  orbits,
  specks,
  onChange,
}: BacksideObjectControlsProps) {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
        <Disc className="w-4 h-4 text-cyan-400" />
        <div>
          <h4 className="text-xs font-bold text-zinc-100">
            Backside Space, Halo & Retro Stars
          </h4>
          <p className="text-[11px] text-zinc-400">
            Control the background cosmic atmosphere, delicate halo ring, and flanking star constellations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Halo Ring Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Disc className="w-3.5 h-3.5 text-cyan-400" />
            <span>Circular Halo Ring</span>
          </label>
          <select
            value={halo || '1.0x'}
            onChange={(e) => onChange('portrait_backside_halo', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {HALO_RING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {HALO_RING_OPTIONS.find((o) => o.value === halo)?.desc ??
              HALO_RING_OPTIONS[2]?.desc ??
              ''}
          </p>
        </div>

        {/* 2. Side Diamond Stars Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Diamond Stars (Sides)</span>
          </label>
          <select
            value={stars || '32'}
            onChange={(e) => onChange('portrait_backside_stars', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {DIAMOND_STARS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {DIAMOND_STARS_OPTIONS.find((o) => o.value === stars)?.desc ??
              DIAMOND_STARS_OPTIONS[3]?.desc ??
              ''}
          </p>
        </div>

        {/* 3. Orbit Loops Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Celestial Orbit Loops</span>
          </label>
          <select
            value={orbits || 'enabled'}
            onChange={(e) => onChange('portrait_backside_orbits', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {ORBIT_LOOPS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {ORBIT_LOOPS_OPTIONS.find((o) => o.value === orbits)?.desc ??
              ORBIT_LOOPS_OPTIONS[0]?.desc ??
              ''}
          </p>
        </div>

        {/* 4. Ambient Specks Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Ambient Cosmic Specks</span>
          </label>
          <select
            value={specks || '1.0x'}
            onChange={(e) => onChange('portrait_backside_specks', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            {AMBIENT_SPECKS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {AMBIENT_SPECKS_OPTIONS.find((o) => o.value === specks)?.desc ??
              AMBIENT_SPECKS_OPTIONS[2]?.desc ??
              ''}
          </p>
        </div>
      </div>
    </div>
  );
}
