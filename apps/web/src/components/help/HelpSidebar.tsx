"use client";

import { cn } from "@/lib/cn";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

type HelpTreeItem = {
  id: string;
  name: string;
  slug: string;
  children: HelpTreeItem[];
  articles: { id: string; slug: string; title: string; categoryId: string }[];
  faqs: { id: string; question: string; categoryId: string }[];
};

function TreeCategory({
  category,
  level = 0,
  pathname,
  expandedCategorySlug,
  setExpandedCategorySlug,
}: {
  category: HelpTreeItem;
  level?: number;
  pathname: string;
  expandedCategorySlug: string | null;
  setExpandedCategorySlug: (slug: string | null) => void;
}) {
  const router = useRouter();

  const hasActiveChild = (cat: HelpTreeItem): boolean => {
    if (pathname === `/help/category/${cat.slug}`) return true;
    if (cat.articles.some((a) => pathname === `/help/${a.slug}`)) return true;
    if (cat.children.some(hasActiveChild)) return true;
    return false;
  };

  const isCategoryActive = hasActiveChild(category);
  const isExpanded = expandedCategorySlug === category.slug;

  const handleCategoryClick = () => {
    const nextState = isExpanded ? null : category.slug;
    setExpandedCategorySlug(nextState);

    if (nextState) {
      // Navigate when expanded
      if (category.articles.length > 0) {
        router.push(`/help/${category.articles[0].slug}`);
      } else if (category.faqs.length > 0 || category.children.length > 0) {
        router.push(`/help/category/${category.slug}`);
      }
    }
  };

  const paddingLeft = `${level * 12 + 12}px`;
  const childrenPaddingLeft = `${(level + 2) * 12 + 12}px`;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center w-full group cursor-pointer text-sm py-1 pr-3 rounded-md transition-colors",
          isCategoryActive
            ? "bg-brand-primary/10 text-brand-primary font-semibold"
            : "text-text-secondary hover:bg-surface-active hover:text-text-primary font-medium",
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
              pathname={pathname}
              expandedCategorySlug={expandedCategorySlug}
              setExpandedCategorySlug={setExpandedCategorySlug}
            />
          ))}

          {category.articles.length > 0 && (
            <div className="mt-1 pb-2">
              {category.articles.map((article) => {
                const isArticleActive = pathname === `/help/${article.slug}`;
                return (
                  <Link
                    key={article.id}
                    href={`/help/${article.slug}`}
                    className={cn(
                      "flex items-center w-full text-sm py-1.5 pr-3 rounded-md transition-colors",
                      isArticleActive
                        ? "text-brand-primary font-medium bg-brand-primary/5"
                        : "text-text-secondary hover:bg-surface-active hover:text-text-primary",
                    )}
                    style={{ paddingLeft: childrenPaddingLeft }}
                  >
                    <span className="truncate">{article.title}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {category.faqs.length > 0 && (
            <div>
              {category.faqs.map((faq) => (
                <Link
                  key={faq.id}
                  href={`/help/category/${category.slug}#faq-${faq.id}`}
                  className="flex items-start w-full text-sm py-1.5 pr-3 rounded-md transition-colors text-text-secondary hover:bg-surface-active hover:text-text-primary"
                  style={{ paddingLeft: childrenPaddingLeft }}
                >
                  <span className="line-clamp-2 leading-snug">
                    {faq.question}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HelpSidebar({ tree }: { tree: HelpTreeItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategorySlug, setExpandedCategorySlug] = useState<
    string | null
  >(null);

  // Auto-expand the active category on initial load or route changes
  useEffect(() => {
    const findActiveCategory = (items: HelpTreeItem[]): string | null => {
      for (const item of items) {
        if (pathname === `/help/category/${item.slug}`) return item.slug;
        if (item.articles.some((a) => pathname === `/help/${a.slug}`))
          return item.slug;

        const childActive = findActiveCategory(item.children);
        if (childActive) return item.slug;
      }
      return null;
    };

    const active = findActiveCategory(tree);
    if (active && active !== expandedCategorySlug) {
      setExpandedCategorySlug(active);
    }
  }, [pathname, tree]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
                pathname={pathname}
                expandedCategorySlug={expandedCategorySlug}
                setExpandedCategorySlug={setExpandedCategorySlug}
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
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === "/contact"
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-active",
                )}
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
