import { formatDateTime } from "@/lib/view-models";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import type { HelpArticle, HelpCategory } from "./types";

export function HelpSupportArticles({
  articles,
}: {
  featuredArticle: HelpArticle | null;
  categories: HelpCategory[];
  articles: HelpArticle[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">
          Latest Guides
        </h2>
        <Link
          href="/help"
          className="text-xs text-brand-primary hover:underline font-medium"
        >
          View all
        </Link>
      </div>
      
      <div className="grid gap-2 sm:grid-cols-2">
        {articles.slice(0, 4).map((article) => (
          <Link
            key={article.id}
            href={`/help/${article.slug}`}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors border border-transparent hover:border-border-subtle group"
          >
            <div className="h-8 w-8 rounded-lg bg-surface-active flex items-center justify-center shrink-0 group-hover:bg-brand-primary/10 transition-colors">
              <FileText className="h-4 w-4 text-text-muted group-hover:text-brand-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text-primary truncate">
                {article.title}
              </h3>
              {article.category && (
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {article.category.name}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
          </Link>
        ))}
      </div>
    </section>
  );
}
