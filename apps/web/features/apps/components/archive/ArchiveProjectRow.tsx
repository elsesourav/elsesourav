import * as React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@elsesourav/ui';
import { BookOpen } from 'lucide-react';
import type { AppListItem } from '@elsesourav/types';

interface ArchiveProjectRowProps {
  project: AppListItem;
  index: number;
}

export function ArchiveProjectRow({ project, index }: ArchiveProjectRowProps) {
  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <div className="p-2.5 sm:p-4 md:p-5 lg:p-6 hover:bg-zinc-900/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3 md:gap-4 group">
      <div className="flex items-start gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1 w-full">
        {/* Sequence index */}
        <span className="font-mono text-[10px] sm:text-xs text-zinc-500 font-semibold pt-0.5 shrink-0">
          {formattedIndex}
        </span>

        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              href={`/apps/${project.slug}`}
              className="font-bold text-xs sm:text-sm md:text-base text-zinc-100 group-hover:text-indigo-300 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {project.name}
            </Link>

            <Badge
              variant="secondary"
              size="sm"
              className="text-[9px] sm:text-[10px] md:text-xs font-mono px-1.5 sm:px-2 py-0 border-zinc-800/80 bg-zinc-800/60 sm:bg-zinc-800/80 text-zinc-400"
            >
              {project.primaryCategory}
            </Badge>

            {project.currentVersion && (
              <Badge
                variant="outline"
                size="sm"
                className="text-[8px] sm:text-[9px] md:text-[10px] font-mono px-1 sm:px-1.5 py-0 text-zinc-500 border-zinc-800/80"
              >
                v{project.currentVersion}
              </Badge>
            )}
          </div>

          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-400 leading-relaxed max-w-2xl line-clamp-2">
            {project.shortDescription}
          </p>
        </div>
      </div>

      {/* Action Links using Button component */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-0.5 sm:pt-1 md:pt-0">
        <Link href={`/apps/${project.slug}`}>
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<BookOpen className="w-3 h-3 text-indigo-400" />}
            className="h-6 sm:h-7 md:h-8 px-2 sm:px-2.5 md:px-3 text-[10px] sm:text-xs font-mono rounded-lg border-zinc-700/60 hover:border-indigo-500/50"
          >
            Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}
