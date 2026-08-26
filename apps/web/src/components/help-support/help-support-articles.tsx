import { formatDateTime } from "@/lib/view-models";
import { ChevronRight, FileText, Folder } from "lucide-react";
import Link from "next/link";
import type { HelpArticle, HelpCategory } from "./types";

export function HelpSupportArticles({
  categories,
  articles,
}: {
  featuredArticle: HelpArticle | null;
  categories: HelpCategory[];
  articles: HelpArticle[];
}) {
  if (articles.length === 0 && categories.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
      {/* Categories */}
      {categories.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-text-primary">
              Browse Topics
            </h2>
            <Link
              href="/help"
              className="text-xs text-brand-primary hover:underline font-medium"
            >
              All topics
            </Link>
          </div>

          <div className="grid gap-1.5">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/help?category=${category.slug}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors border border-transparent hover:border-border-subtle group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-md bg-surface-active flex items-center justify-center shrink-0 group-hover:bg-brand-secondary/10 transition-colors">
                    <Folder className="h-3.5 w-3.5 text-text-muted group-hover:text-brand-secondary transition-colors fill-brand-secondary/10" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {category.name}
                    </h3>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Guides */}
      {articles.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-text-primary">
              Latest Guides
            </h2>
            <Link
              href="/help"
              className="text-xs text-brand-primary hover:underline font-medium"
            >
              All guides
            </Link>
          </div>
          
          <div className="grid gap-1.5">
            {articles.slice(0, 6).map((article) => (
              <Link
                key={article.id}
                href={`/help?category=${article.category?.slug || 'general'}#${article.slug}`}
                className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors border border-transparent hover:border-border-subtle group"
              >
                <div className="h-7 w-7 rounded-md bg-surface-active flex items-center justify-center shrink-0 group-hover:bg-brand-primary/10 transition-colors">
                  <FileText className="h-3.5 w-3.5 text-text-muted group-hover:text-brand-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {article.title}
                  </h3>
                  {article.category && (
                    <p className="text-[11px] text-text-muted mt-0.5 truncate leading-tight">
                      {article.category.name}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1.5" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
