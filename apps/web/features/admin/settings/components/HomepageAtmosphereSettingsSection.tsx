'use client';

import * as React from 'react';
import { Card, Badge } from '@elsesourav/ui';
import { Sparkles, Zap, Smartphone, Gauge, Info, Flame, Moon } from 'lucide-react';

export interface HomepageAtmosphereSettingsProps {
  atmosphereDensity: string;
  meteorFrequency: string;
  starsSpeed: string;
  mobileEffects: string;
  onChange: (key: string, value: string) => void;
}

const DENSITY_OPTIONS = [
  { value: '0.5', label: '0.5x Minimal', desc: 'Subtle ambient field' },
  { value: '0.75', label: '0.75x Light', desc: 'Low density' },
  { value: '1.0', label: '1.0x Standard', desc: 'Optimal default' },
  { value: '1.25', label: '1.25x Rich', desc: 'High particle count' },
  { value: '1.5', label: '1.5x Lush', desc: 'Dense cosmic canopy' },
  { value: '2.0', label: '2.0x Ultra', desc: 'Maximum particles' },
];

const METEOR_OPTIONS = [
  { value: 'off', label: 'Off', desc: 'No shooting stars' },
  { value: 'rare', label: 'Subtle', desc: 'Occasional (8–15s)' },
  { value: 'standard', label: 'Standard', desc: 'Balanced (3–6s)' },
  { value: 'frequent', label: 'Frequent', desc: 'Active (1.5–3s)' },
];

const SPEED_OPTIONS = [
  { value: '0.5', label: '0.5x Slow', desc: 'Dreamy slow drift' },
  { value: '1.0', label: '1.0x Normal', desc: 'Natural cosmic pace' },
  { value: '1.5', label: '1.5x Brisk', desc: 'Lively twinkling' },
  { value: '2.0', label: '2.0x Rapid', desc: 'High tempo' },
];

const MOBILE_OPTIONS = [
  {
    value: 'battery_saver',
    label: 'Battery Saver',
    icon: Zap,
    desc: 'Lightweight particle density for maximum battery life.',
  },
  {
    value: 'standard',
    label: 'Standard Adaptive',
    icon: Gauge,
    desc: 'Smooth 60 FPS drawing, twinkling, and touch-swipe meteors.',
  },
  {
    value: 'enhanced',
    label: 'Enhanced Fidelity',
    icon: Flame,
    desc: 'Full desktop particle density and rich meteors on mobile.',
  },
];

export function HomepageAtmosphereSettingsSection({
  atmosphereDensity = '1.0',
  meteorFrequency = 'standard',
  starsSpeed = '1.0',
  mobileEffects = 'standard',
  onChange,
}: HomepageAtmosphereSettingsProps) {
  return (
    <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Homepage Atmospheric Canvas (WebGL + WebAssembly)
          </h4>
        </div>
        <Badge variant="primary" className="text-[10px] font-mono">
          C++ WASM Engine
        </Badge>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Configure the WebGL particle simulation rendered behind the floating island on the
        homepage hero. Operates with zero JavaScript garbage collection overhead and native 60–120
        FPS GPU acceleration.
      </p>

      {/* 1. Base Particle Density */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
          <span>Base Particle Density</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">{atmosphereDensity}x</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('homepage_atmosphere_density', opt.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                atmosphereDensity === opt.value
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/80 text-indigo-950 dark:text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-medium">{opt.label}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Meteor (Shooting Star) Rate */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
          <span>Shooting Star / Meteor Frequency</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] capitalize">
            {meteorFrequency}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {METEOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('homepage_meteor_frequency', opt.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                meteorFrequency === opt.value
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/80 text-indigo-950 dark:text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-medium">{opt.label}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Animation Drift & Twinkle Speed */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
          <span>Simulation Speed & Drift Tempo</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">{starsSpeed}x</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('homepage_stars_speed', opt.value)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                starsSpeed === opt.value
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/80 text-indigo-950 dark:text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-medium">{opt.label}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Mobile Screen Experience & Battery Profile */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Mobile Screen Animation & Effects Profile
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOBILE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = mobileEffects === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('homepage_mobile_effects', opt.value)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/80 text-indigo-950 dark:text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Hardware-Adaptive Architecture Info */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
          <p className="font-semibold text-zinc-900 dark:text-zinc-200">
            Real-Time Hardware-Adaptive Auto Scaling
          </p>
          <p className="leading-relaxed">
            The WebAssembly atmosphere engine dynamically inspects the client device's logical CPU
            cores (<code className="text-indigo-700 dark:text-indigo-300 font-mono">hardwareConcurrency</code>), device
            memory, and device pixel ratio. High-end hardware automatically scales up particle count
            (up to 1.35x), while low-spec phones or battery-saving modes scale down to guarantee
            solid 60 FPS scrolling and zero CPU/GPU thermal throttling.
          </p>
        </div>
      </div>
    </div>
  );
}
