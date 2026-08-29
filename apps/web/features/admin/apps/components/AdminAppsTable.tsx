'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '@elsesourav/ui';
import type { App, CategorySummary } from '@elsesourav/types';
import { archiveAppAction, deleteAppAction } from '../actions/admin-app-actions';
import {
  Package,
  Search,
  Plus,
  ExternalLink,
  Edit,
  Archive,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface AdminAppsTableProps {
  initialApps: readonly App[];
  categories: readonly CategorySummary[];
}

export function AdminAppsTable({ initialApps, categories }: AdminAppsTableProps) {
  const [apps, setApps] = React.useState(initialApps);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

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
              placeholder="Search apps by title or slug..."
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

        {/* Create App Action */}
        <Link href="/admin/apps/new">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Application</span>
          </Button>
        </Link>
      </div>

      {/* Applications Table Card */}
      <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <Package className="w-10 h-10 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No applications found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              No applications match your selected filters. Try changing query filters or create a
              new application.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                  <th className="py-3.5 px-4 font-semibold">Application</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Category</th>
                  <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Version</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Updated</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredApps.map((app) => {
                  const updatedDate = new Date(app.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={app.id} className="hover:bg-zinc-800/30 transition-colors group">
                      {/* Name & Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            {app.iconUrl ? (
                              <img
                                src={app.iconUrl}
                                alt={app.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-100 truncate group-hover:text-indigo-300 transition-colors">
                              {app.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono truncate">
                              /{app.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 text-[11px]">
                          {app.primaryCategory || 'General'}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-3.5 px-4 hidden sm:table-cell font-mono text-[11px] text-zinc-400">
                        {app.currentVersion || 'v0.1.0'}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {app.status === 'published' ? (
                          <Badge variant="success" className="text-[10px] uppercase font-mono">
                            Published
                          </Badge>
                        ) : app.status === 'draft' ? (
                          <Badge variant="warning" className="text-[10px] uppercase font-mono">
                            Draft
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            Archived
                          </Badge>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-500 text-[11px]">
                        {updatedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'published' && (
                            <Link
                              href={`/apps/${app.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/apps/${app.id}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 transition-colors"
                            title="Edit Application"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          {app.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => handleArchive(app.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors"
                              title="Archive Application"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            disabled={isDeletingId === app.id}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Delete Application"
                          >
                            {isDeletingId === app.id ? (
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
