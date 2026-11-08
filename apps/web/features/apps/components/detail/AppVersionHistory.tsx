import type { AppVersion } from '@elsesourav/types';
import { Card } from '@elsesourav/ui';
import { Calendar, CheckCircle2, History } from 'lucide-react';

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
          <h2
            id="release-history-heading"
            className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold"
          >
            Release History & Changelog
          </h2>
        </div>
        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
          {versions.length} {versions.length === 1 ? 'Release' : 'Releases'}
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-[hsl(var(--border-subtle))]">
        {versions.map((ver, idx) => {
          const formattedDate = new Date(ver.releaseDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const isLatest = idx === 0;

          return (
            <div key={ver.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-4 w-3 h-3 rounded-full ring-4 ring-[hsl(var(--background))] z-10 transition-transform group-hover:scale-125 ${
                  isLatest
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-[hsl(var(--muted-foreground))]/40'
                }`}
              />

              <Card
                className={`p-3 sm:p-3.5 md:p-4 rounded-2xl border transition-all duration-300 ease-out space-y-2.5 backdrop-blur-md ${
                  isLatest
                    ? 'border-emerald-500/30 bg-[hsl(var(--card))] shadow-sm'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 hover:bg-[hsl(var(--surface-elevated))]'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] text-[hsl(var(--foreground))]">
                      v{ver.version}
                    </span>
                    {isLatest && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Current Stable</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] whitespace-pre-line leading-relaxed font-sans">
                  {ver.changelog}
                </p>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
}
