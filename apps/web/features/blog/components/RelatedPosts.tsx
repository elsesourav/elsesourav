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
    <section className="space-y-6 pt-12 border-t border-zinc-800/80 max-w-4xl mx-auto" aria-labelledby="related-articles-heading">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h2 id="related-articles-heading" className="text-xl font-bold text-zinc-100">
          Related Articles
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
