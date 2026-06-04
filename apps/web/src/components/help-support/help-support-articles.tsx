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
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Categories */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
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

          <div className="grid gap-2">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/help?category=${category.slug}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors border border-transparent hover:border-border-subtle group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-surface-active flex items-center justify-center shrink-0 group-hover:bg-brand-secondary/10 transition-colors">
                    <Folder className="h-4 w-4 text-text-muted group-hover:text-brand-secondary transition-colors fill-brand-secondary/10" />
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
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
          
          <div className="grid gap-2">
            {articles.slice(0, 6).map((article) => (
              <Link
                key={article.id}
                href={`/help?category=${article.category?.slug || 'general'}#${article.slug}`}
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
      )}
    </div>
  );
}
