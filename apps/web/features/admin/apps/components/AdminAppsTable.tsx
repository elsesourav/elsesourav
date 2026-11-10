'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Input, IconButton } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { App, CategorySummary } from '@elsesourav/types';
import { archiveAppAction, deleteAppAction } from '../actions/admin-app-actions';
import { Package, Search, ExternalLink, Edit, Archive, Trash2 } from 'lucide-react';

export interface AdminAppsTableProps {
  initialApps: readonly App[];
  categories: readonly CategorySummary[];
}

export function AdminAppsTable({ initialApps, categories }: AdminAppsTableProps) {
  const [apps, setApps] = React.useState<readonly App[]>(initialApps);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  const categoryItems = React.useMemo(
    () => [
      { value: 'all', label: 'All Categories' },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
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

  const filteredApps = React.useMemo(() => {
    return apps.filter((app) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = app.name.toLowerCase().includes(q);
        const matchesSlug = app.slug.toLowerCase().includes(q);
        if (!matchesName && !matchesSlug) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (app.categoryId !== selectedCategory && app.primaryCategory !== selectedCategory) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (app.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [apps, search, selectedCategory, selectedStatus]);

  const handleArchive = async (appId: string) => {
    try {
      await archiveAppAction(appId);
      setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status: 'archived' } : a)));
    } catch {
      // Non-blocking
    }
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    setIsDeletingId(appId);
    try {
      await deleteAppAction(appId);
      setApps((prev) => prev.filter((a) => a.id !== appId));
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
              placeholder="Search apps by title or slug..."
              className="bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-xs pl-9 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 w-full shadow-sm"
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

      {/* Applications Table Card */}
      <Card className="rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl overflow-hidden w-full shadow-sm">
        {filteredApps.length === 0 ? (
          <div className="py-12 sm:py-16 px-4 text-center space-y-3">
            <Package className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No applications found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              No applications match your selected filters. Try changing query filters or create a
              new application.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300 border-collapse table-fixed">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400 font-medium">
                  <th className="py-3 px-3.5 sm:px-4 font-semibold">Application</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden md:table-cell w-48 sm:w-52 whitespace-nowrap">Category</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-20 whitespace-nowrap">Version</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden sm:table-cell w-28 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold hidden xl:table-cell w-28 whitespace-nowrap">Updated</th>
                  <th className="py-3 px-3.5 sm:px-4 font-semibold text-right w-32 sm:w-36 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/50">
                {filteredApps.map((app) => {
                  const updatedDate = new Date(app.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                      {/* Name & Icon & Mobile Badge */}
                      <td className="py-3 px-3.5 sm:px-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            {app.iconUrl ? (
                              <img
                                src={app.iconUrl}
                                alt={app.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors text-xs sm:text-sm">
                              {app.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[110px] sm:max-w-[180px]">
                                /{app.slug}
                              </span>
                              {/* Mobile-only inline status badge */}
                              <span className="sm:hidden shrink-0">
                                {app.status === 'published' ? (
                                  <Badge variant="success" className="text-[9px] uppercase font-mono px-1 py-0 leading-tight">
                                    Live
                                  </Badge>
                                ) : app.status === 'draft' ? (
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
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-300 text-[11px] truncate max-w-[180px] inline-block align-middle">
                          {app.primaryCategory || 'General'}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell font-mono text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {app.currentVersion || 'v0.1.0'}
                      </td>

                      {/* Status Badge (desktop / tablet) */}
                      <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                        {app.status === 'published' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Published
                          </Badge>
                        ) : app.status === 'draft' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0.5">
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-3.5 sm:px-4 hidden xl:table-cell text-zinc-500 text-[11px] whitespace-nowrap">
                        {updatedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {app.status === 'published' && (
                            <Link
                              href={`/apps/${app.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/apps/${app.id}`}
                            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center"
                            title="Edit Application"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {app.status !== 'archived' && (
                            <IconButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleArchive(app.id)}
                              aria-label="Archive Application"
                              title="Archive Application"
                              icon={<Archive className="w-3.5 h-3.5" />}
                              className="rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            />
                          )}
                          <IconButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(app.id)}
                            disabled={isDeletingId === app.id}
                            loading={isDeletingId === app.id}
                            aria-label="Delete Application"
                            title="Delete Application"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            className="rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
