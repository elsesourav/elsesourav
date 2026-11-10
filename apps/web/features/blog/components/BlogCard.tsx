import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from '@elsesourav/ui';
import { getBlogCoverUrl } from '@elsesourav/media';
import type { BlogPostListItem } from '@elsesourav/types';
import { Clock, Calendar, ArrowUpRight } from 'lucide-react';

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
      className={`group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-colors duration-200 backdrop-blur-sm p-0 ${
        isFeatured && coverUrl ? 'sm:col-span-2 lg:col-span-3 lg:flex-row' : ''
      }`}
    >
      {/* Cover Image Container (Only if real cover image exists) */}
      {coverUrl && (
        <Link
          href={`/updates/${post.slug}`}
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
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {post.category && (
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
              <Badge
                variant="info"
                className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 shadow-md backdrop-blur-md bg-[hsl(var(--surface-overlay))]/90 text-[hsl(var(--foreground))]"
              >
                {post.category.name}
              </Badge>
            </div>
          )}
        </Link>
      )}

      {/* Content Body */}
      <div className="p-2.5 sm:p-3.5 md:p-4.5 flex flex-col justify-between flex-1 space-y-2.5 sm:space-y-3.5">
        <div className="space-y-2 sm:space-y-2.5">
          {/* Top Row: Category (if no cover) & Metadata */}
          <div className="flex items-center justify-between gap-2">
            {!coverUrl && post.category && (
              <Badge
                variant="info"
                className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border-subtle))]"
              >
                {post.category.name}
              </Badge>
            )}
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-[hsl(var(--muted-foreground))] ml-auto">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--subtle-foreground))]" />
                <span>{publishedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--subtle-foreground))]" />
                <span>{post.readingTime} min read</span>
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            href={`/updates/${post.slug}`}
            className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors"
          >
            <h3
              className={`font-bold text-[hsl(var(--foreground))] tracking-tight leading-snug ${
                isFeatured
                  ? 'text-base sm:text-lg md:text-xl lg:text-2xl line-clamp-3'
                  : 'text-sm sm:text-base md:text-lg line-clamp-3'
              }`}
            >
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p
            className={`text-xs text-[hsl(var(--muted-foreground))] leading-relaxed ${
              isFeatured ? 'line-clamp-2 sm:line-clamp-3 md:line-clamp-4' : 'line-clamp-2'
            }`}
          >
            {post.excerpt}
          </p>
        </div>

        {/* Footer: Author or Date & Read Action */}
        <div className="pt-2 sm:pt-2.5 md:pt-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-between gap-2 sm:gap-3 text-xs">
          {post.authorName && post.authorName.trim() ? (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {post.authorImageUrl ? (
                <img
                  src={post.authorImageUrl}
                  alt={post.authorName}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-[hsl(var(--border))] shrink-0"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[hsl(var(--foreground))] shrink-0">
                  {post.authorName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] sm:text-xs text-[hsl(var(--foreground))] truncate font-medium">
                {post.authorName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] font-medium truncate">
              <span className="truncate">{publishedDate}</span>
              <span className="select-none">•</span>
              <span>{post.readingTime} min read</span>
            </div>
          )}

          <Link
            href={`/updates/${post.slug}`}
            className="flex items-center gap-1 text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Read Update</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
