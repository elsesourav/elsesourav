'use client';

import * as React from 'react';
import { Zap, Sparkles, Move, MousePointerClick } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  CLICK_FORCE_ITEMS,
  BOUNCE_SPEED_ITEMS,
  CLICK_RADIUS_ITEMS,
  HOVER_SPEED_ITEMS,
  HOVER_THRESHOLD_ITEMS,
  CLICK_SPEED_ITEMS,
  INTRO_ANIMATION_ITEMS,
  INTRO_SPREAD_ITEMS,
  INTRO_PATTERN_ITEMS,
} from './portrait.constants';

export interface PhysicsInteractionControlsProps {
  clickForce: string;
  bounceSpeed: string;
  clickRadius?: string;
  hoverSpeed?: string;
  hoverThreshold?: string;
  clickSpeed?: string;
  introAnimation: string;
  introSpread?: string;
  introPattern?: string;
  onChange: (key: string, value: string) => void;
}

export function PhysicsInteractionControls({
  clickForce,
  bounceSpeed,
  clickRadius,
  hoverSpeed,
  hoverThreshold,
  clickSpeed,
  introAnimation,
  introSpread,
  introPattern,
  onChange,
}: PhysicsInteractionControlsProps) {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
        <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Touch Dynamics &amp; Intro Physics
        </h4>
      </div>

      {/* 1. Touch & Hover Displacement Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          <Move className="w-3.5 h-3.5 text-cyan-500" />
          <span>Touch &amp; Cursor Movement</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Pixel Movement Speed
            </label>
            <Dropdown
              items={[...HOVER_SPEED_ITEMS]}
              value={hoverSpeed || '1.0x'}
              onChange={(val) => onChange('portrait_hover_speed', val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Hover Threshold Radius
            </label>
            <Dropdown
              items={[...HOVER_THRESHOLD_ITEMS]}
              value={hoverThreshold || '55px'}
              onChange={(val) => onChange('portrait_hover_threshold', val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Elastic Return Speed
            </label>
            <Dropdown
              items={[...BOUNCE_SPEED_ITEMS]}
              value={bounceSpeed || '8.2'}
              onChange={(val) => onChange('portrait_bounce_speed', val)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 2. Click Shockwave Impulse Controls */}
      <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
          <span>Click Impact &amp; Wave Speed</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Click Impulse Force
            </label>
            <Dropdown
              items={[...CLICK_FORCE_ITEMS]}
              value={clickForce || '1.0x'}
              onChange={(val) => onChange('portrait_click_force', val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Click Wave Expansion Speed
            </label>
            <Dropdown
              items={[...CLICK_SPEED_ITEMS]}
              value={clickSpeed || '1.0x'}
              onChange={(val) => onChange('portrait_click_speed', val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Click Effect Radius
            </label>
            <Dropdown
              items={[...CLICK_RADIUS_ITEMS]}
              value={clickRadius || '80px'}
              onChange={(val) => onChange('portrait_click_radius', val)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 3. Intro Flight Transition & Random Arrival */}
      <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Intro Transition &amp; Pixel Dispersion</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Intro Flight Duration
            </label>
            <Dropdown
              items={[...INTRO_ANIMATION_ITEMS]}
              value={introAnimation || '1.0s'}
              onChange={(val) => onChange('portrait_intro_animation', val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Intro Pixel Spreadness
            </label>
            <Dropdown
              items={[...INTRO_SPREAD_ITEMS]}
              value={introSpread || '1.0x'}
              onChange={(val) => onChange('portrait_intro_spread', val)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Arrival Pattern / Randomness
            </label>
            <Dropdown
              items={[...INTRO_PATTERN_ITEMS]}
              value={introPattern || 'vortex'}
              onChange={(val) => onChange('portrait_intro_pattern', val)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
