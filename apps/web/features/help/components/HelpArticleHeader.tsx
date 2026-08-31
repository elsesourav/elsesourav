import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@elsesourav/ui';
import type { PublicHelpArticle } from '@elsesourav/types';
import { ChevronRight, Calendar, User } from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';

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
      <nav
        className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] overflow-x-auto no-scrollbar"
        aria-label="Breadcrumb"
      >
        <Link
          href="/help"
          className="hover:text-[hsl(var(--foreground))] transition-colors shrink-0"
        >
          Help Center
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--subtle-foreground))] shrink-0" />
        <Link
          href={`/help/${categorySlug}`}
          className="hover:text-[hsl(var(--foreground))] transition-colors shrink-0"
        >
          {article.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--subtle-foreground))] shrink-0" />
        <span className="text-[hsl(var(--foreground))] font-medium truncate">{article.title}</span>
      </nav>

      {/* Category Pill */}
      <div>
        <Link href={`/help/${categorySlug}`}>
          <Badge variant="info" className="text-xs px-2.5 py-0.5">
            {article.category.name}
          </Badge>
        </Link>
      </div>

      {/* Article Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight leading-tight">
        {article.title}
      </h1>

      {/* Excerpt Lead */}
      {article.excerpt && (
        <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-3xl">
          {article.excerpt}
        </p>
      )}

      {/* Metadata & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[hsl(var(--muted-foreground))] pt-3 pb-3 border-y border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[hsl(var(--subtle-foreground))]" />
            <span>Last updated {updatedDate}</span>
          </div>

          {article.author && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[hsl(var(--subtle-foreground))]" />
                <span>{article.author.displayName}</span>
              </div>
            </>
          )}
        </div>

        <ShareButton
          title={article.title}
          text={article.excerpt}
          canonicalPathOrUrl={`/help/${categorySlug}/${article.slug}`}
          size="sm"
          label="Share Guide"
          className="h-8 px-3 text-xs border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))]"
        />
      </div>
    </header>
  );
}
