import { PageShell } from "@/components/ui/page";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import type { Metadata } from "next";
import Link from "next/link";

type PostTag = {
  id: string;
  name: string;
  slug: string;
};

type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  featuredImageUrl: string | null;
  readingTimeMinutes: number;
  isFeatured: boolean;
  publishedAt: string | null;
  tags: PostTag[];
  author: {
    id: string;
    name: string | null;
  } | null;
  _count: {
    comments: number;
  };
};

type PostListResult = {
  items: PostListItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export const metadata: Metadata = {
  title: "Posts",
  description:
    "Platform updates, release notes, engineering insights, and technical articles.",
};

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 20;

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const tagFilter = params.tag ?? "";

  const tagQuery = tagFilter ? `&tag=${encodeURIComponent(tagFilter)}` : "";
  const posts = await fetchServiceData<PostListResult>({
    service: "content",
    path: `/v1/content/posts?limit=${POSTS_PER_PAGE}${tagQuery}`,
  })
    .then((payload) => payload.items)
    .catch(() => []);

  const totalPosts = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const paginatedPosts = posts.slice(0, POSTS_PER_PAGE);

  return (
    <PageShell width="wide" className="gap-8 pb-20">
      {/* Compact Editorial Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] pb-8 pt-4">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[color-mix(in_srgb,var(--foreground)_40%,transparent)]">
            Content
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Posts
          </h1>
          <p className="max-w-2xl text-lg text-[color-mix(in_srgb,var(--foreground)_60%,transparent)] leading-relaxed">
            Product updates, engineering notes, and release communication.
          </p>
        </div>
      </header>

      {paginatedPosts.length === 0 ? (
        <section className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[color-mix(in_srgb,var(--foreground)_35%,transparent)]"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No posts yet
          </h2>
          <p className="max-w-sm text-center text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
            There are no published posts available right now. Check back soon
            for updates and articles.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 w-full mt-4">
            {paginatedPosts.map((post) => {
              const readTime =
                post.readingTimeMinutes ||
                estimateReadingTime(post.contentMarkdown);

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] bg-[color-mix(in_srgb,var(--background)_98%,var(--foreground)_2%)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] hover:shadow-lg"
                >
                  {post.featuredImageUrl && (
                    <div className="aspect-video w-full overflow-hidden bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]">
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex flex-col flex-1 gap-5 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider uppercase text-[color-mix(in_srgb,var(--foreground)_50%,transparent)]">
                      <time>{formatDateTime(post.publishedAt)}</time>
                      <span className="opacity-50">•</span>
                      <span>{readTime} min read</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-[color-mix(in_srgb,var(--brand-secondary)_85%,var(--foreground)_15%)]">
                      {post.title}
                    </h2>

                    <p className="line-clamp-3 text-[0.95rem] sm:text-base leading-relaxed text-[color-mix(in_srgb,var(--foreground)_65%,transparent)] mt-1">
                      {markdownExcerpt(
                        post.excerpt ?? post.contentMarkdown,
                        180,
                        "No summary yet.",
                      )}
                    </p>

                    <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[color-mix(in_srgb,var(--foreground)_6%,transparent)]">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] px-2 py-1 text-[11px] font-bold tracking-wide uppercase text-foreground transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)]"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-[color-mix(in_srgb,var(--brand-secondary)_80%,var(--foreground)_20%)] flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Read <span aria-hidden="true">&rarr;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>

          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-3 pt-12"
              aria-label="Pagination"
            >
              {currentPage > 1 && (
                <Link
                  href={`/posts?page=${currentPage - 1}${tagFilter ? `&tag=${tagFilter}` : ""}`}
                  className="rounded-full border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
                >
                  ← Previous
                </Link>
              )}

              <span className="px-3 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_50%,transparent)]">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages && (
                <Link
                  href={`/posts?page=${currentPage + 1}${tagFilter ? `&tag=${tagFilter}` : ""}`}
                  className="rounded-full border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </PageShell>
  );
}
