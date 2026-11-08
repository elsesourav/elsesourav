'use client';

import * as React from 'react';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface AppDetailDescriptionProps {
  description: string;
  documentationMd?: string | null;
}

export function AppDetailDescription({ description, documentationMd }: AppDetailDescriptionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isDocOpen, setIsDocOpen] = React.useState(false);

  // If description is short, no need for more toggle
  const isLong = description.length > 350;

  return (
    <section aria-label="About this application" className="space-y-4 pt-2">
      <div className="relative">
        <div
          className={`text-sm sm:text-base leading-relaxed text-[hsl(var(--foreground))]/90 transition-all ${
            !isExpanded && isLong ? 'line-clamp-4' : ''
          }`}
        >
          <p className="whitespace-pre-line">{description}</p>
        </div>

        {isLong && !isExpanded && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
            >
              more
            </button>
          </div>
        )}

        {isLong && isExpanded && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
            >
              less
            </button>
          </div>
        )}
      </div>

      {/* Expandable Technical Documentation if present */}
      {documentationMd && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsDocOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer py-2 border-t border-[hsl(var(--border-subtle))] w-full justify-between"
            aria-expanded={isDocOpen}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Technical Architecture & Implementation Details</span>
            </span>
            {isDocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isDocOpen && (
            <div className="pt-2 animate-in fade-in duration-200">
              <BlogContentRenderer content={documentationMd} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
