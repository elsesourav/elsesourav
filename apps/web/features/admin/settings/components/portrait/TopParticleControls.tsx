'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  TOP_PARTICLE_SIZE_ITEMS,
  TOP_PARTICLE_QUANTITY_ITEMS,
  TOP_PARTICLE_SPEED_ITEMS,
  PATH_SPREAD_ITEMS,
  TOP_PARTICLE_GLOW_DISTANCE_ITEMS,
  LIGHT_INTENSITY_ITEMS,
} from './portrait.constants';

export interface TopParticleControlsProps {
  topSize: string;
  topQuantity: string;
  topSpeed: string;
  pathSpread: string;
  glowDistance?: string;
  lightIntensity: string;
  onChange: (key: string, value: string) => void;
}

export function TopParticleControls({
  topSize,
  topQuantity,
  topSpeed,
  pathSpread,
  glowDistance,
  lightIntensity,
  onChange,
}: TopParticleControlsProps) {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          Top Particles &amp; Rim Glow
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Particle Size
          </label>
          <Dropdown
            items={[...TOP_PARTICLE_SIZE_ITEMS]}
            value={topSize || '1.0x'}
            onChange={(val) => onChange('portrait_top_particle_size', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Particle Quantity
          </label>
          <Dropdown
            items={[...TOP_PARTICLE_QUANTITY_ITEMS]}
            value={topQuantity || '1.0x'}
            onChange={(val) => onChange('portrait_top_particle_quantity', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Movement Speed
          </label>
          <Dropdown
            items={[...TOP_PARTICLE_SPEED_ITEMS]}
            value={topSpeed || '1.0x'}
            onChange={(val) => onChange('portrait_top_particle_speed', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Ribbon Path Spread
          </label>
          <Dropdown
            items={[...PATH_SPREAD_ITEMS]}
            value={pathSpread || '2.6px'}
            onChange={(val) => onChange('portrait_path_spread', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Glow Distance &amp; Reach
          </label>
          <Dropdown
            items={[...TOP_PARTICLE_GLOW_DISTANCE_ITEMS]}
            value={glowDistance || '8px'}
            onChange={(val) => onChange('portrait_glow_distance', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Photograph Rim Lighting
          </label>
          <Dropdown
            items={[...LIGHT_INTENSITY_ITEMS]}
            value={lightIntensity || '0.38'}
            onChange={(val) => onChange('portrait_light_intensity', val)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
