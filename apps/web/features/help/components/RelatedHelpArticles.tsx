import * as React from 'react';
import type { HelpArticleListItem } from '@elsesourav/types';
import { HelpArticleCard } from './HelpArticleCard';
import { Sparkles } from 'lucide-react';

interface RelatedHelpArticlesProps {
  articles: readonly HelpArticleListItem[];
}

export function RelatedHelpArticles({ articles }: RelatedHelpArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-6 pt-10 border-t border-zinc-800/80 max-w-4xl mx-auto"
      aria-labelledby="related-guides-heading"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h3 id="related-guides-heading" className="text-lg font-bold text-zinc-100">
          Related Guides in this Topic
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((art) => (
          <HelpArticleCard key={art.id} article={art} />
        ))}
      </div>
    </section>
  );
}
