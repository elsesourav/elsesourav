'use client';

import * as React from 'react';
import { Section, Container, ScrollReveal, ScrollRevealGroup } from '@elsesourav/ui';
import { ShieldCheck, Cpu, Layers, Zap, Sparkles } from 'lucide-react';

interface FeatureItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tag: string;
  readonly icon: React.ElementType;
  readonly gradientBorder: string;
  readonly iconColor: string;
  readonly iconBg: string;
}

const REAL_FEATURES: readonly FeatureItem[] = [
  {
    id: 'local-first',
    title: 'Private In-Browser Processing',
    description:
      'Utilities like image converters and data formatters execute in your local browser sandbox with zero remote file uploads.',
    tag: 'Local-First',
    icon: ShieldCheck,
    gradientBorder: 'group-hover:border-cyan-500/40',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/25',
  },
  {
    id: 'wasm-speed',
    title: 'WASM Performance Engines',
    description:
      'Computationally intensive algorithms and neural network visualizers compiled from C++ to WebAssembly for near-native throughput.',
    tag: 'WebAssembly',
    icon: Cpu,
    gradientBorder: 'group-hover:border-indigo-500/40',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/25',
  },
  {
    id: 'open-arch',
    title: 'Transparent Engineering',
    description:
      'Comprehensive system breakdowns, hardware circuit schematics, and open-source repositories accompanying each project.',
    tag: 'Open Source',
    icon: Layers,
    gradientBorder: 'group-hover:border-purple-500/40',
    iconColor: 'text-purple-500 dark:text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/25',
  },
  {
    id: 'focus-dx',
    title: 'Zero Ads & Command Palette',
    description:
      'Distraction-free, keyboard-first navigation with global ⌘K search, responsive layouts, and dark and light mode fidelity.',
    tag: 'Keyboard-First',
    icon: Zap,
    gradientBorder: 'group-hover:border-amber-500/40',
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/25',
  },
];

export function FeatureHighlights() {
  return (
    <Section
      id="features"
      spacing="md"
      className="relative py-10 sm:py-14 border-t border-[hsl(var(--border))]/70"
    >
      <Container size="lg">
        {/* Compact Header */}
        <ScrollReveal direction="up" distance={12}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-[11px] font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-2.5">
                <Sparkles className="w-3 h-3" />
                <span>Studio Capabilities</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[hsl(var(--foreground))]">
                Engineered for Practical Utility
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] max-w-md sm:text-right">
              Direct tools and transparent software experiments created without paywalls or
              artificial complexity.
            </p>
          </div>
        </ScrollReveal>

        {/* 4-Card Responsive Compact Grid */}
        <ScrollRevealGroup
          staggerDelay={0.07}
          direction="up"
          distance={14}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {REAL_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--card))]/60 hover:bg-[hsl(var(--card))] ${feat.gradientBorder} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 backdrop-blur-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${feat.iconBg} ${feat.iconColor} group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] text-[hsl(var(--muted-foreground))]">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[hsl(var(--foreground))] mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </ScrollRevealGroup>
      </Container>
    </Section>
  );
}
