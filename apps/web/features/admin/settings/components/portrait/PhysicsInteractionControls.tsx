'use client';

import * as React from 'react';
import { Zap } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  CLICK_FORCE_ITEMS,
  BOUNCE_SPEED_ITEMS,
  INTRO_ANIMATION_ITEMS,
} from './portrait.constants';

export interface PhysicsInteractionControlsProps {
  clickForce: string;
  bounceSpeed: string;
  introAnimation: string;
  onChange: (key: string, value: string) => void;
}

export function PhysicsInteractionControls({
  clickForce,
  bounceSpeed,
  introAnimation,
  onChange,
}: PhysicsInteractionControlsProps) {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <Zap className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          Touch Dynamics &amp; Animation
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Click Impulse Force
          </label>
          <Dropdown
            items={[...CLICK_FORCE_ITEMS]}
            value={clickForce || '1.8x'}
            onChange={(val) => onChange('portrait_click_force', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Bounce Return Speed
          </label>
          <Dropdown
            items={[...BOUNCE_SPEED_ITEMS]}
            value={bounceSpeed || '8.2'}
            onChange={(val) => onChange('portrait_bounce_speed', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Initial Flight Arrival
          </label>
          <Dropdown
            items={[...INTRO_ANIMATION_ITEMS]}
            value={introAnimation || 'standard'}
            onChange={(val) => onChange('portrait_intro_animation', val)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
