import * as React from 'react';
import type { BlogPostListItem } from '@elsesourav/types';
import { BlogCard } from './BlogCard';
import { Sparkles } from 'lucide-react';

interface RelatedPostsProps {
  posts: readonly BlogPostListItem[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-6 pt-12 border-t border-[hsl(var(--border-subtle))] max-w-4xl mx-auto"
      aria-labelledby="related-articles-heading"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--border-subtle))]">
        <h2
          id="related-articles-heading"
          className="text-xs font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold"
        >
          Further Reading & Related Notes
        </h2>
        <span className="text-xs font-mono text-[hsl(var(--subtle-foreground))]">
          {posts.length} {posts.length === 1 ? 'Note' : 'Notes'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
