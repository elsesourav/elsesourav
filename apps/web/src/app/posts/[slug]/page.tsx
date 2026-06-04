import { CommentsSection } from "@/components/ui/comments-section";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { PageShell } from "@/components/ui/page";
import { PostInteractions } from "@/components/ui/post-interactions";
import { RelatedPosts } from "@/components/ui/related-posts";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <PageShell width="wide" className="gap-0 pb-16">
      <div className="mx-auto w-full max-w-7xl grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_460px]">
        {/* Left Column: Main Content */}
        <div className="min-w-0 relative">
          {/* Back link */}
          <div className="absolute -top-8 lg:-top-8 left-0 z-10">
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

          <div className="px-2 sm:px-2 lg:px-4 mt-6">
            {/* Header */}
            <header className="mb-10 space-y-4">
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
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
                {post.author?.name && (
                  <span className="hidden sm:inline">·</span>
                )}
                <time>{formatDateTime(post.publishedAt)}</time>
                <span className="hidden sm:inline">·</span>
                <span>{readTime} min read</span>
              </div>
            </header>

            {/* Article content */}
            <article className="prose-article max-w-none mb-10">
              <MarkdownContent markdown={post.contentMarkdown} />
            </article>

            {/* Comments */}
            <div id="comments-section" className="scroll-mt-24 mt-16">
              <CommentsSection slug={post.slug} />
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
          {/* Tagged in Box */}
          {post.tags.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border ui-border shadow-sm p-6 bg-[color-mix(in_srgb,var(--background)_90%,var(--brand-primary)_10%)]">
              {/* Background pattern repeat image */}
              <div
                className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-50"
                style={{
                  backgroundImage:
                    'url("/img/pattern/light/ptn-light-[5].png")',
                  backgroundRepeat: "repeat",
                  backgroundSize: "200px",
                }}
              />

              <div className="relative z-10">
                <h3 className="mb-5 text-xl font-extrabold tracking-tight upper ui-text-heading">
                  Tagged in
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/posts?tag=${tag.slug}`}
                      className="rounded-full border ui-border bg-background/90 px-3 py-1 text-xs font-semibold ui-text-primary transition-all hover:bg-background hover:shadow-sm"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Posts */}
          <div className="rounded-2xl border ui-border bg-surface p-6 shadow-sm">
            <h3 className="text-xl font-extrabold tracking-tight ui-text-heading border-b ui-border pb-1">
              Related Posts
            </h3>
            <RelatedPosts slug={post.slug} variant="sidebar" />
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
