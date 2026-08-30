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
    <section aria-labelledby="release-history-heading" className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
          <History className="w-4 h-4" />
          <h2 id="release-history-heading" className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
            Release History & Changelog
          </h2>
        </div>
        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
          {versions.length} {versions.length === 1 ? 'Release' : 'Releases'}
        </span>
      </div>

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
              className="p-5 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-3 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={idx === 0 ? 'success' : 'outline'} className="text-xs font-mono">
                    v{ver.version}
                  </Badge>
                  {idx === 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium font-mono">
                      Current Stable
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] whitespace-pre-line leading-relaxed">
                {ver.changelog}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
