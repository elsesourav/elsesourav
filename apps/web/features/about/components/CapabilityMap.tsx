import * as React from 'react';
import Link from 'next/link';
import { Reveal, RevealGroup } from '@elsesourav/ui';
import { CAPABILITY_GROUPS_CONFIG } from '@elsesourav/config';
import {
  Gamepad2,
  Palette,
  Sparkles,
  Workflow,
  Cpu,
  Waves,
  Smartphone,
  Layers,
  ArrowRight,
} from 'lucide-react';

function getCapabilityIcon(id: string): React.ReactNode {
  switch (id) {
    case 'interactive-games':
      return <Gamepad2 className="w-4 h-4 text-purple-400" />;
    case 'creative-tools':
      return <Palette className="w-4 h-4 text-pink-400" />;
    case 'ai-ml':
      return <Sparkles className="w-4 h-4 text-indigo-400" />;
    case 'automation':
      return <Workflow className="w-4 h-4 text-amber-400" />;
    case 'systems-wasm':
      return <Cpu className="w-4 h-4 text-cyan-400" />;
    case 'graphics-simulations':
      return <Waves className="w-4 h-4 text-emerald-400" />;
    case 'mobile-offline':
      return <Smartphone className="w-4 h-4 text-blue-400" />;
    case 'web-applications':
      return <Layers className="w-4 h-4 text-violet-400" />;
    default:
      return <Cpu className="w-4 h-4 text-zinc-400" />;
  }
}

export function CapabilityMap() {
  return (
    <section aria-labelledby="capability-map-heading" className="space-y-6">
      <Reveal direction="up" distance={14}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            <Cpu className="w-4 h-4" />
            <span>Capability Map</span>
          </div>
          <h2 id="capability-map-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Areas I Like Building In
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Every capability is grounded directly in verified, working implementations across the portfolio—with zero artificial skill meters or percentage bars.
          </p>
        </div>
      </Reveal>

      <RevealGroup staggerDelay={0.05} baseDelay={0.06} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {CAPABILITY_GROUPS_CONFIG.map((group) => (
          <div
            key={group.id}
            className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-4 flex flex-col justify-between hover:border-zinc-700/80 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center">
                    {getCapabilityIcon(group.id)}
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">
                    {group.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {group.summary}
              </p>

              {/* Technology Context Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {group.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/70 border border-zinc-700/50 text-zinc-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Verified Project Evidence Links */}
            <div className="pt-3 border-t border-zinc-800/60 space-y-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                Evidence & Working Projects:
              </span>
              <div className="space-y-1.5">
                {group.projects.map((proj) => (
                  <Link
                    key={proj.slug}
                    href={`/apps/${proj.slug}`}
                    className="group/item flex items-center justify-between p-2 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/60 border border-zinc-800/50 hover:border-indigo-500/40 transition-all text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-semibold text-zinc-200 group-hover/item:text-indigo-300 transition-colors block truncate">
                        {proj.name}
                      </span>
                      <span className="text-[11px] text-zinc-400 block truncate">
                        {proj.context}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover/item:text-indigo-400 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
