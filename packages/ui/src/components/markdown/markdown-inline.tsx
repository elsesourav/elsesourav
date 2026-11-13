'use client';

import * as React from 'react';
import { isSafeUrl } from '@elsesourav/utils';
import { ExternalLink } from 'lucide-react';
import { MathFormula } from './markdown-math';

/**
 * Helper to sanitize and format inline Markdown tokens including LaTeX Math.
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  const inlinePattern =
    /(\$([^$\n]+)\$)|(!?\[([^\]]*)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*|_([^_]+)_)|(~~([^~]+)~~)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const [
      ,
      ,
      mathExpr,
      isLinkOrImg,
      linkText,
      linkUrlMatch,
      ,
      codeText,
      ,
      boldText,
      ,
      italicTextStar,
      italicTextUnder,
      ,
      strikeText,
    ] = match;

    const rawLinkUrl = linkUrlMatch || '';
    const italicText = italicTextStar || italicTextUnder;

    if (mathExpr) {
      nodes.push(
        <MathFormula
          key={`math-inline-${keyIndex++}`}
          math={mathExpr}
          displayMode={false}
        />
      );
    } else if (isLinkOrImg) {
      if (isLinkOrImg.startsWith('!')) {
        // Safe Markdown Image
        if (
          isSafeUrl(rawLinkUrl) &&
          (rawLinkUrl.startsWith('https://') ||
            rawLinkUrl.startsWith('http://') ||
            rawLinkUrl.startsWith('/'))
        ) {
          nodes.push(
            <span
              key={`img-${keyIndex++}`}
              className="block my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 shadow-md"
            >
              <img
                src={rawLinkUrl}
                alt={linkText || 'Content visual'}
                className="w-full h-auto max-h-[550px] object-cover"
                loading="lazy"
              />
              {linkText ? (
                <span className="block px-4 py-2 text-center text-[11px] text-zinc-400 italic bg-zinc-900 border-t border-zinc-800">
                  {linkText}
                </span>
              ) : null}
            </span>
          );
        }
      } else {
        // Safe Markdown Link
        const isSafe = isSafeUrl(rawLinkUrl);
        if (isSafe) {
          const isExternal =
            rawLinkUrl.startsWith('http://') || rawLinkUrl.startsWith('https://');
          nodes.push(
            <a
              key={`link-${keyIndex++}`}
              href={rawLinkUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium transition-colors break-words focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded"
            >
              <span>{linkText || rawLinkUrl}</span>
              {isExternal && <ExternalLink className="w-3 h-3 opacity-60 inline ml-0.5" />}
            </a>
          );
        } else {
          nodes.push(linkText || rawLinkUrl);
        }
      }
    } else if (codeText) {
      nodes.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 dark:text-indigo-300 text-xs font-mono break-words"
        >
          {codeText}
        </code>
      );
    } else if (boldText) {
      nodes.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-foreground">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      nodes.push(
        <em key={`italic-${keyIndex++}`} className="italic text-foreground/90">
          {italicText}
        </em>
      );
    } else if (strikeText) {
      nodes.push(
        <del key={`strike-${keyIndex++}`} className="line-through text-muted-foreground">
          {strikeText}
        </del>
      );
    }

    lastIndex = inlinePattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}
