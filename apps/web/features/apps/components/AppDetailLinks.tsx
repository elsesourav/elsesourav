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
      return <GitBranch className="w-4 h-4 text-zinc-300" />;
    case 'chrome':
      return <Compass className="w-4 h-4 text-amber-400" />;
    case 'android':
    case 'ios':
      return <Smartphone className="w-4 h-4 text-emerald-400" />;
    case 'macos':
      return <Apple className="w-4 h-4 text-zinc-200" />;
    case 'web':
    default:
      return <Globe className="w-4 h-4 text-indigo-400" />;
  }
}

export function AppDetailLinks({ links }: AppDetailLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
        <ExternalLink className="w-5 h-5 text-indigo-400" /> Platforms & Downloads
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
          >
            <Card className="p-4 rounded-2xl border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-indigo-500/40 transition-all flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0">
                  {getPlatformIcon(link.platform)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                    {link.label}
                  </h4>
                  <span className="text-[11px] text-zinc-500 capitalize">
                    {link.platform} Platform
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
