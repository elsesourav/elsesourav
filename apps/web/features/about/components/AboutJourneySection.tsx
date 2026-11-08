import React from 'react';
import Link from 'next/link';
import { Reveal, RevealGroup } from '@elsesourav/ui';
import { Layers } from 'lucide-react';

interface JourneyStage {
  id: string;
  stageNumber: string;
  stageBadge: string;
  category: string;
  title: string;
  description: string;
  themeColor: 'indigo' | 'purple' | 'cyan' | 'emerald';
  links: Array<{ name: string; href: string }>;
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'stage-01',
    stageNumber: '01',
    stageBadge: 'Stage 01 // Foundations',
    category: 'Core Utilities & DOM',
    title: 'Foundations, Calculators & Web Utilities',
    description:
      'Early exploration focused on mastering native browser APIs, client-side input validation, asynchronous state machines, and building tools with zero external dependencies.',
    themeColor: 'indigo',
    links: [
      { name: 'Typing Test', href: '/apps/typing-test' },
      { name: 'GST Return Ledger', href: '/apps/gst-return' },
      { name: 'Invoice Maker', href: '/apps/professional-invoice-maker' },
    ],
  },
  {
    id: 'stage-02',
    stageNumber: '02',
    stageBadge: 'Stage 02 // Interactive',
    category: 'Graphics & Physics',
    title: 'Interactive Systems, Canvas Graphics & Simulations',
    description:
      'Exploring real-time 60 FPS animation loops, physics constraints, particle dynamics, and cellular automata to understand computer graphics and procedural generation from first principles.',
    themeColor: 'purple',
    links: [
      { name: 'Breakout Ball', href: '/apps/breakout-ball' },
      { name: 'Particle Chain WASM', href: '/apps/particle-chain-wasm' },
      { name: 'Wave Function Collapse', href: '/apps/wave-function-collapse' },
      { name: 'Falling Sands', href: '/apps/falling-sands' },
    ],
  },
  {
    id: 'stage-03',
    stageNumber: '03',
    stageBadge: 'Stage 03 // Systems',
    category: 'WASM, ML & Hardware',
    title: 'Systems Programming, WebAssembly & Machine Learning',
    description:
      'Stepping below high-level frameworks—compiling C++ to WebAssembly with Emscripten, implementing matrix mathematics for on-device neural networks, and writing embedded microcontroller firmware.',
    themeColor: 'cyan',
    links: [
      { name: 'Neural Network Number Recognition', href: '/apps/nn-number-rec' },
      { name: 'ESP32-CAM WiFi Car', href: '/apps/esp32-cam-with-car-control' },
      { name: 'SpectraLens AI WASM OCR', href: '/apps/spectralens-ai' },
    ],
  },
  {
    id: 'stage-04',
    stageNumber: '04',
    stageBadge: 'Stage 04 // Applications',
    category: 'Production Software',
    title: 'Full-Stack Applications, Mobile & Automation Platforms',
    description:
      'Shipping resilient end-to-end software tools: multi-seller e-commerce batch reconciliation engines, browser extensions, client-side photo editors, and local-first mobile applications.',
    themeColor: 'emerald',
    links: [
      { name: 'ES Automation', href: '/apps/es-automation' },
      { name: 'Img Editor', href: '/apps/img-editor' },
      { name: 'Meal Tracker Mobile', href: '/apps/meal-tracker' },
      { name: 'GCELT Automate', href: '/apps/gcelt-automate' },
    ],
  },
];

function getStageBadgeClasses(theme: JourneyStage['themeColor']) {
  switch (theme) {
    case 'indigo':
      return 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    case 'purple':
      return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30';
    case 'cyan':
      return 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    case 'emerald':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  }
}

function getStageLinkClasses(theme: JourneyStage['themeColor']) {
  switch (theme) {
    case 'indigo':
      return 'text-indigo-600 dark:text-indigo-300';
    case 'purple':
      return 'text-purple-600 dark:text-purple-300';
    case 'cyan':
      return 'text-cyan-600 dark:text-cyan-300';
    case 'emerald':
      return 'text-emerald-600 dark:text-emerald-300';
  }
}

export function AboutJourneySection() {
  return (
    <section
      data-section="journey"
      aria-labelledby="journey-heading"
      className="space-y-4 sm:space-y-6"
    >
      <Reveal direction="up" distance={14}>
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Evolution</span>
          </div>
          <h2
            id="journey-heading"
            className="text-lg min-[400px]:text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            Project Journey & Technical Progression
          </h2>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] max-w-2xl leading-relaxed">
            Organized conceptually by the engineering challenges and paradigms explored across
            different stages:
          </p>
        </div>
      </Reveal>

      <RevealGroup staggerDelay={0.06} baseDelay={0.08} className="space-y-3 sm:space-y-4">
        {JOURNEY_STAGES.map((stage) => {
          const badgeClasses = getStageBadgeClasses(stage.themeColor);
          const linkClasses = getStageLinkClasses(stage.themeColor);

          return (
            <div
              key={stage.id}
              className="p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-sm space-y-2 sm:space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-xs font-mono">
                <span className={`font-bold px-2 py-0.5 rounded border ${badgeClasses}`}>
                  {stage.stageBadge}
                </span>
                <span className="text-[hsl(var(--muted-foreground))] text-[11px] sm:text-xs">
                  {stage.category}
                </span>
              </div>

              <h3 className="text-sm min-[400px]:text-base sm:text-lg font-bold text-[hsl(var(--foreground))] leading-snug">
                {stage.title}
              </h3>

              <p className="text-xs sm:text-sm text-[hsl(var(--foreground))] leading-relaxed">
                {stage.description}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-[hsl(var(--muted-foreground))]">
                <span className="text-[hsl(var(--muted-foreground))]">Representative work:</span>
                {stage.links.map((link, idx) => (
                  <React.Fragment key={link.href}>
                    {idx > 0 && <span className="opacity-40">·</span>}
                    <Link
                      href={link.href}
                      className={`${linkClasses} hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded`}
                    >
                      {link.name}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </RevealGroup>
    </section>
  );
}
