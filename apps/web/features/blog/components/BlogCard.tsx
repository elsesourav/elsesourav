'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge, cn } from '@elsesourav/ui';
import { getBlogCoverUrl } from '@elsesourav/media';
import type { BlogPostListItem } from '@elsesourav/types';
import { Clock, Calendar, ArrowUpRight } from 'lucide-react';

interface BlogCardProps {
  post: BlogPostListItem;
  isFeatured?: boolean;
}

export function BlogCard({ post, isFeatured = false }: BlogCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const coverUrl = post.coverImageUrl
    ? getBlogCoverUrl(post.coverImageUrl, isFeatured ? 1600 : 1200, isFeatured ? 900 : 675, 'limit')
    : null;
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <Card
      className={cn(
        'group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--surface-elevated))] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 backdrop-blur-sm p-0',
        isFeatured && coverUrl ? 'sm:col-span-2 lg:col-span-3 md:flex-row' : ''
      )}
    >
      {/* 16:9 Fitted Cover Image Container (Theme-adaptive bg & loading color) */}
      {coverUrl && (
        <Link
          href={`/updates/${post.slug}`}
          className={cn(
            'relative block overflow-hidden bg-zinc-100 dark:bg-zinc-900/90 shrink-0 select-none aspect-[16/9]',
            isFeatured
              ? 'w-full md:w-1/2 border-b md:border-b-0 md:border-r border-[hsl(var(--border-subtle))]'
              : 'w-full border-b border-[hsl(var(--border-subtle))]'
          )}
        >
          {/* Skeleton loading shimmer — Theme-adaptive light/dark colors */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0 skeleton-shimmer bg-zinc-200/90 dark:bg-zinc-800/90 z-[1] transition-opacity duration-300 pointer-events-none',
              imageLoaded ? 'opacity-0' : 'opacity-100'
            )}
          />

          {/* Ambient blurred glow (Dark mode only for rich depth; hidden in Light mode for pure clean background) */}
          <Image
            src={coverUrl}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            className="pointer-events-none object-cover blur-2xl opacity-0 dark:opacity-30 scale-110"
          />

          {/* Artwork — Contained, uncropped, zero letterboxing on 16:9, theme-matched background on non-16:9 */}
          <div className="relative w-full h-full flex items-center justify-center z-[2]">
            <Image
              src={coverUrl}
              alt={post.title}
              fill
              sizes={
                isFeatured
                  ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw'
                  : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              }
              onLoad={() => setImageLoaded(true)}
              className={cn(
                'pointer-events-none object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          </div>
        </Link>
      )}

      {/* Content Body — Compact, even padding and clean typographic hierarchy */}
      <div
        className={cn(
          'flex flex-col justify-between flex-1 min-w-0',
          isFeatured ? 'p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4' : 'p-3.5 sm:p-4 space-y-2.5 sm:space-y-3'
        )}
      >
        <div className="space-y-2 sm:space-y-2.5">
          {/* Top Row: Category & Metadata */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {post.category && (
              <Badge
                variant="info"
                className="text-[9px] sm:text-[10px] px-2 py-0.5 font-medium bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
              >
                {post.category.name}
              </Badge>
            )}
            <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] text-[hsl(var(--muted-foreground))] ml-auto font-mono">
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
            className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          >
            <h3
              className={cn(
                'font-bold text-[hsl(var(--foreground))] tracking-tight leading-snug',
                isFeatured
                  ? 'text-base sm:text-lg md:text-xl lg:text-2xl line-clamp-2 sm:line-clamp-3'
                  : 'text-sm sm:text-base font-semibold line-clamp-2'
              )}
            >
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p
            className={cn(
              'text-xs sm:text-sm text-[hsl(var(--muted-foreground))] leading-relaxed',
              isFeatured ? 'line-clamp-2 sm:line-clamp-3' : 'line-clamp-2'
            )}
          >
            {post.excerpt}
          </p>
        </div>

        {/* Footer: Author or Type indicator & Read Action */}
        <div className="pt-2.5 sm:pt-3 border-t border-[hsl(var(--border-subtle))] flex items-center justify-between gap-2 sm:gap-3 text-xs">
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
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
              <span>Article</span>
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
