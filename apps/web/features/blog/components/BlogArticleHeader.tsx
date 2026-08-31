import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, UserAvatar } from '@elsesourav/ui';
import { getBlogCoverUrl } from '@elsesourav/media';
import type { PublicBlogPost } from '@elsesourav/types';
import { BlogShareButtons } from './BlogShareButtons';
import { ArrowLeft, Calendar, Clock, Eye, Sparkles } from 'lucide-react';

interface BlogArticleHeaderProps {
  post: PublicBlogPost;
  postUrl: string;
}

export function BlogArticleHeader({ post, postUrl }: BlogArticleHeaderProps) {
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
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] shadow-2xl">
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      )}
    </header>
  );
}
