'use client';

import * as React from 'react';
import { Card, Badge } from '@elsesourav/ui';
import { Sparkles, Gauge, Zap, CheckCircle2, Info } from 'lucide-react';
import type { EffectsLevel } from '@elsesourav/types';

export interface AppearanceSettingsTabProps {
  effectsLevel: string;
  onChange: (level: EffectsLevel) => void;
}

interface FidelityOption {
  value: EffectsLevel;
  title: string;
  badge: string;
  badgeVariant: 'primary' | 'success' | 'warning' | 'info';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  specs: {
    backdropBlur: string;
    shadows: string;
    ambientGlow: string;
    scrollImpact: string;
  };
}

const FIDELITY_OPTIONS: readonly FidelityOption[] = [
  {
    value: 'high',
    title: 'High Fidelity (Maximum Visual Depth)',
    badge: 'Default / Cinematic',
    badgeVariant: 'primary',
    icon: Sparkles,
    description:
      'Full glassmorphism, multi-layer backdrop blurs (up to 40px), deep elevation shadows, cosmic ambient glow orbs, and neon atmospheric highlights. Delivers the richest visual depth.',
    specs: {
      backdropBlur: 'Full Multi-Layer (up to 40px)',
      shadows: 'Deep 3D elevation + neon glow cards',
      ambientGlow: 'Full dynamic ambient orbs + drift animation',
      scrollImpact: 'GPU intensive on low-end devices / integrated GPUs',
    },
  },
  {
    value: 'medium',
    title: 'Medium Fidelity (Balanced & Responsive)',
    badge: 'Balanced 60 FPS',
    badgeVariant: 'info',
    icon: Gauge,
    description:
      'Subdued backdrop blurs (clamped to 4px), lightweight single-layer elevation shadows, and static ambient glow. Substantially reduces compositor repaints while preserving a clean glass aesthetic.',
    specs: {
      backdropBlur: 'Clamped light blur (4px max)',
      shadows: 'Subdued single-layer soft shadows (4–6px)',
      ambientGlow: 'Dimmed static glow (animations paused)',
      scrollImpact: 'Smooth 60 FPS on mid-range laptops and tablets',
    },
  },
  {
    value: 'low',
    title: 'Low Fidelity / Maximum Performance',
    badge: 'Zero Scroll Lag',
    badgeVariant: 'success',
    icon: Zap,
    description:
      'Completely disables expensive backdrop-filter shaders, flattens heavy box-shadows, removes offscreen blurred gradient orbs, and solidifies card backgrounds. Guaranteed buttery-smooth scrolling.',
    specs: {
      backdropBlur: 'Disabled (backdrop-filter: none)',
      shadows: 'Flat (crisp 1px hairline borders)',
      ambientGlow: 'Disabled (zero offscreen GPU convolution)',
      scrollImpact: 'Maximum FPS — butter-smooth scrolling everywhere',
    },
  },
];

export function AppearanceSettingsTab({
  effectsLevel = 'high',
  onChange,
}: AppearanceSettingsTabProps) {
  const currentLevel: EffectsLevel =
    effectsLevel === 'low' || effectsLevel === 'medium' || effectsLevel === 'high'
      ? effectsLevel
      : 'high';

  const handleSelect = (val: EffectsLevel) => {
    onChange(val);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-effects', val);
      try {
        localStorage.setItem('effects_level', val);
      } catch {
        // Ignore localStorage quota errors
      }
    }
  };

  return (
    <Card className="p-5 sm:p-6 space-y-6 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm dark:shadow-none">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide uppercase">
            Visual Effects &amp; Scroll Performance Fidelity
          </h3>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Configure platform-wide visual rendering fidelity. This canonical backend setting controls
          backdrop blur filters, box-shadow convolutions, and ambient gradient glow orbs across all
          public and authenticated pages to optimize scrolling performance.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Visual fidelity options"
        className="grid grid-cols-1 gap-4"
      >
        {FIDELITY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = currentLevel === option.value;

          return (
            <div
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleSelect(option.value);
                }
              }}
              className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/5'
                  : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 p-2 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                        : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {option.title}
                      </span>
                      <Badge variant={option.badgeVariant} size="sm">
                        {option.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/50'
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 group-hover:border-zinc-400 dark:group-hover:border-zinc-600'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="block text-zinc-500 dark:text-zinc-400 font-medium">Backdrop Blur:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono">{option.specs.backdropBlur}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 dark:text-zinc-400 font-medium">Shadow Convolutions:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono">{option.specs.shadows}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 dark:text-zinc-400 font-medium">Ambient Atmosphere:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono">{option.specs.ambientGlow}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 dark:text-zinc-400 font-medium">Scroll Speed:</span>
                  <span
                    className={
                      option.value === 'low'
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : option.value === 'medium'
                          ? 'text-sky-600 dark:text-sky-400 font-medium'
                          : 'text-amber-600 dark:text-amber-400 font-medium'
                    }
                  >
                    {option.specs.scrollImpact}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture & SSR Explanation Callout */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-300">How This Setting Works</p>
          <p>
            When saved, this updates the database{' '}
            <code className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1 py-0.5 rounded font-mono">
              SiteSetting[effects_level]
            </code>
            . The server injects the chosen mode directly into the root{' '}
            <code className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1 py-0.5 rounded font-mono">
              &lt;html data-effects=&quot;{currentLevel}&quot;&gt;
            </code>{' '}
            attribute on initial page load. All backdrop filters, box-shadows, and background atmosphere
            layers adjust globally without requiring client-side re-renders.
          </p>
        </div>
      </div>
    </Card>
  );
}
