'use client';

import * as React from 'react';
import { Route, Sliders, Anchor } from 'lucide-react';
import {
  EDGE_ALGORITHM_OPTIONS,
  EDGE_THRESHOLD_OPTIONS,
  PIN_BOTTOM_OPTIONS,
} from './portrait.constants';

export interface EdgeDetectionControlsProps {
  algorithm: string;
  threshold: string;
  pinBottom: string;
  onChange: (key: string, value: string) => void;
}

export function EdgeDetectionControls({
  algorithm,
  threshold,
  pinBottom,
  onChange,
}: EdgeDetectionControlsProps) {
  return (
    <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
        <Route className="w-4 h-4 text-cyan-400" />
        <div>
          <h4 className="text-xs font-bold text-zinc-100">
            Silhouette Contour & Edge Detection
          </h4>
          <p className="text-[11px] text-zinc-400">
            Configure how WebAssembly detects curls, jawlines, and bottom hoodie boundaries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Algorithm Selection Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-cyan-400" />
            <span>Detection Algorithm</span>
          </label>
          <select
            value={algorithm || 'perimeter'}
            onChange={(e) => onChange('portrait_edge_algorithm', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {EDGE_ALGORITHM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {EDGE_ALGORITHM_OPTIONS.find((o) => o.value === algorithm)?.desc ??
              EDGE_ALGORITHM_OPTIONS[0]?.desc ??
              ''}
          </p>
        </div>

        {/* 2. Threshold Value Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sensitivity Threshold</span>
          </label>
          <select
            value={threshold || '28'}
            onChange={(e) => onChange('portrait_edge_threshold', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {EDGE_THRESHOLD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {EDGE_THRESHOLD_OPTIONS.find((o) => o.value === threshold)?.desc ??
              EDGE_THRESHOLD_OPTIONS[2]?.desc ??
              ''}
          </p>
        </div>

        {/* 3. Bottom Canvas Pinning Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-purple-400" />
            <span>Bottom Canvas Alignment</span>
          </label>
          <select
            value={pinBottom || 'true'}
            onChange={(e) => onChange('portrait_pin_bottom_edge', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            {PIN_BOTTOM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {PIN_BOTTOM_OPTIONS.find((o) => o.value === pinBottom)?.desc ??
              PIN_BOTTOM_OPTIONS[0]?.desc ??
              ''}
          </p>
        </div>
      </div>
    </div>
  );
}
