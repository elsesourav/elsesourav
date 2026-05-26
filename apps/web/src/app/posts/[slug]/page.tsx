import { MarkdownContent } from "@/components/ui/markdown-content";
import { PageShell } from "@/components/ui/page";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostInteractions } from "@/components/ui/post-interactions";
import { CommentsSection } from "@/components/ui/comments-section";
import { RelatedPosts } from "@/components/ui/related-posts";

type PostTag = {
  id: string;
  name: string;
  slug: string;
};

type PostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  featuredImageUrl: string | null;
  readingTimeMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  tags: PostTag[];
  author: {
    id: string;
    name: string | null;
  } | null;
};

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string): Promise<PostDetail | null> {
  return fetchServiceData<PostDetail>({
    service: "content",
    path: `/v1/content/posts/${slug}`,
  }).catch(() => null);
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Post not found" };

  return {
    title: post.seoTitle ?? post.title,
    description:
      post.seoDescription ??
      markdownExcerpt(post.excerpt ?? post.contentMarkdown, 160),
    openGraph: {
      title: post.seoTitle ?? post.title,
      description:
        post.seoDescription ??
        markdownExcerpt(post.excerpt ?? post.contentMarkdown, 160),
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const readTime =
    post.readingTimeMinutes || estimateReadingTime(post.contentMarkdown);

  return (
    <PageShell width="content" className="gap-0 pb-16">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] transition-colors hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          All posts
        </Link>
      </div>

      {/* Featured image */}
      {post.featuredImageUrl && (
        <div className="mb-1 overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]">
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            loading="lazy"
            className="w-full object-cover"
            style={{ maxHeight: "480px" }}
          />
        </div>
      )}

      {/* Interactions (Like, Bookmark, Share) */}
      <PostInteractions slug={post.slug} />

      {/* Header */}
      <header className="mb-10 space-y-4">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/posts?tag=${tag.slug}`}
                className="rounded-full border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] px-3 py-0.5 text-[11px] font-semibold text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] transition-colors hover:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] hover:text-foreground"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg leading-relaxed text-[color-mix(in_srgb,var(--foreground)_65%,transparent)]">
            {post.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
          {post.author?.name && (
            <span className="font-medium text-foreground">
              {post.author.name}
            </span>
          )}
          {post.author?.name && <span className="hidden sm:inline">·</span>}
          <time>{formatDateTime(post.publishedAt)}</time>
          <span className="hidden sm:inline">·</span>
          <span>{readTime} min read</span>
        </div>
      </header>

      {/* Article content */}
      <article className="prose-article max-w-none mb-10">
        <MarkdownContent markdown={post.contentMarkdown} />
      </article>

      {/* Footer tags */}
      {post.tags.length > 0 && (
        <footer className="mt-8 mb-16 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color-mix(in_srgb,var(--foreground)_35%,transparent)]">
            Tagged in
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/posts?tag=${tag.slug}`}
                className="rounded-full border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] px-3 py-1 text-xs font-medium text-[color-mix(in_srgb,var(--foreground)_60%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:text-foreground"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </footer>
      )}

      {/* Related Posts */}
      <RelatedPosts slug={post.slug} />

      {/* Comments */}
      <div id="comments-section" className="scroll-mt-24">
        <CommentsSection slug={post.slug} />
      </div>
    </PageShell>
  );
}
