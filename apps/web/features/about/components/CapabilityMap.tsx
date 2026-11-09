import * as React from 'react';
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
} from 'lucide-react';

function getCapabilityIcon(id: string): React.ReactNode {
  switch (id) {
    case 'interactive-games':
      return <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />;
    case 'creative-tools':
      return <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400" />;
    case 'ai-ml':
      return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />;
    case 'automation':
      return <Workflow className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />;
    case 'systems-wasm':
      return <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />;
    case 'graphics-simulations':
      return <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />;
    case 'mobile-offline':
      return <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />;
    case 'web-applications':
      return <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />;
    default:
      return <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />;
  }
}

export function CapabilityMap() {
  return (
    <section
      data-section="capabilities"
      aria-labelledby="capability-map-heading"
      className="space-y-3.5 sm:space-y-5"
    >
      <Reveal direction="up" distance={14}>
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Capability Map</span>
          </div>
          <h2
            id="capability-map-heading"
            className="text-lg min-[400px]:text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            Areas I Like Building In
          </h2>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] max-w-2xl leading-relaxed">
            Core technical domains and capabilities explored through hands-on software experiments,
            benchmarks, and production systems.
          </p>
        </div>
      </Reveal>

      {/* Responsive Compact Domains & Tooling Grid (Option 1) */}
      <RevealGroup
        staggerDelay={0.04}
        baseDelay={0.05}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5"
      >
        {CAPABILITY_GROUPS_CONFIG.map((group) => (
          <div
            key={group.id}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm space-y-2 sm:space-y-2.5 flex flex-col justify-between hover:border-[hsl(var(--border-strong))] transition-colors"
          >
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] flex items-center justify-center shrink-0">
                  {getCapabilityIcon(group.id)}
                </div>
                <h3 className="text-xs min-[400px]:text-sm sm:text-sm font-bold text-[hsl(var(--foreground))] leading-snug">
                  {group.title}
                </h3>
              </div>

              <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-2">
                {group.summary}
              </p>
            </div>

            {/* Contextual Tech Stack Chips */}
            <div className="flex flex-wrap gap-1 pt-1 border-t border-[hsl(var(--border-subtle))]">
              {group.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] text-[hsl(var(--muted-foreground))]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
