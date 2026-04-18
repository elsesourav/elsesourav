import { PageHeader, PageShell } from "@/components/ui/page";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import Link from "next/link";

type BlogTag = {
  id: string;
  name: string;
  slug: string;
};

type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  publishedAt: string | null;
  tags: BlogTag[];
  _count: {
    comments: number;
  };
};

type BlogListResult = {
  items: BlogListItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export const metadata = {
  title: "Blog",
  description: "Platform updates, release notes, and technical articles.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await fetchServiceData<BlogListResult>({
    service: "content",
    path: "/v1/content/blog/posts?limit=24",
  })
    .then((payload) => payload.items)
    .catch(() => []);

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Content"
        title="Blog"
        description="Product updates, engineering notes, and release communication."
      />

      {posts.length === 0 ? (
        <p className="ui-text-muted text-sm">
          No published posts available yet.
        </p>
      ) : (
        <section className="grid gap-3">
          {posts.map((post) => (
            <article key={post.id} className="ui-card rounded-xl border p-4">
              <p className="ui-text-muted text-xs uppercase tracking-wide">
                {formatDateTime(post.publishedAt)}
              </p>
              <h2 className="ui-text-heading mt-1 text-xl font-semibold">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="ui-text-muted mt-2 text-sm">
                {markdownExcerpt(
                  post.excerpt ?? post.contentMarkdown,
                  220,
                  "No summary yet.",
                )}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="ui-border ui-surface-soft ui-text-muted rounded-full border px-2 py-1 text-[11px]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
