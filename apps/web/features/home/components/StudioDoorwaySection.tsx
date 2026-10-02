'use client';

import * as React from 'react';
import Link from 'next/link';
import { Section, Container, Reveal } from '@elsesourav/ui';
import { TextReveal } from '@elsesourav/ui/interior';
import { ROUTES } from '@elsesourav/config';
import { Layers, BookOpen, User, ArrowRight, Sparkles, LifeBuoy } from 'lucide-react';

interface StudioDoorwaySectionProps {
  closingTitle?: string | null;
  closingSubtitle?: string | null;
}

export function StudioDoorwaySection({ closingTitle, closingSubtitle }: StudioDoorwaySectionProps) {
  return (
    <Section
      id="studio-doorway"
      spacing="lg"
      surface="subtle"
      className="border-t border-[hsl(var(--border))]/80"
    >
      <Container size="lg">
        <Reveal direction="up" distance={14}>
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--surface-subtle))] p-8 sm:p-12 text-center space-y-8 backdrop-blur-md shadow-xl">
            {/* Header cluster */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-700 dark:text-indigo-300 font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Studio Doorway</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
                <TextReveal
                  text={closingTitle || 'Explore the ElseSourav Studio'}
                  by="word"
                  stagger={0.06}
                  className="font-extrabold text-[hsl(var(--foreground))]"
                />
              </h2>
              <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
                <TextReveal
                  text={
                    closingSubtitle ||
                    'Every application, utility, and field note is built independently with a focus on craft, performance, and usability.'
                  }
                  by="word"
                  stagger={0.03}
                  delay={0.15}
                  className="text-[hsl(var(--muted-foreground))]"
                />
              </p>
            </div>

            {/* 3 Focused Core Pathways Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto items-stretch">
              <Link
                href={ROUTES.APPS}
                className="p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left space-y-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-200">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    Explore Apps
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                    Browse full collection of software, utilities, and developer tools.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Open catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                href={ROUTES.BLOG}
                className="p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left space-y-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform duration-200">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    Read Updates
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                    Technical write-ups, architecture breakdowns, and learnings.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-cyan-600 dark:text-cyan-400 gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Browse articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                href={ROUTES.ABOUT}
                className="p-5 sm:p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left space-y-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform duration-200">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[hsl(var(--foreground))] group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    About Me
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                    Background, engineering evolution, and studio principles.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>View profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>

            <div className="pt-4 text-xs text-[hsl(var(--muted-foreground))] flex items-center justify-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-indigo-500" />
              <span>Have a question or feedback?</span>
              <Link
                href={ROUTES.SUPPORT}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                Reach out via Support Desk
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
