'use client';

import { isSafeUrl } from '@elsesourav/utils';
import { Check, Copy, Terminal } from 'lucide-react';
import * as React from 'react';

export interface MarkdownRendererProps {
  content?: string | null;
  className?: string;
  fallbackText?: string;
  startHeadingLevel?: 1 | 2;
}

/**
 * Performant, Accessible Code Block with copy-to-clipboard functionality
 */
export function MarkdownCodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-[hsl(var(--border))] bg-zinc-950 text-zinc-100 font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-[11px]">
        <span className="uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language || 'text'}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none text-[11px]"
          aria-label="Copy code snippet to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto max-w-full text-zinc-200 leading-relaxed font-mono selection:bg-indigo-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Helper to sanitize and format inline Markdown tokens
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  // Patterns for Markdown links, inline code, bold, italic, strikethrough
  const inlinePattern =
    /(!?\[([^\]]*)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(~~([^~]+)~~)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    const isLinkOrImg = match[1];
    const linkText = match[2] || '';
    const rawLinkUrl = match[3] || '';
    const isCode = match[4];
    const codeText = match[5] || '';
    const isBold = match[6];
    const boldText = match[7] || '';
    const isItalic = match[8];
    const italicText = match[9] || '';
    const isStrikethrough = match[10];
    const strikeText = match[11] || '';

    if (isLinkOrImg) {
      if (fullMatch.startsWith('!')) {
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
              className="block my-6 rounded-2xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] shadow-md"
            >
              <img
                src={rawLinkUrl}
                alt={linkText || 'Content visual'}
                className="w-full h-auto max-h-[550px] object-cover"
                loading="lazy"
              />
              {linkText ? (
                <span className="block px-4 py-2 text-center text-[11px] text-[hsl(var(--muted-foreground))] italic bg-[hsl(var(--card))] border-t border-[hsl(var(--border-subtle))]">
                  {linkText}
                </span>
              ) : null}
            </span>
          );
        }
      } else {
        // Safe Markdown Link (XSS Protected)
        const isSafe = isSafeUrl(rawLinkUrl);
        if (isSafe) {
          const isExternal = rawLinkUrl.startsWith('http://') || rawLinkUrl.startsWith('https://');
          nodes.push(
            <a
              key={`link-${keyIndex++}`}
              href={rawLinkUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-medium transition-colors break-words focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded"
            >
              {linkText || rawLinkUrl}
            </a>
          );
        } else {
          // Dangerous link protocol stripped for XSS prevention
          nodes.push(linkText || rawLinkUrl);
        }
      }
    } else if (isCode) {
      nodes.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded-md bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border-subtle))] text-indigo-600 dark:text-indigo-300 text-xs font-mono break-words"
        >
          {codeText}
        </code>
      );
    } else if (isBold) {
      nodes.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-[hsl(var(--foreground))]">
          {boldText}
        </strong>
      );
    } else if (isItalic) {
      nodes.push(
        <em key={`italic-${keyIndex++}`} className="italic text-[hsl(var(--foreground))]">
          {italicText}
        </em>
      );
    } else if (isStrikethrough) {
      nodes.push(
        <del
          key={`strike-${keyIndex++}`}
          className="line-through text-[hsl(var(--muted-foreground))]"
        >
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

/**
 * Universal, Secure Markdown Content Renderer
 */
export function MarkdownRenderer({
  content,
  className = '',
  fallbackText,
  startHeadingLevel = 1,
}: MarkdownRendererProps) {
  const blocks = React.useMemo(() => {
    if (!content || typeof content !== 'string' || !content.trim()) {
      return null;
    }

    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let i = 0;
    let blockIndex = 0;

    while (i < lines.length) {
      const line = lines[i] ?? '';

      // 1. Fenced Code Blocks
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i]?.startsWith('```')) {
          codeLines.push(lines[i] ?? '');
          i++;
        }
        i++; // skip closing ```
        result.push(
          <MarkdownCodeBlock
            key={`code-block-${blockIndex++}`}
            code={codeLines.join('\n')}
            language={language}
          />
        );
        continue;
      }

      // 2. Headings (H1 to H6)
      if (line.startsWith('# ')) {
        const text = line.slice(2);
        if (startHeadingLevel === 2) {
          result.push(
            <h2
              key={`h2-${blockIndex++}`}
              className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-3 tracking-tight border-b border-[hsl(var(--border-subtle))] pb-2"
            >
              {renderInlineMarkdown(text)}
            </h2>
          );
        } else {
          result.push(
            <h1
              key={`h1-${blockIndex++}`}
              className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--foreground))] mt-10 mb-4 tracking-tight"
            >
              {renderInlineMarkdown(text)}
            </h1>
          );
        }
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        const text = line.slice(3);
        if (startHeadingLevel === 2) {
          result.push(
            <h3
              key={`h3-${blockIndex++}`}
              className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] mt-6 mb-2 tracking-tight"
            >
              {renderInlineMarkdown(text)}
            </h3>
          );
        } else {
          result.push(
            <h2
              key={`h2-${blockIndex++}`}
              className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] mt-8 mb-3 tracking-tight border-b border-[hsl(var(--border-subtle))] pb-2"
            >
              {renderInlineMarkdown(text)}
            </h2>
          );
        }
        i++;
        continue;
      }

      if (line.startsWith('### ')) {
        const text = line.slice(4);
        if (startHeadingLevel === 2) {
          result.push(
            <h4
              key={`h4-${blockIndex++}`}
              className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] mt-5 mb-2 tracking-tight"
            >
              {renderInlineMarkdown(text)}
            </h4>
          );
        } else {
          result.push(
            <h3
              key={`h3-${blockIndex++}`}
              className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] mt-6 mb-2 tracking-tight"
            >
              {renderInlineMarkdown(text)}
            </h3>
          );
        }
        i++;
        continue;
      }

      if (line.startsWith('#### ')) {
        const text = line.slice(5);
        if (startHeadingLevel === 2) {
          result.push(
            <h5
              key={`h5-${blockIndex++}`}
              className="text-sm sm:text-base font-semibold text-[hsl(var(--muted-foreground))] mt-4 mb-2 tracking-tight uppercase tracking-wider"
            >
              {renderInlineMarkdown(text)}
            </h5>
          );
        } else {
          result.push(
            <h4
              key={`h4-${blockIndex++}`}
              className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] mt-5 mb-2 tracking-tight"
            >
              {renderInlineMarkdown(text)}
            </h4>
          );
        }
        i++;
        continue;
      }

      if (line.startsWith('##### ')) {
        const text = line.slice(6);
        if (startHeadingLevel === 2) {
          result.push(
            <h6
              key={`h6-${blockIndex++}`}
              className="text-xs sm:text-sm font-semibold text-[hsl(var(--muted-foreground))] mt-3 mb-1 tracking-tight uppercase tracking-wider"
            >
              {renderInlineMarkdown(text)}
            </h6>
          );
        } else {
          result.push(
            <h5
              key={`h5-${blockIndex++}`}
              className="text-sm sm:text-base font-semibold text-[hsl(var(--muted-foreground))] mt-4 mb-2 tracking-tight uppercase tracking-wider"
            >
              {renderInlineMarkdown(text)}
            </h5>
          );
        }
        i++;
        continue;
      }

      if (line.startsWith('###### ')) {
        const text = line.slice(7);
        result.push(
          <h6
            key={`h6-${blockIndex++}`}
            className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mt-2 mb-1 tracking-tight uppercase tracking-wider"
          >
            {renderInlineMarkdown(text)}
          </h6>
        );
        i++;
        continue;
      }

      // 3. Horizontal Rules
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        result.push(
          <hr key={`hr-${blockIndex++}`} className="my-8 border-[hsl(var(--border-subtle))]" />
        );
        i++;
        continue;
      }

      // 4. Blockquotes
      if (line.startsWith('> ')) {
        const quoteLines: string[] = [line.slice(2)];
        i++;
        while (i < lines.length && lines[i]?.startsWith('> ')) {
          quoteLines.push(lines[i]?.slice(2) ?? '');
          i++;
        }
        result.push(
          <blockquote
            key={`quote-${blockIndex++}`}
            className="my-6 pl-4 border-l-4 border-indigo-500 bg-indigo-500/10 py-3 pr-4 rounded-r-2xl text-[hsl(var(--foreground))] italic text-sm leading-relaxed"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
                {renderInlineMarkdown(ql)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 5. Tables (GFM Markdown Table Syntax)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [line];
        i++;
        while (
          i < lines.length &&
          lines[i]?.trim().startsWith('|') &&
          lines[i]?.trim().endsWith('|')
        ) {
          tableLines.push(lines[i]!.trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerRow =
            tableLines[0]
              ?.split('|')
              .slice(1, -1)
              .map((c) => c.trim()) || [];

          // Parse alignments if second row is separator
          const alignRow =
            tableLines.length > 1
              ? tableLines[1]
                  ?.split('|')
                  .slice(1, -1)
                  .map((c) => {
                    const t = c.trim();
                    if (t.startsWith(':') && t.endsWith(':')) return 'center';
                    if (t.endsWith(':')) return 'right';
                    return 'left';
                  }) || []
              : [];

          const dataRows = tableLines.slice(2).map((row) =>
            row
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim())
          );

          result.push(
            <div
              key={`table-${blockIndex++}`}
              className="my-6 overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
            >
              <table className="min-w-full divide-y divide-[hsl(var(--border-subtle))] text-left text-xs sm:text-sm">
                <thead className="bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] font-semibold">
                  <tr>
                    {headerRow.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        scope="col"
                        className={`px-4 py-3 font-semibold text-[hsl(var(--foreground))] text-${alignRow[hIdx] || 'left'}`}
                      >
                        {renderInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border-subtle))] text-[hsl(var(--foreground))]">
                  {dataRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-[hsl(var(--surface-subtle))] transition-colors"
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className={`px-4 py-2.5 text-${alignRow[cIdx] || 'left'}`}>
                          {renderInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 6. Task Checklists & Unordered Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems: string[] = [line.slice(2)];
        i++;
        while (i < lines.length && (lines[i]?.startsWith('- ') || lines[i]?.startsWith('* '))) {
          listItems.push(lines[i]!.slice(2));
          i++;
        }
        result.push(
          <ul
            key={`ul-${blockIndex++}`}
            className="my-4 space-y-2 list-disc list-inside text-sm text-[hsl(var(--foreground))] leading-relaxed pl-2"
          >
            {listItems.map((item, itemIdx) => {
              const isTaskChecked = item.startsWith('[x] ') || item.startsWith('[X] ');
              const isTaskUnchecked = item.startsWith('[ ] ');

              if (isTaskChecked || isTaskUnchecked) {
                return (
                  <li key={itemIdx} className="list-none flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isTaskChecked}
                      readOnly
                      disabled
                      aria-label="Task item"
                      className="rounded border-[hsl(var(--input))] bg-[hsl(var(--surface-subtle))] text-indigo-500 w-4 h-4 cursor-default"
                    />
                    <span>{renderInlineMarkdown(item.slice(4))}</span>
                  </li>
                );
              }

              return <li key={itemIdx}>{renderInlineMarkdown(item)}</li>;
            })}
          </ul>
        );
        continue;
      }

      // 7. Ordered Lists (1. 2. 3.)
      if (/^\d+\.\s/.test(line)) {
        const listItems: string[] = [line.replace(/^\d+\.\s/, '')];
        i++;
        while (i < lines.length && /^\d+\.\s/.test(lines[i] || '')) {
          listItems.push(lines[i]!.replace(/^\d+\.\s/, ''));
          i++;
        }
        result.push(
          <ol
            key={`ol-${blockIndex++}`}
            className="my-4 space-y-2 list-decimal list-inside text-sm text-[hsl(var(--foreground))] leading-relaxed pl-2"
          >
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx}>{renderInlineMarkdown(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // 8. Empty Lines
      if (line.trim() === '') {
        i++;
        continue;
      }

      // 9. Regular Paragraphs
      const paragraphLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i]?.trim() !== '' &&
        !lines[i]?.startsWith('#') &&
        !lines[i]?.startsWith('```') &&
        !lines[i]?.startsWith('> ') &&
        !lines[i]?.startsWith('- ') &&
        !lines[i]?.startsWith('* ') &&
        !lines[i]?.startsWith('|') &&
        !lines[i]?.trim().startsWith('---') &&
        !/^\d+\.\s/.test(lines[i] || '')
      ) {
        paragraphLines.push(lines[i] ?? '');
        i++;
      }

      result.push(
        <p
          key={`p-${blockIndex++}`}
          className="my-4 text-sm sm:text-base text-[hsl(var(--foreground))] leading-relaxed font-normal break-words"
        >
          {renderInlineMarkdown(paragraphLines.join(' '))}
        </p>
      );
    }

    return result;
  }, [content, startHeadingLevel]);

  if (!blocks) {
    if (fallbackText) {
      return (
        <div className="py-6 text-center text-xs text-[hsl(var(--muted-foreground))] italic">
          {fallbackText}
        </div>
      );
    }
    return null;
  }

  return (
    <article
      className={`max-w-none text-[hsl(var(--foreground))] leading-relaxed break-words ${className}`}
    >
      {blocks}
    </article>
  );
}
