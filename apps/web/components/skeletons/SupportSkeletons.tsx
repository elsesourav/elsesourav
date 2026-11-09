import * as React from 'react';
import { Card, PageShell, Skeleton, SkeletonBadge } from '@elsesourav/ui';
import { HelpArticleCardSkeleton } from '@/features/help/components/HelpSkeleton';

/**
 * Responsive skeleton for the public Support Desk (/support).
 * Matches the layout of CreateTicketForm, header, and knowledge-base callout card.
 */
export function SupportDeskPageSkeleton() {
  return (
    <PageShell size="lg" glow aria-busy="true">
      <div className="space-y-8 sm:space-y-12 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <SkeletonBadge className="w-28 h-6" />
            <SkeletonBadge className="w-24 h-6" />
          </div>
          <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4 max-w-lg rounded-xl" />
          <Skeleton className="h-4 sm:h-5 w-full max-w-xl rounded-md" />
        </div>

        {/* Shortcut Button Skeleton */}
        <div className="flex justify-center -mt-2 sm:-mt-4">
          <Skeleton className="h-8 sm:h-9 w-48 sm:w-56 rounded-xl" />
        </div>

        {/* Ticket Submission Card */}
        <div className="max-w-2xl mx-auto w-full">
          <Card className="p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-border bg-card space-y-5 sm:space-y-6">
            <div className="space-y-2 pb-4 border-b border-border">
              <Skeleton className="h-5 sm:h-6 w-44 rounded-lg" />
              <Skeleton className="h-3.5 sm:h-4 w-72 max-w-full rounded-md" />
            </div>

            <div className="space-y-4 sm:space-y-5">
              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-10 sm:h-11 w-full rounded-xl" />
              </div>

              {/* Priority Dropdown */}
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-10 sm:h-11 w-full rounded-xl" />
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-10 sm:h-11 w-full rounded-xl" />
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-28 sm:h-32 w-full rounded-xl" />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Skeleton className="h-10 sm:h-11 w-full rounded-xl" />
              </div>
            </div>
          </Card>
        </div>

        {/* Knowledge Base Help-First Callout */}
        <Card className="p-3 sm:p-4 rounded-2xl border border-border bg-card max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-3 w-64 max-w-full rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-xl shrink-0 self-start sm:self-auto" />
        </Card>
      </div>
    </PageShell>
  );
}

/**
 * Responsive skeleton for user's Support Tickets list (/support/tickets).
 * Matches PageHeader, filter tabs, and ticket card items.
 */
export function SupportTicketsPageSkeleton() {
  return (
    <PageShell size="lg" glow padded={false} aria-busy="true">
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBadge className="w-28 h-5" />
            <Skeleton className="h-7 sm:h-9 w-52 sm:w-64 rounded-xl" />
            <Skeleton className="h-4 w-72 max-w-full rounded-md" />
          </div>

          <div className="flex items-center gap-2.5 shrink-0 sm:pt-4">
            <Skeleton className="h-8 sm:h-9 w-32 rounded-xl" />
            <Skeleton className="h-8 sm:h-9 w-28 rounded-xl" />
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-3 sm:pb-4">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-muted/50 border border-border">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-28 rounded" />
        </div>

        {/* Ticket Items List */}
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="p-3.5 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl border border-border/70 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <SkeletonBadge className="w-16 h-5" />
                  <SkeletonBadge className="w-20 h-5" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-3/4 max-w-md rounded-md" />
                <Skeleton className="h-3.5 w-5/6 max-w-lg rounded" />
              </div>
              <Skeleton className="h-8 w-20 rounded-xl shrink-0 self-end sm:self-auto" />
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

/**
 * Responsive skeleton for a single Support Ticket conversation (/support/tickets/[id]).
 */
export function SupportTicketDetailSkeleton() {
  return (
    <PageShell size="lg" glow aria-busy="true">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* Ticket Header Card */}
        <Card className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-border bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-4 w-24 rounded font-mono" />
                <SkeletonBadge className="w-16 h-5" />
                <SkeletonBadge className="w-20 h-5" />
              </div>
              <Skeleton className="h-6 sm:h-8 w-3/4 max-w-lg rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl shrink-0 self-start sm:self-auto" />
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-border/60 text-xs">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        </Card>

        {/* Messages Thread */}
        <div className="space-y-4 sm:space-y-5">
          {/* User message */}
          <Card className="p-3.5 sm:p-4.5 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1 min-w-0">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            <div className="space-y-2 pl-12">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </Card>

          {/* Support response */}
          <Card className="p-3.5 sm:p-4.5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1 min-w-0">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <div className="space-y-2 pl-12">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          </Card>
        </div>

        {/* Reply Composer Box */}
        <Card className="p-3.5 sm:p-4.5 rounded-2xl border border-border bg-card space-y-3">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

/**
 * Responsive skeleton for Category Articles page (/help/[categorySlug]).
 */
export function HelpCategoryArticlesSkeleton() {
  return (
    <PageShell size="lg" glow aria-busy="true">
      <div className="space-y-8 sm:space-y-12">
        {/* Navigation & Breadcrumbs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 rounded-xl" />
                <SkeletonBadge className="w-16 h-5" />
              </div>
              <Skeleton className="h-4 w-72 max-w-full rounded-md" />
            </div>

            <div className="w-full sm:w-80">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <HelpArticleCardSkeleton key={i} />
          ))}
        </div>

        {/* Support CTA Banner */}
        <Card className="p-4 sm:p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded mx-auto sm:mx-0" />
            <Skeleton className="h-3.5 w-64 rounded mx-auto sm:mx-0" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
        </Card>
      </div>
    </PageShell>
  );
}
