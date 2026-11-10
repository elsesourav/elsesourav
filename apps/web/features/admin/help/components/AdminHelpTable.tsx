'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input, IconButton } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { HelpArticle, HelpCategoryWithArticles } from '@elsesourav/types';
import { archiveHelpArticleAction, deleteHelpArticleAction } from '../actions/admin-help-actions';
import { HelpCircle, Search, ExternalLink, Edit, Archive, Trash2 } from 'lucide-react';

interface AdminHelpTableProps {
  initialArticles: readonly HelpArticle[];
  categories: readonly HelpCategoryWithArticles[];
}

export function AdminHelpTable({ initialArticles, categories }: AdminHelpTableProps) {
  const [articles, setArticles] = React.useState(initialArticles);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  const categoryItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Categories' },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories]
  );

  const filteredArticles = React.useMemo(() => {
    return articles.filter((article) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSlug = article.slug.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (article.categoryId !== selectedCategory) {
          return false;
        }
      }

      return true;
    });
  }, [articles, search, selectedCategory]);

  const handleArchive = async (articleId: string) => {
    try {
      await archiveHelpArticleAction(articleId);
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, status: 'archived' } : a))
      );
    } catch {
      // Non-blocking
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to delete this help article?')) return;

    setIsDeletingId(articleId);
    try {
      await deleteHelpArticleAction(articleId);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } catch {
      // Non-blocking
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles by title or slug..."
              className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-xs pl-9 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 w-full shadow-sm"
            />
          </div>

          {/* Category Dropdown */}
          <Dropdown
            items={categoryItems}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            className="w-full sm:w-56"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl overflow-hidden w-full shadow-sm">
        {filteredArticles.length === 0 ? (
          <div className="py-12 sm:py-16 px-4 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No help articles found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              No knowledge base articles match your selected filters. Create documentation articles
              to assist users.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300 border-collapse table-fixed">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400 font-medium">
                  <th className="py-3 px-3.5 sm:px-4 font-semibold">Article</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden md:table-cell w-48 sm:w-52 whitespace-nowrap">Category</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-16 whitespace-nowrap">Order</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-24 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden lg:table-cell w-20 whitespace-nowrap">Helpful</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold text-right w-28 sm:w-32 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/50">
                {filteredArticles.map((article) => {
                  const category = categories.find((c) => c.id === article.categoryId);
                  const categoryName = category?.name || 'General';
                  const publicUrl = category
                    ? `/help/${category.slug}/${article.slug}`
                    : `/help/${article.slug}`;

                  return (
                    <tr key={article.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                      {/* Title & Slug & Mobile Status Badge */}
                      <td className="py-3 px-3.5 sm:px-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors text-xs sm:text-sm">
                            {article.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[130px] sm:max-w-[220px]">
                              {publicUrl}
                            </span>
                            {/* Mobile-only inline status badge */}
                            <span className="sm:hidden shrink-0">
                              {article.status === 'published' ? (
                                <Badge variant="success" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                  Live
                                </Badge>
                              ) : article.status === 'draft' ? (
                                <Badge variant="warning" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                  Draft
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                  Archived
                                </Badge>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3.5 sm:px-4 hidden md:table-cell whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-300 text-[11px] truncate max-w-[180px] inline-block align-middle">
                          {categoryName}
                        </span>
                      </td>

                      {/* Order Index */}
                      <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell font-mono text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        #{article.orderIndex ?? 0}
                      </td>

                      {/* Status Badge (desktop / tablet) */}
                      <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                        {article.status === 'published' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Published
                          </Badge>
                        ) : article.status === 'draft' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Helpfulness */}
                      <td className="py-3 px-3.5 sm:px-4 hidden lg:table-cell text-zinc-600 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        <span className="text-emerald-600 dark:text-emerald-400">+{article.helpfulCount ?? 0}</span> /{' '}
                        <span className="text-rose-600 dark:text-rose-400">-{article.unhelpfulCount ?? 0}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {article.status === 'published' && (
                            <Link
                              href={publicUrl}
                              target="_blank"
                              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center shrink-0"
                              title="View Public Guide"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/help/${article.id}`}
                            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center shrink-0"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {article.status !== 'archived' && (
                            <IconButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleArchive(article.id)}
                              aria-label="Archive Article"
                              title="Archive Article"
                              icon={<Archive className="w-3.5 h-3.5" />}
                              className="rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
                            />
                          )}
                          <IconButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(article.id)}
                            disabled={isDeletingId === article.id}
                            loading={isDeletingId === article.id}
                            aria-label="Delete Article"
                            title="Delete Article"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            className="rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
