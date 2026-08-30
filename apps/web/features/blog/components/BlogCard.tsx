import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from '@elsesourav/ui';
import { getBlogCoverUrl } from '@elsesourav/media';
import type { BlogPostListItem } from '@elsesourav/types';
import { BookOpen, Clock, Calendar, ArrowUpRight, User } from 'lucide-react';

interface BlogCardProps {
  post: BlogPostListItem;
  isFeatured?: boolean;
}

export function BlogCard({ post, isFeatured = false }: BlogCardProps) {
  const coverUrl = post.coverImageUrl ? getBlogCoverUrl(post.coverImageUrl, 800, 450) : null;
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <Card
      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 ease-out active:scale-[0.99] active:translate-y-0 backdrop-blur-sm ${
        isFeatured && coverUrl ? 'sm:col-span-2 lg:col-span-3 lg:flex-row' : ''
      }`}
    >
      {/* Cover Image Container (Only if real cover image exists) */}
      {coverUrl && (
        <Link
          href={`/notes/${post.slug}`}
          className={`relative block overflow-hidden bg-[hsl(var(--surface-subtle))] shrink-0 ${
            isFeatured ? 'lg:w-1/2 aspect-[16/9] lg:aspect-auto' : 'aspect-[16/9] w-full'
          }`}
        >
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            sizes={
              isFeatured
                ? '(max-width: 1024px) 100vw, 50vw'
                : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            }
            className="object-cover group-hover:scale-[1.025] transition-transform duration-500 ease-out"
          />

          {post.category && (
            <div className="absolute top-3 left-3 z-10">
              <Badge
                variant="info"
                className="text-[10px] px-2 py-0.5 shadow-md backdrop-blur-md bg-[hsl(var(--surface-overlay))]/90 text-[hsl(var(--foreground))]"
              >
                {post.category.name}
              </Badge>
            </div>
          )}
        </Link>
      )}

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2.5">
          {/* Top Row: Category (if no cover) & Metadata */}
          <div className="flex items-center justify-between gap-2">
            {!coverUrl && post.category && (
              <Badge
                variant="info"
                className="text-[10px] px-2 py-0.5 bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border-subtle))]"
              >
                {post.category.name}
              </Badge>
            )}
            <div className="flex items-center gap-3 text-[11px] text-[hsl(var(--muted-foreground))] ml-auto">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[hsl(var(--subtle-foreground))]" />
                <span>{publishedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[hsl(var(--subtle-foreground))]" />
                <span>{post.readingTime} min read</span>
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            href={`/notes/${post.slug}`}
            className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors"
          >
            <h3
              className={`font-bold text-[hsl(var(--foreground))] line-clamp-2 tracking-tight ${
                isFeatured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
              }`}
            >
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p
            className={`text-xs text-[hsl(var(--muted-foreground))] leading-relaxed ${
              isFeatured ? 'line-clamp-3 sm:line-clamp-4' : 'line-clamp-2'
            }`}
          >
            {post.excerpt}
          </p>
        </div>

        {/* Footer: Author & Read Action */}
        <div className="pt-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--foreground))] shrink-0">
              {post.author.displayName.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs text-[hsl(var(--foreground))] truncate font-medium">
              {post.author.displayName}
            </span>
          </div>

          <Link
            href={`/notes/${post.slug}`}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Read Note</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
