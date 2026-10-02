'use client';

import * as React from 'react';
import Link from 'next/link';
import { Container, Reveal } from '@elsesourav/ui';
import { TextReveal } from '@elsesourav/ui/interior';
import { ROUTES } from '@elsesourav/config';
import {
  ArrowRight,
  HeartHandshake,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PhilosophySectionProps {
  creator: {
    name: string;
    title: string;
    avatarUrl?: string | null;
    statement?: string | null;
    shortBio?: string | null;
    positioning?: string | null;
    principles?: readonly string[];
  };
}

interface PrincipleItem {
  id: string;
  num: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  borderColor: string;
}

const PRINCIPLES: PrincipleItem[] = [
  {
    id: 'craft',
    num: '01',
    title: 'Obsessive Craft',
    tagline: 'Designed and engineered solo with care for every interaction.',
    icon: Sparkles,
    iconColor: 'text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/25',
    borderColor: 'hover:border-violet-500/40',
  },
  {
    id: 'privacy',
    num: '02',
    title: 'Privacy by Default',
    tagline: 'Zero telemetry spyware, zero ads, and zero dark patterns.',
    icon: ShieldCheck,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/25',
    borderColor: 'hover:border-emerald-500/40',
  },
  {
    id: 'performance',
    num: '03',
    title: 'Built for Speed',
    tagline: 'Lightweight, snappy response, and minimal resource usage.',
    icon: Zap,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/25',
    borderColor: 'hover:border-amber-500/40',
  },
  {
    id: 'utility',
    num: '04',
    title: 'Real Utility',
    tagline: 'Practical tools and games created to solve real daily needs.',
    icon: Layers,
    iconColor: 'text-sky-500 dark:text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/25',
    borderColor: 'hover:border-sky-500/40',
  },
  {
    id: 'support',
    num: '05',
    title: 'Direct Access',
    tagline: 'Talk directly with the builder—feedback is read and valued.',
    icon: HeartHandshake,
    iconColor: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/25',
    borderColor: 'hover:border-rose-500/40',
  },
  {
    id: 'evolution',
    num: '06',
    title: 'Enduring Quality',
    tagline: 'Actively maintained with modern web standards and care.',
    icon: RefreshCw,
    iconColor: 'text-fuchsia-500 dark:text-fuchsia-400',
    iconBg: 'bg-fuchsia-500/10 border-fuchsia-500/25',
    borderColor: 'hover:border-fuchsia-500/40',
  },
];

export function PhilosophySection({ creator }: PhilosophySectionProps) {
  const creatorName = creator.name || 'Sourav';
  const creatorTitle = creator.title || 'Software Engineer & Creator';

  return (
    <section
      id="philosophy"
      className="relative isolate overflow-hidden py-14 sm:py-20 lg:py-24 transition-colors duration-500 bg-[#f8fafc] dark:bg-[#07090e]"
    >
      {/* ── 1. Top Edge Horizon Beam ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/30 to-transparent pointer-events-none"
      />

      {/* ── 2. Ambient Gradient Auroras (Zero Canvas, Pure CSS) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10"
      >
        <div className="absolute -top-24 right-1/4 w-[480px] sm:w-[600px] h-[260px] bg-gradient-to-b from-indigo-500/10 via-violet-500/6 to-transparent blur-3xl rounded-full dark:opacity-70 opacity-40" />
        <div className="absolute -bottom-16 -left-16 w-[360px] sm:w-[460px] h-[360px] bg-gradient-to-tr from-sky-500/8 via-indigo-500/4 to-transparent blur-[80px] rounded-full dark:opacity-60 opacity-30" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_50%,transparent_100%)] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(currentColor 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <Container size="full" className="max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <Reveal direction="up" distance={16}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Creator Identity & Philosophy Statement */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
              {/* Studio Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Craft & Principles</span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-snug">
                <TextReveal
                  text="I care about software that is useful, fast, and considerate."
                  by="word"
                  stagger={0.06}
                  className="font-extrabold"
                />
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed max-w-lg">
                <TextReveal
                  text="Independent creator building practical software, developer tools, and thoughtful web experiences with strong engineering fundamentals."
                  by="word"
                  stagger={0.03}
                  delay={0.2}
                  className="text-[hsl(var(--muted-foreground))]"
                />
              </p>

              {/* Creator Compact Badge */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 overflow-hidden shrink-0 shadow-inner">
                  {creator.avatarUrl ? (
                    <img
                      src={creator.avatarUrl}
                      alt={creatorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                  <span
                    title="Active Builder"
                    className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[hsl(var(--card))]"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                    {creatorName}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {creatorTitle}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={ROUTES.ABOUT}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] hover:border-indigo-500/40 active:scale-95 transition-all shadow-sm group"
                >
                  <span>About the journey</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: 6 Concise, Clean Principle Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PRINCIPLES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`group p-4 sm:p-5 rounded-xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--card))]/70 dark:bg-[hsl(var(--card))]/50 hover:bg-[hsl(var(--surface-elevated))] ${item.borderColor} hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between shadow-sm`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform duration-200`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))] font-semibold">
                          {item.num}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[hsl(var(--foreground))] group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                        {item.tagline}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
