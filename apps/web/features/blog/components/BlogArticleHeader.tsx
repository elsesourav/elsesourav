'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, UserAvatar } from '@elsesourav/ui';
import { Lightbox } from '@elsesourav/ui/interior';
import { getBlogCoverUrl } from '@elsesourav/media';
import type { PublicBlogPost } from '@elsesourav/types';
import { BlogShareButtons } from './BlogShareButtons';
import { ArrowLeft, Calendar, Clock, Eye, Sparkles, Maximize2 } from 'lucide-react';

interface BlogArticleHeaderProps {
  post: PublicBlogPost;
  postUrl: string;
}

export function BlogArticleHeader({ post, postUrl }: BlogArticleHeaderProps) {
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const coverRef = React.useRef<HTMLDivElement>(null);
  const coverUrl = post.coverImageUrl ? getBlogCoverUrl(post.coverImageUrl, 1200, 630) : null;
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <header className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/notes"
        className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors group font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Notes</span>
      </Link>

      {/* Category Pill */}
      {post.category && (
        <div>
          <Link href={`/notes?category=${post.category.slug}`}>
            <Badge
              variant="info"
              className="text-xs px-2.5 py-0.5 hover:opacity-80 transition-colors"
            >
              {post.category.name}
            </Badge>
          </Link>
        </div>
      )}

      {/* Main Title */}
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--foreground))] tracking-tight leading-tight">
        {post.title}
      </h1>

      {/* Excerpt Lead */}
      {post.excerpt && (
        <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-3xl">
          {post.excerpt}
        </p>
      )}

      {/* Author and Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-4 border-y border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={post.author.photoUrl}
            name={post.author.displayName}
            identifier={post.author.username || post.author.displayName}
            alt={post.author.displayName}
            size="md"
          />
          <div>
            <div className="font-semibold text-xs text-[hsl(var(--foreground))]">
              {post.author.displayName}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[hsl(var(--subtle-foreground))]" />
                <span>{publishedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[hsl(var(--subtle-foreground))]" />
                <span>{post.readingTime} min read</span>
              </span>
              {post.viewsCount > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[hsl(var(--subtle-foreground))]" />
                    <span>{post.viewsCount} views</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content-Aware Share Action */}
        <BlogShareButtons title={post.title} url={postUrl} excerpt={post.excerpt} />
      </div>

      {/* Cover Image */}
      {coverUrl && (
        <div
          ref={coverRef}
          onClick={() => setIsLightboxOpen(true)}
          className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] shadow-2xl group cursor-zoom-in"
          title="Click to view cover in Lightbox"
        >
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            aria-label="View cover image in Lightbox"
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 hover:bg-black/85 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95 shadow-lg flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Lightbox</span>
          </button>
        </div>
      )}

      {coverUrl && (
        <Lightbox
          open={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          src={coverUrl}
          alt={post.title}
          caption={post.title}
          originRef={coverRef}
        />
      )}
    </header>
  );
}
