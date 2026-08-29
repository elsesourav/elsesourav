'use client';

import * as React from 'react';
import Image from 'next/image';
import { Copy, Check, Terminal } from 'lucide-react';
import { isSafeUrl } from '@elsesourav/utils';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
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
    <div className="my-6 rounded-xl overflow-hidden border border-border bg-zinc-950 font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-subtle border-b border-border-subtle text-muted-foreground text-[11px]">
        <span className="uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-primary" /> {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label="Copy code snippet to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span className="text-success font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-200 leading-relaxed font-mono selection:bg-indigo-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Helper to sanitize and format inline Markdown tokens
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const nodes: React.ReactNode[] = [];
  const tokenRegex =
    /(!?\[([^\]]*)\]\(((?:[^()]+|\([^()]*\))+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(~~([^~]+)~~)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
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
              className="block my-6 relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-border bg-surface-subtle"
            >
              <Image
                src={rawLinkUrl}
                alt={linkText || 'Content visual'}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
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
              className="text-primary hover:text-indigo-300 underline underline-offset-4 font-medium transition-colors break-words focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded"
            >
              {linkText}
            </a>
          );
        } else {
          nodes.push(linkText);
        }
      }
    } else if (isCode) {
      nodes.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded-md bg-surface-subtle border border-border-strong text-indigo-300 text-xs font-mono break-words"
        >
          {codeText}
        </code>
      );
    } else if (isBold) {
      nodes.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-foreground">
          {boldText}
        </strong>
      );
    } else if (isItalic) {
      nodes.push(
        <em key={`italic-${keyIndex++}`} className="italic text-zinc-200">
          {italicText}
        </em>
      );
    } else if (isStrikethrough) {
      nodes.push(
        <del key={`del-${keyIndex++}`} className="line-through text-muted-foreground">
          {strikeText}
        </del>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}

/**
 * Universal, Secure Markdown Content Renderer
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const blocks = React.useMemo(() => {
    if (!content || typeof content !== 'string') return [];

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

      // 2. Headings (H1 to H4)
      if (line.startsWith('# ')) {
        result.push(
          <h1
            key={`h1-${blockIndex++}`}
            className="text-2xl sm:text-3xl font-extrabold text-foreground mt-10 mb-4 tracking-tight"
          >
            {renderInlineMarkdown(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        result.push(
          <h2
            key={`h2-${blockIndex++}`}
            className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 tracking-tight border-b border-border pb-2"
          >
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }

      if (line.startsWith('### ')) {
        result.push(
          <h3
            key={`h3-${blockIndex++}`}
            className="text-lg sm:text-xl font-bold text-zinc-100 mt-6 mb-2 tracking-tight"
          >
            {renderInlineMarkdown(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      if (line.startsWith('#### ')) {
        result.push(
          <h4
            key={`h4-${blockIndex++}`}
            className="text-base sm:text-lg font-semibold text-zinc-200 mt-4 mb-2 tracking-tight"
          >
            {renderInlineMarkdown(line.slice(5))}
          </h4>
        );
        i++;
        continue;
      }

      // 3. Horizontal Rules
      if (line.trim() === '---' || line.trim() === '***') {
        result.push(<hr key={`hr-${blockIndex++}`} className="my-8 border-border-subtle" />);
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
            className="my-6 pl-4 border-l-4 border-primary bg-indigo-950/20 py-3 pr-4 rounded-r-xl text-zinc-300 italic text-sm"
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

          // Ignore separator row (index 1) if it contains dashes
          const dataRows = tableLines.slice(2).map((row) =>
            row
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim())
          );

          result.push(
            <div
              key={`table-${blockIndex++}`}
              className="my-6 overflow-x-auto rounded-xl border border-border bg-surface-subtle"
            >
              <table className="min-w-full divide-y divide-border text-left text-xs sm:text-sm">
                <thead className="bg-surface text-foreground font-semibold">
                  <tr>
                    {headerRow.map((h, hIdx) => (
                      <th key={hIdx} scope="col" className="px-4 py-3">
                        {renderInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-zinc-300">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-surface-elevated/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5">
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
            className="my-4 space-y-2 list-disc list-inside text-sm text-zinc-300 leading-relaxed pl-2"
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
                      className="rounded border-zinc-700 bg-zinc-900 text-primary w-4 h-4"
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
            className="my-4 space-y-2 list-decimal list-inside text-sm text-zinc-300 leading-relaxed pl-2"
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
          className="my-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal break-words"
        >
          {renderInlineMarkdown(paragraphLines.join(' '))}
        </p>
      );
    }

    return result;
  }, [content]);

  return <article className={`prose-zinc max-w-none text-zinc-300 ${className}`}>{blocks}</article>;
}
