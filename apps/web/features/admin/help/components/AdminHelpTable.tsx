'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '@elsesourav/ui';
import type { HelpArticle, HelpCategoryWithArticles } from '@elsesourav/types';
import { archiveHelpArticleAction, deleteHelpArticleAction } from '../actions/admin-help-actions';
import {
  HelpCircle,
  Search,
  Plus,
  ExternalLink,
  Edit,
  Archive,
  Trash2,
  ThumbsUp,
  Loader2,
} from 'lucide-react';

interface AdminHelpTableProps {
  initialArticles: readonly HelpArticle[];
  categories: readonly HelpCategoryWithArticles[];
}

export function AdminHelpTable({ initialArticles, categories }: AdminHelpTableProps) {
  const [articles, setArticles] = React.useState(initialArticles);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
              className="bg-zinc-900/60 border-zinc-800 text-xs pl-9 rounded-xl text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Create Action */}
        <Link href="/admin/help/new">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Article</span>
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No help articles found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              No knowledge base articles match your selected filters. Create documentation articles
              to assist users.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                  <th className="py-3.5 px-4 font-semibold">Article</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Category</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Order</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Helpful</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredArticles.map((article) => {
                  const categoryName =
                    categories.find((c) => c.id === article.categoryId)?.name || 'General';

                  return (
                    <tr key={article.id} className="hover:bg-zinc-800/30 transition-colors group">
                      {/* Title & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors max-w-xs sm:max-w-md">
                            {article.title}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono truncate">
                            /{article.slug}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 text-[11px]">
                          {categoryName}
                        </span>
                      </td>

                      {/* Order Index */}
                      <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-[11px] text-zinc-400">
                        #{article.orderIndex ?? 0}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {article.status === 'published' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono">
                            Published
                          </Badge>
                        ) : article.status === 'draft' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Helpfulness */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-400 font-mono text-[11px]">
                        <span className="text-emerald-400">+{article.helpfulCount ?? 0}</span> /{' '}
                        <span className="text-rose-400">-{article.unhelpfulCount ?? 0}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/help/${article.id}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 transition-colors"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {article.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => handleArchive(article.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors"
                              title="Archive Article"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(article.id)}
                            disabled={isDeletingId === article.id}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Delete Article"
                          >
                            {isDeletingId === article.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
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
