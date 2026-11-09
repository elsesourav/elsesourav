'use client';

import * as React from 'react';
import { Zap, Activity, PlaneTakeoff } from 'lucide-react';
import {
  CLICK_FORCE_OPTIONS,
  BOUNCE_SPEED_OPTIONS,
  INTRO_ANIMATION_OPTIONS,
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
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
        <Zap className="w-4 h-4 text-amber-400" />
        <div>
          <h4 className="text-xs font-bold text-zinc-100">
            Touch Dynamics, Click Blast & Flight Arrival
          </h4>
          <p className="text-[11px] text-zinc-400">
            Calibrate touch responsiveness, shockwave displacement speed, and initial arrival flight
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Click Blast Force Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Click Blast Impulse Force</span>
          </label>
          <select
            value={clickForce || '1.8x'}
            onChange={(e) => onChange('portrait_click_force', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {CLICK_FORCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {CLICK_FORCE_OPTIONS.find((o) => o.value === clickForce)?.desc ??
              CLICK_FORCE_OPTIONS[1]?.desc ??
              ''}
          </p>
        </div>

        {/* 2. Spring Bounce Speed Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Elastic Spring Return Speed</span>
          </label>
          <select
            value={bounceSpeed || '8.2'}
            onChange={(e) => onChange('portrait_bounce_speed', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {BOUNCE_SPEED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {BOUNCE_SPEED_OPTIONS.find((o) => o.value === bounceSpeed)?.desc ??
              BOUNCE_SPEED_OPTIONS[1]?.desc ??
              ''}
          </p>
        </div>

        {/* 3. Arrival Flight Sequence Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <PlaneTakeoff className="w-3.5 h-3.5 text-cyan-400" />
            <span>Arrival Flight Sequence</span>
          </label>
          <select
            value={introAnimation || 'standard'}
            onChange={(e) => onChange('portrait_intro_animation', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {INTRO_ANIMATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {INTRO_ANIMATION_OPTIONS.find((o) => o.value === introAnimation)?.desc ??
              INTRO_ANIMATION_OPTIONS[2]?.desc ??
              ''}
          </p>
        </div>
      </div>
    </div>
  );
}
