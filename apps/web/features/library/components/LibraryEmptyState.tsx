import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { Bookmark, Compass } from 'lucide-react';

export function LibraryEmptyState() {
  return (
    <div className="py-20 px-4 text-center rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm max-w-lg mx-auto space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        <Bookmark className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-zinc-100">Your library is empty</h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Bookmark web applications, developer utilities, and browser extensions to quickly access
          them here anytime.
        </p>
      </div>

      <div className="pt-2">
        <Link href="/apps">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-lg shadow-indigo-600/20">
            <Compass className="w-4 h-4" /> Explore Applications
          </Button>
        </Link>
      </div>
    </div>
  );
}
