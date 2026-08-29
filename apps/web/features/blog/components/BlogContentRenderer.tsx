'use client';

import * as React from 'react';
import {
  MarkdownRenderer,
  MarkdownCodeBlock,
  type MarkdownRendererProps,
} from '@/components/markdown/MarkdownRenderer';

export type BlogContentRendererProps = MarkdownRendererProps;

/**
 * BlogCodeBlock - Backward-compatible alias to MarkdownCodeBlock
 */
export const BlogCodeBlock = MarkdownCodeBlock;

/**
 * BlogContentRenderer - Canonical shared Markdown renderer for devlogs and articles
 */
export function BlogContentRenderer({ content, className = '' }: BlogContentRendererProps) {
  return <MarkdownRenderer content={content} className={className} />;
}
