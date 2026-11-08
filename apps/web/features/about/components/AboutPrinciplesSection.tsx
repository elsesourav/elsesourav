import React from 'react';
import { Reveal, RevealGroup } from '@elsesourav/ui';
import { CheckCircle2 } from 'lucide-react';

export interface AboutPrinciplesSectionProps {
  principles: readonly string[];
}

export function AboutPrinciplesSection({ principles }: AboutPrinciplesSectionProps) {
  if (!principles || principles.length === 0) return null;

  return (
    <section
      data-section="principles"
      aria-labelledby="principles-heading"
      className="space-y-4 sm:space-y-6"
    >
      <Reveal direction="up" distance={14}>
        <div className="space-y-1.5 sm:space-y-2">
          <h2
            id="principles-heading"
            className="text-lg min-[400px]:text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            Building Principles
          </h2>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
            The core principles guiding how software is designed, engineered, and maintained:
          </p>
        </div>
      </Reveal>

      <RevealGroup
        staggerDelay={0.05}
        baseDelay={0.06}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4"
      >
        {principles.map((principle, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-start gap-2.5 sm:gap-3.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-[hsl(var(--foreground))] font-medium leading-relaxed">
              {principle}
            </span>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
