"use client";

import { cn } from "@/lib/cn";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

type HelpTreeItem = {
  id: string;
  name: string;
  slug: string;
  children: HelpTreeItem[];
  articles: { id: string; slug: string; title: string; categoryId: string }[];
};

function TreeCategory({
  category,
  level = 0,
  expandedCategorySlug,
  setExpandedCategorySlug,
  activeArticleSlug,
  setActiveArticleSlug,
}: {
  category: HelpTreeItem;
  level?: number;
  expandedCategorySlug: string | null;
  setExpandedCategorySlug: (slug: string | null) => void;
  activeArticleSlug: string | null;
  setActiveArticleSlug: (slug: string | null) => void;
}) {
  const isExpanded = expandedCategorySlug === category.slug;
  const router = useRouter();

  const handleCategoryClick = () => {
    if (!isExpanded) {
      setExpandedCategorySlug(category.slug);
      setActiveArticleSlug(category.articles[0]?.slug || null);
      router.push(`?category=${category.slug}`);
    } else {
      setExpandedCategorySlug(null);
      setActiveArticleSlug(null);
    }
  };

  const paddingLeft = `${level * 12 + 12}px`;
  const childrenPaddingLeft = `${(level + 2) * 12 + 12}px`;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center w-full group cursor-pointer text-sm py-1 pr-3 rounded-md transition-colors font-medium",
          isExpanded
            ? "bg-brand-primary/5 text-brand-primary"
            : "text-text-secondary hover:bg-surface-active hover:text-text-primary"
        )}
        style={{ paddingLeft }}
        onClick={handleCategoryClick}
      >
        <div className="flex items-center gap-2 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 opacity-70" />
          ) : (
            <ChevronRight className="h-4 w-4 opacity-70" />
          )}
          <span className="truncate">{category.name}</span>
        </div>
      </div>

      {isExpanded && (
        <div>
          {category.children.map((child) => (
            <TreeCategory
              key={child.id}
              category={child}
              level={level + 1}
              expandedCategorySlug={expandedCategorySlug}
              setExpandedCategorySlug={setExpandedCategorySlug}
              activeArticleSlug={activeArticleSlug}
              setActiveArticleSlug={setActiveArticleSlug}
            />
          ))}

          {category.articles.length > 0 && (
            <div className="mt-1 pb-2">
              {category.articles.map((article) => {
                const isActive = activeArticleSlug === article.slug;
                return (
                  <a
                    key={article.id}
                    href={`#${article.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveArticleSlug(article.slug);
                      document.getElementById(article.slug)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "flex items-center w-full text-sm py-1.5 pr-3 rounded-md transition-colors",
                      isActive
                        ? "font-bold text-brand-primary"
                        : "text-text-secondary hover:bg-surface-active hover:text-text-primary font-normal"
                    )}
                    style={{ paddingLeft: childrenPaddingLeft }}
                  >
                    <span className="truncate">{article.title}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HelpSidebar({ tree }: { tree: HelpTreeItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const defaultCategory = tree.find(c => c.slug === categoryParam) || tree[0];

  const [expandedCategorySlug, setExpandedCategorySlug] = useState<string | null>(
    defaultCategory?.slug || null
  );
  
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(
    defaultCategory?.articles?.[0]?.slug || null
  );

  const SidebarContent = () => (
    <div className="space-y-8">
      <nav className="space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 px-1">
            Categories
          </h3>
          <div className="space-y-0.5">
            {tree.map((cat) => (
              <TreeCategory
                key={cat.id}
                category={cat}
                expandedCategorySlug={expandedCategorySlug}
                setExpandedCategorySlug={setExpandedCategorySlug}
                activeArticleSlug={activeArticleSlug}
                setActiveArticleSlug={setActiveArticleSlug}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 px-1">
            Support
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/contact"
                className="block px-3 py-2 text-sm font-medium rounded-lg transition-colors text-text-secondary hover:text-text-primary hover:bg-surface-active"
              >
                Contact Support
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden sticky top-15 z-40 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle p-4 mb-4">
        <Button
          variant="outline"
          className="w-full justify-between font-normal text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            Menu & Categories
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              mobileOpen && "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-[80%] max-w-sm h-full bg-bg-base shadow-2xl p-6 overflow-y-auto transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8 pr-6 scrollbar-hide">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
