'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '@elsesourav/ui';
import type { BlogPost, BlogCategory } from '@elsesourav/types';
import {
  archiveBlogPostAction,
  deleteBlogPostAction,
} from '../actions/admin-blog-actions';
import {
  FileText,
  Search,
  Plus,
  ExternalLink,
  Edit,
  Archive,
  Trash2,
  Calendar,
  Eye,
  Loader2,
} from 'lucide-react';

interface AdminBlogTableProps {
  initialPosts: readonly BlogPost[];
  categories: readonly BlogCategory[];
}

export function AdminBlogTable({ initialPosts, categories }: AdminBlogTableProps) {
  const [posts, setPosts] = React.useState(initialPosts);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSlug = post.slug.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (post.category?.slug !== selectedCategory && post.categoryId !== selectedCategory) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (post.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [posts, search, selectedCategory, selectedStatus]);

  const handleArchive = async (postId: string) => {
    try {
      await archiveBlogPostAction(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: 'archived' } : p))
      );
    } catch {
      // Non-blocking
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    setIsDeletingId(postId);
    try {
      await deleteBlogPostAction(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
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
              placeholder="Search articles by title or slug..."
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
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Create Blog Action */}
        <Link href="/admin/blog/new">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Article</span>
          </Button>
        </Link>
      </div>

      {/* Blog Articles Table Card */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No articles found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              No devlogs or articles match your selected filters. Create a new article to publish updates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                  <th className="py-3.5 px-4 font-semibold">Article Title</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Views</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Updated</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredPosts.map((post) => {
                  const updatedDate = new Date(post.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Title & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            {post.coverImageUrl ? (
                              <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors max-w-xs sm:max-w-md">
                              {post.title}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono truncate">
                              /blog/{post.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 text-[11px]">
                          {post.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {post.status === 'published' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono">
                            Published
                          </Badge>
                        ) : post.status === 'draft' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Views Count */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-zinc-400 font-mono text-[11px]">
                        {post.viewsCount ?? 0}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-500 text-[11px]">
                        {updatedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === 'published' && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                              title="View Public Article"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 transition-colors"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {post.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => handleArchive(post.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors"
                              title="Archive Article"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            disabled={isDeletingId === post.id}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Delete Article"
                          >
                            {isDeletingId === post.id ? (
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
