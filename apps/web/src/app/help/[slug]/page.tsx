import { MarkdownContent } from "@/components/ui/markdown-content";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HelpArticleFeedbackWidget } from "./feedback-widget";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Main Content */}
      <div className="flex-1 max-w-3xl space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-medium text-text-muted space-x-2">
          <Link href="/help" className="hover:text-text-primary transition-colors">Help Center</Link>
          {article.category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/help?categorySlug=${article.category.slug}`} className="hover:text-text-primary transition-colors">
                {article.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-text-primary">{article.title}</span>
        </nav>

        <header className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-heading">{article.title}</h1>
          <div className="flex items-center text-sm text-text-muted space-x-4">
            <span>Updated {formatDateTime(article.updatedAt)}</span>
            {article.readingTimeMins > 0 && <span>{article.readingTimeMins} min read</span>}
          </div>
        </header>

        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-brand-primary">
          <MarkdownContent markdown={content} />
        </article>

        <hr className="border-border my-8" />
        
        <HelpArticleFeedbackWidget articleId={article.id} />
      </div>

      {/* Floating TOC */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">On this page</h3>
          {/* Note: A real TOC would parse headings from MDX here */}
          <ul className="space-y-3 text-sm text-text-secondary border-l-2 border-border pl-4">
            <li><a href="#" className="hover:text-brand-primary">Introduction</a></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
