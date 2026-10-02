'use client';

import * as React from 'react';
import Link from 'next/link';
import { Section, Container, ScrollReveal, ScrollRevealGroup } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import type { BlogPostListItem } from '@elsesourav/types';
import { ArrowRight } from 'lucide-react';

interface LatestUpdatesProps {
  readonly posts?: readonly BlogPostListItem[];
}

interface UpdateCardItem {
  id: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  slug: string;
  coverImageUrl?: string;
  bannerGradient: string;
  waveSvg: React.ReactNode;
}

// Procedural SVG Wave graphic elements mimicking the reference artwork
function WaveBlue() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M0,80 C120,130 220,30 400,90 L400,160 L0,160 Z"
        fill="url(#waveGradBlue)"
        opacity="0.6"
      />
      <path d="M0,110 C140,50 260,140 400,70 L400,160 L0,160 Z" fill="#1e1b4b" opacity="0.8" />
      <circle cx="280" cy="50" r="70" fill="#60a5fa" opacity="0.25" filter="blur(20px)" />
    </svg>
  );
}

function WavePurple() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#d946ef" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M0,70 C130,20 240,120 400,60 L400,160 L0,160 Z"
        fill="url(#waveGradPurple)"
        opacity="0.6"
      />
      <path d="M0,100 C150,130 270,40 400,100 L400,160 L0,160 Z" fill="#2e1065" opacity="0.8" />
      <circle cx="160" cy="60" r="75" fill="#f43f5e" opacity="0.22" filter="blur(20px)" />
    </svg>
  );
}

function WaveCyan() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M0,90 C110,40 230,130 400,50 L400,160 L0,160 Z"
        fill="url(#waveGradCyan)"
        opacity="0.6"
      />
      <path d="M0,120 C130,70 280,140 400,90 L400,160 L0,160 Z" fill="#082f49" opacity="0.8" />
      <circle cx="300" cy="40" r="80" fill="#38bdf8" opacity="0.30" filter="blur(25px)" />
    </svg>
  );
}

const MASTER_REFERENCE_UPDATES: UpdateCardItem[] = [
  {
    id: 'post-1',
    category: 'Product Update',
    title: 'Building Better Web Apps with Modern Tools',
    date: 'Dec 10, 2024',
    readTime: '5 min read',
    slug: 'building-better-web-apps-with-modern-tools',
    bannerGradient: 'from-[#0b0f2a] via-[#151945] to-[#251f5c]',
    waveSvg: <WaveBlue />,
  },
  {
    id: 'post-2',
    category: 'Development',
    title: 'The Power of Simple and Clean Design',
    date: 'Dec 5, 2024',
    readTime: '4 min read',
    slug: 'the-power-of-simple-and-clean-design',
    bannerGradient: 'from-[#190c2e] via-[#321354] to-[#451052]',
    waveSvg: <WavePurple />,
  },
  {
    id: 'post-3',
    category: 'Behind the Build',
    title: 'My Development Setup for 2024',
    date: 'Dec 1, 2024',
    readTime: '6 min read',
    slug: 'my-development-setup-for-2024',
    bannerGradient: 'from-[#041426] via-[#092644] to-[#0c395c]',
    waveSvg: <WaveCyan />,
  },
];

export function LatestUpdates(_props: LatestUpdatesProps) {
  // Master reference design displays 3 curated wave banner cards matching reference mockup 1:1
  const displayItems = MASTER_REFERENCE_UPDATES;

  return (
    <Section id="latest-updates" spacing="md" className="relative py-8 sm:py-10">
      <Container size="full" className="max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header matching master reference image */}
        <ScrollReveal direction="up" distance={12}>
          <div className="flex flex-row items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Latest Updates
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                The latest news, releases and thoughts from my journey.
              </p>
            </div>

            <Link
              href={ROUTES.BLOG}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group shrink-0"
            >
              <span>View All Updates</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* 3-Column Visual Update Cards Grid matching master reference design */}
        <ScrollRevealGroup
          staggerDelay={0.07}
          direction="up"
          distance={14}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {displayItems.map((item) => {
            return (
              <Link
                key={item.id}
                href={ROUTES.BLOG_POST(item.slug)}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#0c0d1b]/90 hover:bg-[#111226] border border-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div>
                  {/* Aspect Ratio Header with Smooth Wave Gradient Banner & Category Pill */}
                  <div
                    className={`relative h-32 sm:h-36 w-full overflow-hidden bg-gradient-to-tr ${item.bannerGradient} border-b border-white/8 flex items-end p-3.5 sm:p-4`}
                  >
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      item.waveSvg
                    )}

                    {/* Category Pill Tag (Bottom-Left on banner) */}
                    <div className="relative z-10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 border border-white/20 text-white backdrop-blur-md shadow-sm">
                      {item.category}
                    </div>
                  </div>

                  {/* Body Content: Title & Date + Read Time */}
                  <div className="p-4 sm:p-5 space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {item.date} · {item.readTime}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </ScrollRevealGroup>
      </Container>
    </Section>
  );
}
