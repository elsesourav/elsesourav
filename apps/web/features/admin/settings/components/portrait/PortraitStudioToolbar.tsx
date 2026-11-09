'use client';

import * as React from 'react';
import { Badge, Button } from '@elsesourav/ui';
import { Sparkles, Check, Undo2, Send, Cpu } from 'lucide-react';

export interface PortraitStudioToolbarProps {
  hasUnappliedChanges: boolean;
  isApplying: boolean;
  onApply: () => void;
  onRevert: () => void;
}

export function PortraitStudioToolbar({
  hasUnappliedChanges,
  isApplying,
  onApply,
  onRevert,
}: PortraitStudioToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-100 tracking-tight">
              Interactive Portrait Studio
            </h3>
            <Badge variant="primary" className="text-[9px] font-mono py-0 px-1.5 flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" />
              <span>WASM C++</span>
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Real-time live simulation preview. Changes render instantly below.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {hasUnappliedChanges ? (
          <Badge
            variant="warning"
            className="text-[10px] font-mono px-2 py-0.5 border-amber-500/40 text-amber-300 bg-amber-950/40 flex items-center gap-1.5 animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Draft Preview Active</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] font-mono px-2 py-0.5 border-emerald-500/40 text-emerald-300 bg-emerald-950/40 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Public Site in Sync</span>
          </Badge>
        )}

        {hasUnappliedChanges && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onRevert}
            className="text-xs h-8 px-2.5 rounded-xl border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <Undo2 className="w-3.5 h-3.5 mr-1" />
            <span>Revert</span>
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="xs"
          onClick={onApply}
          disabled={!hasUnappliedChanges || isApplying}
          className={`text-xs h-8 px-3.5 rounded-xl font-medium transition-all ${
            hasUnappliedChanges
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isApplying ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Applying...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Apply to Public Site</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
