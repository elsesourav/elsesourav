import { MarkdownContent } from "@/components/ui/markdown-content";
import { PageHeader, PageShell } from "@/components/ui/page";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type HelpArticleDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  contentMarkdown: string;
  publishedAt: string | null;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type HelpArticlePageProps = {
  params: Promise<{ slug: string }>;
};

async function getHelpArticle(slug: string): Promise<HelpArticleDetail | null> {
  return fetchServiceData<HelpArticleDetail>({
    service: "content",
    path: `/v1/content/help/articles/${slug}`,
  }).catch(() => null);
}

export async function generateMetadata({
  params,
}: HelpArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getHelpArticle(slug);

  if (!article) {
    return {
      title: "Help article not found",
    };
  }

  return {
    title: article.title,
    description: markdownExcerpt(
      article.summary ?? article.contentMarkdown,
      160,
    ),
  };
}

export const dynamic = "force-dynamic";

export default async function HelpArticlePage({
  params,
}: HelpArticlePageProps) {
  const { slug } = await params;
  const article = await getHelpArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow={article.category?.name ?? "Help"}
        title={article.title}
        description={`Updated ${formatDateTime(article.updatedAt)}`}
      />

      <article className="ui-card rounded-xl border p-5">
        <MarkdownContent markdown={article.contentMarkdown} />
      </article>
    </PageShell>
  );
}
