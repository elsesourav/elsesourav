import { MarkdownContent } from "@/components/ui/markdown-content";
import { PageHeader, PageShell } from "@/components/ui/page";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type BlogTag = {
  id: string;
  name: string;
  slug: string;
};

type BlogPostDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentMarkdown: string;
  publishedAt: string | null;
  tags: BlogTag[];
};

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

async function getBlogPost(slug: string): Promise<BlogPostDetail | null> {
  return fetchServiceData<BlogPostDetail>({
    service: "content",
    path: `/v1/content/blog/posts/${slug}`,
  }).catch(() => null);
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog post not found",
    };
  }

  return {
    title: post.title,
    description: markdownExcerpt(post.excerpt ?? post.contentMarkdown, 160),
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Blog"
        title={post.title}
        description={`Published ${formatDateTime(post.publishedAt)}`}
      />

      {post.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="ui-border ui-surface ui-text-muted rounded-full border px-2 py-1 text-[11px]"
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <article className="ui-card rounded-xl border p-5">
        <MarkdownContent markdown={post.contentMarkdown} />
      </article>
    </PageShell>
  );
}
