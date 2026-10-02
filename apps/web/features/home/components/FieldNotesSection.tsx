'use client';

import * as React from 'react';
import Link from 'next/link';
import { Section, SectionHeader, Container, Reveal } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import type { BlogPostListItem } from '@elsesourav/types';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

interface FieldNotesSectionProps {
  posts: readonly BlogPostListItem[];
  totalCount: number;
  title?: string | null;
  subtitle?: string | null;
}

export function FieldNotesSection({ posts, totalCount, title, subtitle }: FieldNotesSectionProps) {
  if (!posts || posts.length === 0) return null;

  const leadPost = posts[0];
  const supportingPosts = posts.slice(1, 3);

  return (
    <Section id="updates" spacing="lg" className="border-t border-[hsl(var(--border))]/80">
      <Container size="lg">
        <Reveal direction="up" distance={14}>
          <SectionHeader
            align="split"
            caption="Updates"
            title={title || 'Latest Updates'}
            description={
              subtitle ||
              'Things I write about while building software, learning tools, and solving architectural problems.'
            }
            actions={
              <Link
                href={ROUTES.BLOG}
                className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-1 group"
              >
                <span>Read all updates {totalCount > 0 ? `(${totalCount})` : ''}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            }
          />
        </Reveal>

        <div className="pt-4">
          {posts.length >= 2 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* Left Column: Emphasized Lead Editorial Essay */}
              {leadPost && (
                <Reveal direction="up" distance={16} delay={0.06} className="lg:col-span-7">
                  <Link
                    href={`/notes/${leadPost.slug}`}
                    className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                  >
                    <article className="h-full border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--surface-subtle))] hover:border-cyan-500/50 p-6 sm:p-8 md:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-cyan-500/10 group-hover:-translate-y-1 active:scale-[0.99] active:translate-y-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-[hsl(var(--border-subtle))]">
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Update // {leadPost.category?.name || 'Architecture'}</span>
                          </span>
                          <span className="text-[hsl(var(--muted-foreground))] text-xs font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{leadPost.readingTime} min read</span>
                          </span>
                        </div>

                        <h3 className="font-bold text-2xl sm:text-3xl text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors leading-tight">
                          {leadPost.title}
                        </h3>

                        <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-3">
                          {leadPost.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-[hsl(var(--border-subtle))] text-xs text-[hsl(var(--muted-foreground))]">
                        {leadPost.publishedAt ? (
                          <time
                            dateTime={new Date(leadPost.publishedAt).toISOString()}
                            className="font-mono text-[hsl(var(--muted-foreground))] uppercase"
                          >
                            {new Date(leadPost.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                          </time>
                        ) : (
                          <span className="text-[hsl(var(--muted-foreground))] font-mono">
                            Published Recently
                          </span>
                        )}
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                          <span>Read update</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              )}

              {/* Right Column: Archival Index Stream of Supporting Notes */}
              {supportingPosts.length > 0 && (
                <Reveal
                  direction="up"
                  distance={16}
                  delay={0.12}
                  className="lg:col-span-5 flex flex-col justify-between divide-y divide-[hsl(var(--border-subtle))] rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-7 backdrop-blur-sm shadow-md"
                >
                  {supportingPosts.map((post: BlogPostListItem, idx: number) => {
                    const formattedIdx = String(idx + 1).padStart(2, '0');
                    return (
                      <Link
                        key={post.id}
                        href={`/notes/${post.slug}`}
                        className="group block py-5 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl"
                      >
                        <article className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-600 dark:text-cyan-400 font-bold text-xs bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                {formattedIdx}
                              </span>
                              <span className="text-cyan-600 dark:text-cyan-400 font-medium uppercase tracking-wider text-[11px]">
                                {post.category?.name || 'Update'}
                              </span>
                            </div>
                            {post.publishedAt ? (
                              <time
                                dateTime={new Date(post.publishedAt).toISOString()}
                                className="uppercase text-[11px]"
                              >
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: '2-digit',
                                  year: 'numeric',
                                })}{' '}
                                · {post.readingTime}m
                              </time>
                            ) : (
                              <span>{post.readingTime} min read</span>
                            )}
                          </div>

                          <h4 className="font-bold text-base text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>

                          <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="pt-1 flex items-center text-xs text-cyan-600 dark:text-cyan-400 font-semibold gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Read update</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </Reveal>
              )}
            </div>
          ) : (
            leadPost && (
              <Reveal direction="up" distance={16} className="max-w-3xl mx-auto">
                <Link
                  href={`/notes/${leadPost.slug}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-3xl"
                >
                  <article className="border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--surface-subtle))] hover:border-cyan-500/50 p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between backdrop-blur-md group-hover:shadow-2xl group-hover:shadow-cyan-500/10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-[hsl(var(--border-subtle))]">
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                          Update // {leadPost.category?.name || 'Architecture'}
                        </span>
                        <span className="text-[hsl(var(--muted-foreground))] text-xs font-mono">
                          {leadPost.readingTime} min read
                        </span>
                      </div>
                      <h3 className="font-bold text-2xl sm:text-3xl text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-200 transition-colors leading-tight">
                        {leadPost.title}
                      </h3>
                      <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
                        {leadPost.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-[hsl(var(--border-subtle))] text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="font-mono text-[hsl(var(--muted-foreground))]">
                        {leadPost.publishedAt
                          ? new Date(leadPost.publishedAt).toLocaleDateString()
                          : 'Recently'}
                      </span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                        <span>Read update</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              </Reveal>
            )
          )}

          {/* Bottom Exploration Link */}
          <Reveal direction="up" distance={10} delay={0.15}>
            <div className="text-center pt-8 sm:pt-10">
              <Link
                href={ROUTES.BLOG}
                className="inline-flex items-center gap-2 text-xs font-mono text-[hsl(var(--muted-foreground))] hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-1"
              >
                <span>Read all updates and technical write-ups ({totalCount} articles)</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
