import * as React from 'react';
import type { AppVersion } from '@elsesourav/types';
import { Card, Badge } from '@elsesourav/ui';
import { History, Calendar } from 'lucide-react';

interface AppVersionHistoryProps {
  versions: readonly AppVersion[];
}

export function AppVersionHistory({ versions }: AppVersionHistoryProps) {
  if (!versions || versions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
        <History className="w-5 h-5 text-indigo-400" /> Release History & Changelogs
      </h2>

      <div className="space-y-3">
        {versions.map((ver, idx) => {
          const formattedDate = new Date(ver.releaseDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <Card
              key={ver.id}
              className="p-4 rounded-xl border-zinc-800/80 bg-zinc-900/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={idx === 0 ? 'success' : 'outline'} className="text-xs font-mono">
                    v{ver.version}
                  </Badge>
                  {idx === 0 && (
                    <span className="text-[10px] text-emerald-400 font-medium">Latest Release</span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                </span>
              </div>
              <p className="text-xs text-zinc-400 whitespace-pre-line leading-relaxed">
                {ver.changelog}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
