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
      <Card className="p-5 rounded-2xl border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700/80 transition-all backdrop-blur-sm h-full flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="info" className="text-[10px] px-2 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-500/20">
              {article.categoryName}
            </Badge>
            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <FileText className="w-4 h-4 text-indigo-400/80 shrink-0 mt-0.5" />
            <h3 className="font-semibold text-zinc-100 text-sm sm:text-base group-hover:text-indigo-300 transition-colors line-clamp-2">
              {article.title}
            </h3>
          </div>

          {article.excerpt && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed pl-6">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-800/50 flex items-center justify-end text-[11px] text-zinc-500">
          <span className="text-indigo-400 font-medium group-hover:underline">Read Guide →</span>
        </div>
      </Card>
    </Link>
  );
}
