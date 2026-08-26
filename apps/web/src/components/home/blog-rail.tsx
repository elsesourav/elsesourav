import { formatDateTime } from "@/lib/view-models";
import { ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCompactCount } from "./home-utils";

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  featuredImageUrl: string | null;
  readingTimeMinutes: number;
  isFeatured: boolean;
  publishedAt: string | null;
  tags: { id: string; name: string; slug: string }[];
  _count: { comments: number };
};

type BlogRailProps = {
  title: string;
  subtitle: string;
  posts: PostListItem[];
  href: string;
};

export function BlogRail({ title, subtitle, posts, href }: BlogRailProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-end justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
            {title}
          </h2>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="group hidden sm:flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.slice(0, 4).map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group flex flex-col bg-surface-base border border-border-subtle rounded-2xl overflow-hidden hover:border-brand-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative aspect-[16/9] w-full bg-surface-active overflow-hidden">
              {post.featuredImageUrl ? (
                <Image
                  src={post.featuredImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/5 text-brand-primary/20">
                  <BookOpen className="w-12 h-12" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col flex-1 p-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag.id} className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                    {tag.name}
                  </span>
                ))}
              </div>
              
              <h3 className="font-semibold text-text-primary line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                {post.title}
              </h3>
              
              <p className="text-sm text-text-secondary line-clamp-2 mt-auto">
                {post.excerpt || "Read more about this topic..."}
              </p>
              
              <div className="flex items-center gap-3 text-xs font-medium text-text-muted pt-2 border-t border-border-subtle/50 mt-4">
                <span>{formatDateTime(post.publishedAt || new Date().toISOString())}</span>
                <span>•</span>
                <span>{post.readingTimeMinutes} min read</span>
                {post._count?.comments > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatCompactCount(post._count.comments)} comments</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="sm:hidden pt-2 flex justify-center">
        <Link
          href={href}
          className="flex items-center gap-2 text-sm font-semibold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 px-6 py-2.5 rounded-full transition-colors"
        >
          View all posts
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
