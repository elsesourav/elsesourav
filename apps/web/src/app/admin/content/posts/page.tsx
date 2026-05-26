import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminPost, AdminPostTag } from "@/lib/view-models";

import { AdminContentPostsClient } from "./client";

export const dynamic = "force-dynamic";

type BlogPostListResult = {
  items: AdminPost[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

const emptyPostsResult: BlogPostListResult = {
  items: [],
  pagination: {
    limit: 30,
    nextCursor: null,
    hasMore: false,
  },
};

export default async function AdminContentBlogPage() {
  const user = await requireAdminContext();

  const [postsResult, tags] = await Promise.all([
    fetchServiceData<BlogPostListResult>({
      service: "content",
      path: "/v1/admin/content/posts/posts?limit=30",
      user,
    }).catch(() => emptyPostsResult),
    fetchServiceData<AdminPostTag[]>({
      service: "content",
      path: "/v1/admin/content/posts/tags",
      user,
    }).catch(() => []),
  ]);

  const posts = postsResult.items;
  const publishedCount = posts.filter(
    (post) => post.status === "PUBLISHED",
  ).length;
  const draftCount = posts.filter((post) => post.status === "DRAFT").length;

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Presentation"
        title="Blog posts"
        description="Write, preview, and publish editorial posts with structured tags and admin-only publishing control."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">Posts</p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {posts.length.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Published
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {publishedCount.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Drafts
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {draftCount.toLocaleString()}
          </p>
        </article>
      </section>

      <AdminContentPostsClient initialPosts={posts} initialTags={tags} />
    </div>
  );
}
