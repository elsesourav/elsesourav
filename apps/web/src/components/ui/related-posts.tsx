"use client";

import { formatDateTime } from "@/lib/view-models";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  readingTimeMinutes: number;
  tags: Tag[];
};

type RelatedPostsProps = {
  slug: string;
  variant?: "default" | "sidebar";
};

export function RelatedPosts({ slug, variant = "default" }: RelatedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchRelated() {
      try {
        const limit = variant === "sidebar" ? 4 : 2;
        const res = await fetch(
          `/api/content/posts/${slug}/related?limit=${limit}`,
        );
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          setPosts(data.data.items || []);
        }
      } catch (err) {
        console.error("Failed to load related posts", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRelated();
  }, [slug, variant]);

  if (isLoading || posts.length === 0) return null;

  if (variant === "sidebar") {
    return (
      <div className="flex flex-col gap-4 mt-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group flex gap-4 overflow-hidden rounded-xl bg-transparent transition-all hover:bg-[color-mix(in_srgb,var(--foreground)_2%,transparent)]"
          >
            {post.featuredImageUrl && (
              <div className="aspect-4/3 w-28 xl:w-32 shrink-0 overflow-hidden rounded-lg border ui-border shadow-sm">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-col justify-center py-1">
              <h4 className="text-sm xl:text-base font-bold leading-tight ui-text-heading mb-1.5 group-hover:text-brand-accent transition-colors line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-medium ui-text-muted">
                <time>{formatDateTime(post.publishedAt)}</time>
                <span>·</span>
                <span>{post.readingTimeMinutes || 1} min read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-16 mb-24">
      <h3 className="text-xl font-bold tracking-tight text-foreground mb-8">
        Read more
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group block relative overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--foreground)_2%,transparent)] border border-[color-mix(in_srgb,var(--foreground)_5%,transparent)] transition-all hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] hover:border-[color-mix(in_srgb,var(--foreground)_15%,transparent)]"
          >
            {post.featuredImageUrl && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-6">
              {post.tags.length > 0 && (
                <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--foreground)_50%,transparent)]">
                  {post.tags[0].name}
                </div>
              )}
              <h4 className="text-lg font-bold leading-tight text-foreground mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-medium text-[color-mix(in_srgb,var(--foreground)_40%,transparent)] uppercase tracking-wide mt-4">
                <time>{formatDateTime(post.publishedAt)}</time>
                <span>·</span>
                <span>{post.readingTimeMinutes || 1} min read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
