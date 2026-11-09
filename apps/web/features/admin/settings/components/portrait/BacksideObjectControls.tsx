'use client';

import * as React from 'react';
import { Orbit } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  HALO_RING_ITEMS,
  DIAMOND_STARS_ITEMS,
  ORBIT_LOOPS_ITEMS,
  AMBIENT_SPECKS_ITEMS,
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
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <Orbit className="w-4 h-4 text-purple-400" />
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          Backside &amp; Celestial Space
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Halo Ring Density
          </label>
          <Dropdown
            items={[...HALO_RING_ITEMS]}
            value={halo || '1.0x'}
            onChange={(val) => onChange('portrait_backside_halo', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Retro Diamond Stars
          </label>
          <Dropdown
            items={[...DIAMOND_STARS_ITEMS]}
            value={stars || '32'}
            onChange={(val) => onChange('portrait_backside_stars', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Orbit Loops
          </label>
          <Dropdown
            items={[...ORBIT_LOOPS_ITEMS]}
            value={orbits || 'enabled'}
            onChange={(val) => onChange('portrait_backside_orbits', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Cosmic Ambient Specks
          </label>
          <Dropdown
            items={[...AMBIENT_SPECKS_ITEMS]}
            value={specks || '1.0x'}
            onChange={(val) => onChange('portrait_backside_specks', val)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
