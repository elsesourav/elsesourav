'use client';

import * as React from 'react';
import { BlurUpImage } from '@elsesourav/ui/interior';
import { IconButton } from '@elsesourav/ui';
import { Maximize2, Monitor } from 'lucide-react';

export interface AppMediaLandscapeCardProps {
  src: string;
  appName: string;
  index: number;
  onExpand: () => void;
  className?: string;
}

export function AppMediaLandscapeCard({
  src,
  appName,
  index,
  onExpand,
  className = '',
}: AppMediaLandscapeCardProps) {
  return (
    <div
      onClick={onExpand}
      className={`group/card relative rounded-2xl overflow-hidden border border-[hsl(var(--border))] dark:border-zinc-800/80 bg-[hsl(var(--card))] dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg cursor-zoom-in ${className}`}
      title={`${appName} Desktop Preview ${index + 1}`}
    >
      <BlurUpImage
        src={src}
        alt={`${appName} preview ${index + 1}`}
        fill
        objectFit="cover"
        className="w-full h-full group-hover/card:scale-105 transition-transform duration-500 ease-out"
      />

      {/* Desktop Device Pill Tag in top-left on hover */}
      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-black/70 backdrop-blur-md text-indigo-400 border border-indigo-500/30">
          <Monitor className="w-2.5 h-2.5" />
          <span>Desktop</span>
        </span>
      </div>

      {/* Expand Icon Button in bottom-right */}
      <div className="absolute right-3 bottom-3 z-10 opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-300 ease-out pointer-events-none">
        <IconButton
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          aria-label={`Expand ${appName} preview ${index + 1}`}
          icon={<Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
          className="rounded-xl bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md pointer-events-auto"
        />
      </div>
    </div>
  );
}
