import { MarkdownContent } from "@/components/ui/markdown-content";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HelpArticleFeedbackWidget } from "./feedback-widget";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TableOfContents } from "@/components/help/TableOfContents";

type HelpArticleDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  contentMarkdown: string;
  contentMdx: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  readingTimeMins: number;
  publishedAt: string | null;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  sections?: {
    id: string;
    title: string;
    slug: string;
    contentMarkdown: string;
  }[];
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
    title: article.seoTitle || article.title,
    description: article.seoDescription || markdownExcerpt(article.summary ?? article.contentMdx ?? article.contentMarkdown, 160),
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

  const content = article.contentMdx || article.contentMarkdown;

  return (
    <div className="flex flex-col lg:flex-row gap-12 relative">
      {/* Main Content */}
      <div className="flex-1 min-w-0 max-w-3xl space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-medium text-text-muted space-x-2 whitespace-nowrap overflow-hidden text-ellipsis">
          <Link href="/help" className="hover:text-text-primary transition-colors">Help Center</Link>
          {article.category && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <Link href={`/help/category/${article.category.slug}`} className="hover:text-text-primary transition-colors">
                {article.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="text-text-primary truncate">{article.title}</span>
        </nav>

        <header className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-heading">{article.title}</h1>
          <div className="flex items-center text-sm text-text-muted space-x-4">
            <span>Updated {formatDateTime(article.updatedAt)}</span>
            {article.readingTimeMins > 0 && <span>{article.readingTimeMins} min read</span>}
          </div>
        </header>

        <div className="prose prose-brand dark:prose-invert max-w-none">
          {content && <MarkdownContent markdown={content} />}
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle">
          <HelpArticleFeedbackWidget articleId={article.id} />
        </div>
      </div>

      {/* Right Sidebar - TOC */}
      <aside className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-24">
          <TableOfContents />
        </div>
      </aside>
    </div>
  );
}
