'use client';

import * as React from 'react';
import { BlurUpImage } from '@elsesourav/ui/interior';
import { IconButton } from '@elsesourav/ui';
import { Maximize2, Smartphone } from 'lucide-react';

export interface AppMediaPhoneCardProps {
  src: string;
  appName: string;
  index: number;
  onExpand: () => void;
  className?: string;
}

export function AppMediaPhoneCard({
  src,
  appName,
  index,
  onExpand,
  className = '',
}: AppMediaPhoneCardProps) {
  return (
    <div
      onClick={onExpand}
      className={`group/phone relative aspect-[9/16] rounded-[2rem] border-2 border-zinc-300/80 dark:border-zinc-800 bg-zinc-900/90 p-1.5 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-500/50 cursor-zoom-in ${className}`}
      title={`${appName} Mobile Preview ${index + 1}`}
    >
      {/* Device Inner Screen Container */}
      <div className="relative w-full h-full rounded-[1.6rem] overflow-hidden bg-zinc-950">
        {/* Dynamic Island / Speaker Pill */}
        <div
          aria-hidden="true"
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-black/80 dark:bg-black/90 border border-white/10 z-20 pointer-events-none shadow-xs"
        />

        {/* Mobile Screen Image with BlurUp & Skeleton Shimmer */}
        <BlurUpImage
          src={src}
          alt={`${appName} mobile screenshot ${index + 1}`}
          fill
          objectFit="cover"
          className="w-full h-full group-hover/phone:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Mobile Device Pill Tag in top-left */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none opacity-0 group-hover/phone:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            <Smartphone className="w-2.5 h-2.5" />
            <span>Mobile</span>
          </span>
        </div>

        {/* Expand Lightbox Button in bottom right */}
        <div className="absolute right-2.5 bottom-2.5 z-20 opacity-0 translate-y-1 group-hover/phone:opacity-100 group-hover/phone:translate-y-0 transition-all duration-300 pointer-events-none">
          <IconButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            aria-label={`Expand ${appName} mobile preview ${index + 1}`}
            icon={<Maximize2 className="w-3.5 h-3.5" />}
            className="rounded-xl bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md pointer-events-auto"
          />
        </div>
      </div>
    </div>
  );
}
