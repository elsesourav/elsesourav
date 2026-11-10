'use client';

import * as React from 'react';
import { Monitor, Tablet, Smartphone, Sparkles } from 'lucide-react';
import type { PortraitDeviceTarget } from './portrait.types';

export interface PortraitDeviceTargetTabsProps {
  activeDevice: PortraitDeviceTarget;
  onSelectDevice: (device: PortraitDeviceTarget) => void;
  desktopRes: string;
  tabletRes: string;
  mobileRes: string;
}

export function PortraitDeviceTargetTabs({
  activeDevice,
  onSelectDevice,
  desktopRes,
  tabletRes,
  mobileRes,
}: PortraitDeviceTargetTabsProps) {
  const devices = [
    {
      id: 'desktop' as const,
      label: 'Desktop',
      icon: Monitor,
      resolution: `${desktopRes || '256'}px`,
      desc: 'High DPI / Full Scale',
    },
    {
      id: 'tablet' as const,
      label: 'Tablet',
      icon: Tablet,
      resolution: `${tabletRes || '192'}px`,
      desc: 'Medium DPI / Touch',
    },
    {
      id: 'mobile' as const,
      label: 'Mobile',
      icon: Smartphone,
      resolution: `${mobileRes || '144'}px`,
      desc: 'Compact / High Speed',
    },
  ];

  return (
    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Device Optimization Target &amp; Pixel Ratios
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Separate Per-Device Tuning</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {devices.map((d) => {
          const Icon = d.icon;
          const isActive = activeDevice === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDevice(d.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 dark:border-cyan-500/60 text-cyan-950 dark:text-white shadow-[0_0_16px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                  : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-400/40 dark:border-cyan-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold truncate">{d.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1 rounded ${
                      isActive ? 'bg-cyan-500/30 text-cyan-800 dark:text-cyan-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500'
                    }`}
                  >
                    {d.resolution}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 truncate hidden sm:block">{d.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
