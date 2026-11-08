'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input, IconButton } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { BlogPost, BlogCategory } from '@elsesourav/types';
import { archiveBlogPostAction, deleteBlogPostAction } from '../actions/admin-update-actions';
import { FileText, Search, ExternalLink, Edit, Archive, Trash2 } from 'lucide-react';

export interface AdminUpdatesTableProps {
  initialPosts: readonly BlogPost[];
  categories: readonly BlogCategory[];
}

export function AdminUpdatesTable({ initialPosts, categories }: AdminUpdatesTableProps) {
  const [posts, setPosts] = React.useState<readonly BlogPost[]>(initialPosts);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  const categoryItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Categories' },
      ...categories.map((c) => ({ value: c.slug, label: c.name })),
    ],
    [categories]
  );

  const statusItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Statuses' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
    ],
    []
  );

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
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: 'archived' } : p)));
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
    <div className="space-y-5 sm:space-y-6 w-full max-w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search updates by title or slug..."
              className="bg-zinc-900/60 border-zinc-800 text-xs pl-9 rounded-xl text-zinc-100 placeholder:text-zinc-500 w-full"
            />
          </div>

          {/* Filter Dropdowns Grid on mobile, inline on tablet/desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
            <Dropdown
              items={categoryItems}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              className="w-full sm:w-44"
            />

            <Dropdown
              items={statusItems}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-full sm:w-36"
            />
          </div>
        </div>
      </div>

      {/* Updates Articles Table Card */}
      <Card className="rounded-2xl sm:rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden w-full">
        {filteredPosts.length === 0 ? (
          <div className="py-12 sm:py-16 px-4 text-center space-y-3">
            <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No updates found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              No devlogs or articles match your selected filters. Create a new article to publish
              updates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse table-fixed">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                  <th className="py-3 px-3.5 sm:px-4 font-semibold">Article Title</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden md:table-cell w-48 sm:w-52 whitespace-nowrap">Category</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-28 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden lg:table-cell w-16 whitespace-nowrap">Views</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden xl:table-cell w-28 whitespace-nowrap">Updated</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold text-right w-32 sm:w-36 whitespace-nowrap">Actions</th>
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
                    <tr key={post.id} className="hover:bg-zinc-800/30 transition-colors group">
                      {/* Title & Slug & Mobile Status Badge */}
                      <td className="py-3 px-3.5 sm:px-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
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
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors text-xs sm:text-sm">
                              {post.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[110px] sm:max-w-[180px]">
                                /updates/{post.slug}
                              </span>
                              {/* Mobile-only inline status badge */}
                              <span className="sm:hidden shrink-0">
                                {post.status === 'published' ? (
                                  <Badge variant="success" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                    Live
                                  </Badge>
                                ) : post.status === 'draft' ? (
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
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3.5 sm:px-4 hidden md:table-cell whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 text-[11px] truncate max-w-[180px] inline-block align-middle">
                          {post.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Status Badge (desktop / tablet) */}
                      <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                        {post.status === 'published' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Published
                          </Badge>
                        ) : post.status === 'draft' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Views Count */}
                      <td className="py-3 px-3.5 sm:px-4 hidden lg:table-cell text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {post.viewsCount ?? 0}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-3.5 sm:px-4 hidden xl:table-cell text-zinc-500 text-[11px] whitespace-nowrap">
                        {updatedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {post.status === 'published' && (
                            <Link
                              href={`/updates/${post.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors inline-flex items-center justify-center"
                              title="View Public Article"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/updates/${post.id}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 transition-colors inline-flex items-center justify-center"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {post.status !== 'archived' && (
                            <IconButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleArchive(post.id)}
                              aria-label="Archive Article"
                              title="Archive Article"
                              icon={<Archive className="w-3.5 h-3.5" />}
                              className="rounded-lg text-zinc-400 hover:text-amber-300"
                            />
                          )}
                          <IconButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(post.id)}
                            disabled={isDeletingId === post.id}
                            loading={isDeletingId === post.id}
                            aria-label="Delete Article"
                            title="Delete Article"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            className="rounded-lg text-zinc-400 hover:text-rose-400"
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
