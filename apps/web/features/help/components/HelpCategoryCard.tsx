import * as React from 'react';
import Link from 'next/link';
import { Card, Badge } from '@elsesourav/ui';
import type { HelpCategoryWithArticles } from '@elsesourav/types';
import { Folder, ChevronRight, FileText, ArrowRight } from 'lucide-react';

interface HelpCategoryCardProps {
  category: HelpCategoryWithArticles;
}

export function HelpCategoryCard({ category }: HelpCategoryCardProps) {
  const previewArticles = category.articles.slice(0, 3);
  const totalCount = category.articleCount ?? category.articles.length;

  return (
    <Card className="p-6 rounded-3xl border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:bg-[hsl(var(--surface-elevated))] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 ease-out active:scale-[0.99] active:translate-y-0 backdrop-blur-sm flex flex-col justify-between space-y-5">
      {/* Category Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Folder className="w-5 h-5" />
          </div>
          <Badge
            variant="info"
            className="text-[10px] px-2.5 py-0.5 bg-[hsl(var(--surface-subtle))] text-[hsl(var(--muted-foreground))]"
          >
            {totalCount} {totalCount === 1 ? 'Article' : 'Articles'}
          </Badge>
        </div>

        <div>
          <Link href={`/help/${category.slug}`} className="block group">
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
              <span>{category.name}</span>
              <ChevronRight className="w-4 h-4 text-[hsl(var(--subtle-foreground))] group-hover:translate-x-0.5 transition-transform" />
            </h2>
          </Link>
          {category.description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Article Previews List */}
      {previewArticles.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[hsl(var(--border-subtle))]">
          {previewArticles.map((art) => (
            <Link
              key={art.id}
              href={`/help/${category.slug}/${art.slug}`}
              className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))] hover:text-indigo-600 dark:hover:text-indigo-300 py-1 transition-colors group"
            >
              <FileText className="w-3.5 h-3.5 text-[hsl(var(--subtle-foreground))] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
              <span className="truncate">{art.title}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Link */}
      <div className="pt-2">
        <Link
          href={`/help/${category.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <span>View all articles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
