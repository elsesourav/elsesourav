import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminBlogPost, AdminBlogTag } from "@/lib/view-models";

import { AdminContentBlogClient } from "./client";

export const dynamic = "force-dynamic";

type BlogPostListResult = {
  items: AdminBlogPost[];
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
      path: "/v1/admin/content/blog/posts?limit=30",
      user,
    }).catch(() => emptyPostsResult),
    fetchServiceData<AdminBlogTag[]>({
      service: "content",
      path: "/v1/admin/content/blog/tags",
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
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#55607a]">
            Posts
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#111a2d]">
            {posts.length.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#55607a]">
            Published
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#111a2d]">
            {publishedCount.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#55607a]">
            Drafts
          </p>
          <p className="mt-1 text-3xl font-semibold text-[#111a2d]">
            {draftCount.toLocaleString()}
          </p>
        </article>
      </section>

      <AdminContentBlogClient initialPosts={posts} initialTags={tags} />
    </div>
  );
}
