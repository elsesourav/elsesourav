'use client';

import * as React from 'react';
import { Card, Badge } from '@elsesourav/ui';
import { Dropdown, FloatingLabelInput } from '@elsesourav/ui/interior';
import { Sliders, ShieldCheck } from 'lucide-react';

interface AdminAppVisibilitySettingsProps {
  categoryId: string;
  setCategoryId: (val: string) => void;
  categoryItems: { value: string; label: string }[];
  status: 'draft' | 'published' | 'archived';
  setStatus: (val: 'draft' | 'published' | 'archived') => void;
  statusItems: { value: string; label: string }[];
  sortOrder: number;
  setSortOrder: (val: number) => void;
  isFeatured: boolean;
  setIsFeatured: (val: boolean) => void;
  isPinned: boolean;
  setIsPinned: (val: boolean) => void;
  requiresAuth: boolean;
  setRequiresAuth: (val: boolean) => void;
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  seoDescription: string;
  setSeoDescription: (val: string) => void;
}

export function AdminAppVisibilitySettings({
  categoryId,
  setCategoryId,
  categoryItems,
  status,
  setStatus,
  statusItems,
  sortOrder,
  setSortOrder,
  isFeatured,
  setIsFeatured,
  isPinned,
  setIsPinned,
  requiresAuth,
  setRequiresAuth,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
}: AdminAppVisibilitySettingsProps) {
  return (
    <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 backdrop-blur-xl space-y-4 sm:space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
        <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Taxonomy & Visibility</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Primary Category <span className="text-rose-400">*</span>
          </label>
          <Dropdown
            items={categoryItems}
            value={categoryId}
            onChange={(val) => setCategoryId(val)}
            className="w-full"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Publish Status</label>
          <Dropdown
            items={statusItems}
            value={status}
            onChange={(val) => setStatus(val as 'draft' | 'published' | 'archived')}
            className="w-full"
          />
        </div>

        {/* Sort Order */}
        <FloatingLabelInput
          label="Display Sort Order"
          type="number"
          value={String(sortOrder)}
          onChange={(val) => setSortOrder(Number(val))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800/60">
        {/* Featured Switch */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 cursor-pointer">
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Featured Application</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Highlights app on homepage hero spotlight.
            </div>
          </div>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
        </label>

        {/* Pinned Switch */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 cursor-pointer">
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Pinned to Top</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Always ranks first in catalog grids.</div>
          </div>
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
        </label>

        {/* Access Control: Require Login Switch */}
        <label className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/60 cursor-pointer hover:border-amber-500/40 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                <span>Require User Authentication (Login Required)</span>
                {requiresAuth ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5"
                  >
                    Members Only
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5"
                  >
                    Public Access
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {requiresAuth
                  ? 'Unauthorized guests cannot launch or access this project without signing in.'
                  : 'Public project: Anyone can visit and launch this project freely without signing in.'}
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={requiresAuth}
            onChange={(e) => setRequiresAuth(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-amber-500 focus:ring-amber-500 w-4 h-4 shrink-0"
          />
        </label>
      </div>

      {/* SEO Configuration */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/60 space-y-3">
        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">SEO & Meta Information (Optional)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingLabelInput
            label="SEO Meta Title"
            type="text"
            value={seoTitle}
            onChange={(val) => setSeoTitle(val)}
            placeholder="Custom title tag for search engines"
            maxLength={100}
          />
          <FloatingLabelInput
            label="SEO Meta Description"
            type="text"
            value={seoDescription}
            onChange={(val) => setSeoDescription(val)}
            placeholder="Brief summary for search engine snippet"
            maxLength={200}
          />
        </div>
      </div>
    </Card>
  );
}
