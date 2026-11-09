'use client';

import * as React from 'react';
import { Badge, Button } from '@elsesourav/ui';
import { Sparkles, Undo2, Send, Cpu } from 'lucide-react';

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
    <div className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-lg">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-100 truncate">Portrait Studio</span>
            <Badge variant="primary" className="text-[8px] font-mono py-0 px-1 shrink-0">
              WASM
            </Badge>
          </div>
          <div>
            {hasUnappliedChanges ? (
              <span className="text-[10px] text-amber-400 font-medium">● Draft Active</span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-medium">● Synced</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {hasUnappliedChanges && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onRevert}
            className="text-[11px] h-7 px-2 rounded-lg border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <Undo2 className="w-3 h-3 mr-1" />
            <span>Revert</span>
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="xs"
          onClick={onApply}
          disabled={!hasUnappliedChanges || isApplying}
          className={`text-[11px] h-7 px-3 rounded-lg font-medium transition-all ${
            hasUnappliedChanges
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isApplying ? (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Applying...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Send className="w-3 h-3" />
              <span>Apply</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
