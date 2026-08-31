import * as React from 'react';
import type { AppLink } from '@elsesourav/types';
import { Card } from '@elsesourav/ui';
import { ExternalLink, Globe, Compass, Smartphone, Apple, Terminal, GitBranch } from 'lucide-react';

interface AppDetailLinksProps {
  links: readonly AppLink[];
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'github':
      return <GitBranch className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
    case 'chrome':
      return <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'android':
    case 'ios':
      return <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'macos':
      return <Apple className="w-4 h-4 text-[hsl(var(--foreground))]" />;
    case 'web':
    default:
      return <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  }
}

export function AppDetailLinks({ links }: AppDetailLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="platforms-downloads-heading" className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
          <ExternalLink className="w-4 h-4" />
          <h2
            id="platforms-downloads-heading"
            className="text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold"
          >
            Platforms & Distribution Links
          </h2>
        </div>
        <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
          {links.length} {links.length === 1 ? 'Target' : 'Targets'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
          >
            <Card className="p-4 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/50 transition-all flex items-center justify-between shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] flex items-center justify-center shrink-0 shadow-inner">
                  {getPlatformIcon(link.platform)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {link.label}
                  </h4>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
                    {link.platform} Distribution
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}
