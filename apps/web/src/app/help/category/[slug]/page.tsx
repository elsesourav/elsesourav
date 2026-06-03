import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { TableOfContents } from "@/components/help/TableOfContents";

type HelpCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type HelpArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  contentMarkdown: string;
  contentMdx: string | null;
  sections?: {
    id: string;
    title: string;
    slug: string;
    contentMarkdown: string;
  }[];
};

type HelpArticleListResult = {
  items: HelpArticle[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

type FAQ = {
  id: string;
  question: string;
  answerMdx: string;
};

export const dynamic = "force-dynamic";

export default async function HelpCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [categories, articles] = await Promise.all([
    fetchServiceData<HelpCategory[]>({
      service: "content",
      path: "/v1/content/help/categories",
    }).catch(() => []),
    fetchServiceData<HelpArticleListResult>({
      service: "content",
      path: `/v1/content/help/articles?categorySlug=${slug}&limit=24`,
    })
      .then((payload) => payload.items)
      .catch(() => []),
  ]);

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const faqs = await fetchServiceData<FAQ[]>({
    service: "content",
    path: `/v1/content/help/faqs?categoryId=${category.id}`,
  }).catch(() => []);

  return (
    <div className="flex flex-col lg:flex-row gap-12 relative">
      {/* Main Content */}
      <div className="flex-1 min-w-0 max-w-3xl space-y-12">
        
        {/* Header */}
        <div>
          <nav className="flex items-center text-sm font-medium text-text-muted space-x-2 mb-4">
            <Link href="/help" className="hover:text-text-primary transition-colors">Help Center</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-text-primary">{category.name}</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-text-heading sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-text-muted max-w-2xl mt-4">
              {category.description}
            </p>
          )}
        </div>

        {/* Articles Content */}
        <div className="space-y-24">
          {articles.length === 0 ? (
            <div className="ui-card p-12 text-center text-text-muted rounded-2xl border">
              No articles published in this category yet.
            </div>
          ) : (
            articles.map((article) => {
              const content = article.contentMdx || article.contentMarkdown;
              return (
                <article key={article.id} id={article.slug} className="scroll-mt-24">
                  <header className="mb-6">
                    <h2 className="text-3xl font-bold text-text-heading mb-2">
                      <Link href={`/help/${article.slug}`} className="hover:text-brand-primary transition-colors">
                        {article.title}
                      </Link>
                    </h2>
                  </header>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary line-clamp-3">
                    <MarkdownContent markdown={article.summary || article.contentMarkdown || ""} />
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <div className="pt-16 border-t border-border-subtle">
            <h2 className="text-2xl font-bold tracking-tight text-text-heading mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.id} id={`faq-${faq.id}`} className="ui-card rounded-2xl border p-6 shadow-sm scroll-mt-24">
                  <h3 className="text-lg font-semibold text-text-heading mb-3 flex items-start gap-2">
                    <span className="text-brand-primary font-bold">Q:</span>
                    {faq.question}
                  </h3>
                  <div className="text-text-secondary leading-relaxed bg-surface-active/30 p-4 rounded-xl border border-border-subtle prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownContent markdown={faq.answerMdx} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - TOC */}
      {(articles.length > 0 || faqs.length > 0) && (
        <aside className="hidden xl:block w-64 shrink-0">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </aside>
      )}
    </div>
  );
}
