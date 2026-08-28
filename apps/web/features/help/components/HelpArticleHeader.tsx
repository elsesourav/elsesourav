import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@elsesourav/ui';
import type { PublicHelpArticle } from '@elsesourav/types';
import { ChevronRight, Calendar, User, BookOpen } from 'lucide-react';

interface HelpArticleHeaderProps {
  article: PublicHelpArticle;
  categorySlug: string;
}

export function HelpArticleHeader({ article, categorySlug }: HelpArticleHeaderProps) {
  const updatedDate = new Date(article.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
        <Link href="/help" className="hover:text-white transition-colors shrink-0">
          Help Center
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <Link href={`/help/${categorySlug}`} className="hover:text-white transition-colors shrink-0">
          {article.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <span className="text-zinc-200 font-medium truncate">{article.title}</span>
      </nav>

      {/* Category Pill */}
      <div>
        <Link href={`/help/${categorySlug}`}>
          <Badge variant="info" className="text-xs px-2.5 py-0.5 hover:bg-indigo-900/60 transition-colors">
            {article.category.name}
          </Badge>
        </Link>
      </div>

      {/* Article Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
        {article.title}
      </h1>

      {/* Excerpt Lead */}
      {article.excerpt && (
        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
          {article.excerpt}
        </p>
      )}

      {/* Metadata Bar */}
      <div className="flex items-center gap-4 text-xs text-zinc-400 pt-3 pb-3 border-y border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>Last updated {updatedDate}</span>
        </div>

        {article.author && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>{article.author.displayName}</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
