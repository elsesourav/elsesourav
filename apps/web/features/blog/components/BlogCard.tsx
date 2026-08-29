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
      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700/80 transition-all backdrop-blur-sm ${
        isFeatured ? 'sm:col-span-2 lg:col-span-3 lg:flex-row' : ''
      }`}
    >
      {/* Cover Image Container */}
      <Link
        href={`/blog/${post.slug}`}
        className={`relative block overflow-hidden bg-zinc-950/80 shrink-0 ${
          isFeatured ? 'lg:w-1/2 aspect-[16/9] lg:aspect-auto' : 'aspect-[16/9] w-full'
        }`}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            sizes={
              isFeatured
                ? '(max-width: 1024px) 100vw, 50vw'
                : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            }
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 p-6 text-zinc-600">
            <BookOpen className="w-10 h-10 text-indigo-500/40 mb-2" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              ElseSourav Article
            </span>
          </div>
        )}

        {post.category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="info"
              className="text-[10px] px-2 py-0.5 shadow-md backdrop-blur-md bg-zinc-950/80"
            >
              {post.category.name}
            </Badge>
          </div>
        )}
      </Link>

      {/* Content Body */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2.5">
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>{publishedDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{post.readingTime} min read</span>
            </span>
          </div>

          {/* Title */}
          <Link
            href={`/blog/${post.slug}`}
            className="block group-hover:text-indigo-300 transition-colors"
          >
            <h3
              className={`font-bold text-zinc-100 line-clamp-2 tracking-tight ${
                isFeatured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
              }`}
            >
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          <p
            className={`text-xs text-zinc-400 leading-relaxed ${
              isFeatured ? 'line-clamp-3 sm:line-clamp-4' : 'line-clamp-2'
            }`}
          >
            {post.excerpt}
          </p>
        </div>

        {/* Footer: Author & Tags */}
        <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
              {post.author.displayName.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs text-zinc-300 truncate font-medium">
              {post.author.displayName}
            </span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Read Article</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
