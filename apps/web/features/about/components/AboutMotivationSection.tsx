import React from 'react';
import { Reveal } from '@elsesourav/ui';
import { Sparkles } from 'lucide-react';

export function AboutMotivationSection() {
  return (
    <Reveal direction="up" distance={14}>
      <section
        data-section="motivation"
        aria-labelledby="why-projects-heading"
        className="space-y-2 sm:space-y-3"
      >
        <div className="p-3.5 sm:p-5 md:p-7 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm space-y-2.5 sm:space-y-3.5">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Core Motivation</span>
          </div>

          <h2
            id="why-projects-heading"
            className="text-base min-[400px]:text-lg sm:text-xl md:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight leading-snug"
          >
            &ldquo;I like understanding ideas by building them.&rdquo;
          </h2>

          <p className="text-xs sm:text-sm text-[hsl(var(--foreground))] leading-relaxed">
            Rather than viewing software engineering through a single narrow framework, Sourav
            approaches programming as a medium for understanding systems from first principles.
            When exploring computer graphics, he writes canvas renderers and physics loops. When
            studying AI, he builds browser extensions with local WebAssembly models. When
            solving data management bottlenecks, he develops batch automation tools.
          </p>

          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            Every project in this portfolio represents an intentional exploration: exploring new
            paradigms, testing performance boundaries, and crafting tools that solve concrete
            real-world problems.
          </p>
        </div>
      </section>
    </Reveal>
  );
}
