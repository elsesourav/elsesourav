'use client';

import * as React from 'react';
import Link from 'next/link';
import { Section, Container, ScrollReveal, ScrollRevealGroup } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import type { AppListItem } from '@elsesourav/types';
import { ArrowRight, Image as ImageIcon, FileText, Code2, Lock } from 'lucide-react';

interface FeaturedAppsProps {
  readonly apps?: readonly AppListItem[];
}

interface ToolCardItem {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: React.ElementType;
  iconBoxClass: string;
  hoverText: string;
}

const MASTER_REFERENCE_TOOLS: ToolCardItem[] = [
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert, resize and optimize images easily and for free.',
    slug: 'image-converter',
    icon: ImageIcon,
    iconBoxClass:
      'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_16px_rgba(168,85,247,0.35)]',
    hoverText: 'group-hover:text-purple-300',
  },
  {
    id: 'text-tools',
    name: 'Text Tools',
    description: 'Format, analyze and transform your text instantly.',
    slug: 'text-tools',
    icon: FileText,
    iconBoxClass:
      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_16px_rgba(6,182,212,0.35)]',
    hoverText: 'group-hover:text-cyan-300',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate and beautify JSON with ease.',
    slug: 'json-formatter',
    icon: Code2,
    iconBoxClass:
      'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_16px_rgba(59,130,246,0.35)]',
    hoverText: 'group-hover:text-blue-300',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Create strong and secure passwords instantly.',
    slug: 'password-generator',
    icon: Lock,
    iconBoxClass:
      'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_16px_rgba(244,63,94,0.35)]',
    hoverText: 'group-hover:text-rose-300',
  },
];

export function FeaturedApps({ apps }: FeaturedAppsProps) {
  // If database contains published apps, find matches or merge with curated tools
  const displayTools = React.useMemo<ToolCardItem[]>(() => {
    if (!apps || apps.length === 0) {
      return MASTER_REFERENCE_TOOLS;
    }

    return MASTER_REFERENCE_TOOLS.map((defaultTool) => {
      const match = apps.find(
        (a) =>
          a.slug === defaultTool.slug ||
          a.name.toLowerCase().includes(defaultTool.name.toLowerCase())
      );
      if (match) {
        return {
          ...defaultTool,
          id: match.id,
          name: match.name,
          description: match.shortDescription || defaultTool.description,
          slug: match.slug,
        };
      }
      return defaultTool;
    });
  }, [apps]);

  return (
    <Section id="featured-apps" spacing="md" className="relative py-8 sm:py-10">
      <Container size="full" className="max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header matching master reference image */}
        <ScrollReveal direction="up" distance={12}>
          <div className="flex flex-row items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Featured Apps
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                Useful tools designed to solve real problems.
              </p>
            </div>

            <Link
              href={ROUTES.APPS}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group shrink-0"
            >
              <span>View All Apps</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* 4 Compact Tool Cards Grid matching master reference design */}
        <ScrollRevealGroup
          staggerDelay={0.06}
          direction="up"
          distance={14}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {displayTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={ROUTES.APP_DETAIL(tool.slug)}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#0c0d1b]/90 hover:bg-[#111226] border border-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[160px]"
              >
                <div className="space-y-3.5">
                  {/* Glowing Icon Square Box */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.iconBoxClass} group-hover:scale-105 transition-transform duration-200`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>

                  {/* Tool Title & Description */}
                  <div className="space-y-1">
                    <h3
                      className={`text-sm sm:text-base font-bold text-white ${tool.hoverText} transition-colors line-clamp-1`}
                    >
                      {tool.name}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Right Circular Arrow Button */}
                <div className="flex justify-end pt-3">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-200 group-hover:scale-105">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
