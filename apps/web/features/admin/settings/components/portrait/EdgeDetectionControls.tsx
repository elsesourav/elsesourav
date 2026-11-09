'use client';

import * as React from 'react';
import { Route, Sliders, Anchor } from 'lucide-react';
import { Dropdown } from '@elsesourav/ui/interior';
import {
  EDGE_ALGORITHM_ITEMS,
  EDGE_THRESHOLD_ITEMS,
  PIN_BOTTOM_ITEMS,
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
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <Route className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          Contour &amp; Edge Detection
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Algorithm
          </label>
          <Dropdown
            items={[...EDGE_ALGORITHM_ITEMS]}
            value={algorithm || 'perimeter'}
            onChange={(val) => onChange('portrait_edge_algorithm', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Sensitivity Threshold
          </label>
          <Dropdown
            items={[...EDGE_THRESHOLD_ITEMS]}
            value={threshold || '28'}
            onChange={(val) => onChange('portrait_edge_threshold', val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
            Bottom Alignment
          </label>
          <Dropdown
            items={[...PIN_BOTTOM_ITEMS]}
            value={pinBottom || 'true'}
            onChange={(val) => onChange('portrait_pin_bottom_edge', val)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
