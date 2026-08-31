import * as React from 'react';
import Link from 'next/link';
import { Card, Badge } from '@elsesourav/ui';
import type { HelpArticleListItem } from '@elsesourav/types';
import { FileText, ArrowUpRight } from 'lucide-react';

interface HelpArticleCardProps {
  article: HelpArticleListItem;
}

export function HelpArticleCard({ article }: HelpArticleCardProps) {
  return (
    <Link href={`/help/${article.categorySlug}/${article.slug}`} className="block group">
      <Card className="p-5 rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 ease-out active:scale-[0.99] active:translate-y-0 backdrop-blur-sm h-full flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="info" className="text-[10px] px-2 py-0.5">
              {article.categoryName}
            </Badge>
            <ArrowUpRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <h3 className="font-semibold text-[hsl(var(--foreground))] text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
              {article.title}
            </h3>
          </div>

          {article.excerpt && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed pl-6">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-[hsl(var(--border-subtle))] flex items-center justify-end text-[11px] text-[hsl(var(--muted-foreground))]">
          <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">
            Read Guide →
          </span>
        </div>
      </Card>
    </Link>
  );
}
