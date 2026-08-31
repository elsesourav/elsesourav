'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Container } from '@elsesourav/ui';
import { HomepageSkeleton } from '@/features/home/components/HomepageSkeleton';
import AppsLoading from '@/app/(public)/apps/loading';
import AppDetailLoading from '@/app/(public)/apps/[slug]/loading';
import BlogLoading from '@/app/(public)/notes/loading';
import BlogPostLoading from '@/app/(public)/notes/[slug]/loading';
import AboutLoading from '@/app/(public)/about/loading';
import HelpLoading from '@/app/(public)/help/loading';
import UserLoading from '@/app/(user)/loading';
import AdminLoading from '@/app/(admin)/loading';

export function SkeletonShowcaseClient() {
  const [activeTab, setActiveTab] = React.useState('home');

  return (
    <div className="min-h-screen py-10 space-y-8 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Container className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[hsl(var(--border))]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Unified Skeleton Loading System
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Structure-matched loading states for all primary ElseSourav views.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-mono text-[hsl(var(--subtle-foreground))] uppercase">
              View:
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1.5 p-1.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl">
            <TabsTrigger value="home">Homepage</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="app-detail">App Detail</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="note-detail">Note Detail</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
            <TabsTrigger value="user">User Dashboard</TabsTrigger>
            <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent
            value="home"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <HomepageSkeleton />
          </TabsContent>

          <TabsContent
            value="apps"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <AppsLoading />
          </TabsContent>

          <TabsContent
            value="app-detail"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <AppDetailLoading />
          </TabsContent>

          <TabsContent
            value="notes"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <BlogLoading />
          </TabsContent>

          <TabsContent
            value="note-detail"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <BlogPostLoading />
          </TabsContent>

          <TabsContent
            value="about"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <AboutLoading />
          </TabsContent>

          <TabsContent
            value="help"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <HelpLoading />
          </TabsContent>

          <TabsContent
            value="user"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <UserLoading />
          </TabsContent>

          <TabsContent
            value="admin"
            className="rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--surface-subtle))]/20 p-2 sm:p-4"
          >
            <AdminLoading />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}
