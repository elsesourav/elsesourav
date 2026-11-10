'use client';

import { isSafeUrl } from '@elsesourav/utils';
import {
  Check,
  Copy,
  Terminal,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ExternalLink,
} from 'lucide-react';
import * as React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface MarkdownRendererProps {
  content?: string | null;
  className?: string;
  fallbackText?: string;
  startHeadingLevel?: 1 | 2;
  interactiveChecklists?: boolean;
  onChecklistToggle?: (itemIndex: number, nextChecked: boolean) => void;
}

/**
 * Renders LaTeX math safely using KaTeX.
 */
export function MathFormula({
  math,
  displayMode = false,
  className = '',
}: {
  math: string;
  displayMode?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return null;
    }
  }, [math, displayMode]);

  const handleCopyTeX = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(math);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  if (!html) {
    return (
      <code className="text-rose-400 font-mono text-xs bg-rose-500/10 px-1.5 py-0.5 rounded">
        {math}
      </code>
    );
  }

  if (displayMode) {
    return (
      <div
        className={`group relative my-5 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-x-auto text-center shadow-sm select-text ${className}`}
      >
        <button
          type="button"
          onClick={handleCopyTeX}
          aria-label="Copy TeX equation"
          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 hover:text-white shadow-sm flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">TeX</span>
            </>
          )}
        </button>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="inline-block max-w-full text-zinc-100 py-1 text-[1.05em]"
        />
      </div>
    );
  }

  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className={`inline-block px-1 align-baseline text-inherit ${className}`}
    />
  );
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
    <div className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-[11px]">
        <span className="uppercase tracking-wider font-semibold text-zinc-300 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language || 'text'}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none text-[11px] cursor-pointer"
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
 * Helper to sanitize and format inline Markdown tokens including LaTeX Math.
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  const inlinePattern =
    /(\$([^\$\n]+)\$)|(!?\[([^\]]*)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*|_([^_]+)_)|(~~([^~]+)~~)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const [, , mathExpr, isLinkOrImg, linkText, linkUrlMatch, , codeText, , boldText, , italicTextStar, italicTextUnder, , strikeText] =
      match;

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
          const isExternal = rawLinkUrl.startsWith('http://') || rawLinkUrl.startsWith('https://');
          nodes.push(
            <a
              key={`link-${keyIndex++}`}
              href={rawLinkUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-medium transition-colors break-words focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded"
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
          className="px-1.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-indigo-400 text-xs font-mono break-words"
        >
          {codeText}
        </code>
      );
    } else if (boldText) {
      nodes.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-zinc-100">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      nodes.push(
        <em key={`italic-${keyIndex++}`} className="italic text-zinc-200">
          {italicText}
        </em>
      );
    } else if (strikeText) {
      nodes.push(
        <del key={`strike-${keyIndex++}`} className="line-through text-zinc-400">
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
 * Universal, Secure Markdown Content Renderer with KaTeX LaTeX math support.
 */
export function MarkdownRenderer({
  content,
  className = '',
  fallbackText,
  startHeadingLevel = 1,
  interactiveChecklists = true,
  onChecklistToggle,
}: MarkdownRendererProps) {
  const blocks = React.useMemo(() => {
    if (!content || typeof content !== 'string' || !content.trim()) {
      return null;
    }

    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let i = 0;
    let blockIndex = 0;
    let checklistIndex = 0;

    while (i < lines.length) {
      const line = lines[i] ?? '';

      // 1. Display Math Block: $$ ... $$
      if (line.trim().startsWith('$$')) {
        const mathLines: string[] = [];
        const isSingleLine =
          line.trim().length > 2 && line.trim().endsWith('$$') && line.trim() !== '$$';

        if (isSingleLine) {
          const stripped = line.trim().slice(2, -2);
          result.push(
            <MathFormula
              key={`math-block-${blockIndex++}`}
              math={stripped}
              displayMode={true}
            />
          );
          i++;
          continue;
        }

        i++;
        while (i < lines.length && !lines[i]?.trim().endsWith('$$')) {
          mathLines.push(lines[i] ?? '');
          i++;
        }
        i++; // skip closing $$
        result.push(
          <MathFormula
            key={`math-block-${blockIndex++}`}
            math={mathLines.join('\n')}
            displayMode={true}
          />
        );
        continue;
      }

      // 2. Fenced Code Blocks
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

      // 3. Headings (H1 to H6)
      if (line.startsWith('#')) {
        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1]!.length;
          const text = headingMatch[2]!;
          const effectiveLevel =
            startHeadingLevel === 2 ? Math.min(6, level + 1) : level;

          const headingStyles = {
            1: 'text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-10 mb-4 tracking-tight border-b border-zinc-800 pb-2',
            2: 'text-xl sm:text-2xl font-bold text-zinc-100 mt-8 mb-3 tracking-tight border-b border-zinc-800/60 pb-1.5',
            3: 'text-lg sm:text-xl font-semibold text-zinc-100 mt-6 mb-2 tracking-tight',
            4: 'text-base sm:text-lg font-semibold text-zinc-100 mt-5 mb-2',
            5: 'text-sm sm:text-base font-semibold text-zinc-200 mt-4 mb-1.5',
            6: 'text-xs sm:text-sm font-semibold text-zinc-400 uppercase tracking-wider mt-4 mb-1',
          }[effectiveLevel as 1 | 2 | 3 | 4 | 5 | 6];

          const HeadingTag = `h${effectiveLevel}` as
            | 'h1'
            | 'h2'
            | 'h3'
            | 'h4'
            | 'h5'
            | 'h6';

          result.push(
            React.createElement(
              HeadingTag,
              {
                key: `h-${blockIndex++}`,
                className: headingStyles,
              },
              renderInlineMarkdown(text)
            )
          );
          i++;
          continue;
        }
      }

      // 4. GitHub-style Callouts / Alerts: > [!NOTE], > [!TIP], > [!WARNING], etc.
      if (line.startsWith('> [!')) {
        const alertMatch = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
        if (alertMatch) {
          const alertType = alertMatch[1]!.toUpperCase();
          const alertLines: string[] = [];
          if (alertMatch[2]?.trim()) {
            alertLines.push(alertMatch[2].trim());
          }
          i++;
          while (i < lines.length && lines[i]?.startsWith('>')) {
            alertLines.push(lines[i]!.replace(/^>\s?/, ''));
            i++;
          }

          const alertConfig: Record<
            string,
            { label: string; icon: React.ReactNode; bg: string; border: string; text: string }
          > = {
            NOTE: {
              label: 'Note',
              icon: <Info className="w-4 h-4 text-blue-400" />,
              bg: 'bg-blue-950/30',
              border: 'border-blue-500/30',
              text: 'text-blue-400',
            },
            TIP: {
              label: 'Tip',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
              bg: 'bg-emerald-950/30',
              border: 'border-emerald-500/30',
              text: 'text-emerald-400',
            },
            IMPORTANT: {
              label: 'Important',
              icon: <Flame className="w-4 h-4 text-purple-400" />,
              bg: 'bg-purple-950/30',
              border: 'border-purple-500/30',
              text: 'text-purple-400',
            },
            WARNING: {
              label: 'Warning',
              icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
              bg: 'bg-amber-950/30',
              border: 'border-amber-500/30',
              text: 'text-amber-400',
            },
            CAUTION: {
              label: 'Caution',
              icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
              bg: 'bg-rose-950/30',
              border: 'border-rose-500/30',
              text: 'text-rose-400',
            },
          };

          const config = alertConfig[alertType] || alertConfig.NOTE!;

          result.push(
            <div
              key={`alert-${blockIndex++}`}
              className={`my-5 p-4 rounded-2xl border flex gap-3.5 ${config.bg} ${config.border}`}
            >
              <div className="shrink-0 mt-0.5">{config.icon}</div>
              <div className="flex-1 space-y-1 text-xs sm:text-sm text-zinc-200 leading-relaxed">
                <div className={`font-bold text-xs uppercase tracking-wide ${config.text}`}>
                  {config.label}
                </div>
                <div>{alertLines.map((al, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                    {renderInlineMarkdown(al)}
                  </p>
                ))}</div>
              </div>
            </div>
          );
          continue;
        }
      }

      // 5. Blockquotes: > text
      if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i]?.startsWith('>')) {
          quoteLines.push(lines[i]!.replace(/^>\s?/, ''));
          i++;
        }
        result.push(
          <blockquote
            key={`quote-${blockIndex++}`}
            className="my-4 pl-4 border-l-4 border-indigo-500 italic text-zinc-300 bg-zinc-900/40 py-2 pr-3 rounded-r-xl"
          >
            {quoteLines.map((ql, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                {renderInlineMarkdown(ql)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 6. Horizontal Rules
      if (line.trim().match(/^(---|---|\*\*\*|___)$/)) {
        result.push(
          <hr
            key={`hr-${blockIndex++}`}
            className="my-8 border-t border-zinc-800"
          />
        );
        i++;
        continue;
      }

      // 7. Markdown Tables
      if (line.includes('|') && lines[i + 1]?.includes('|') && lines[i + 1]?.includes('-')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i]?.includes('|')) {
          tableLines.push(lines[i]!.trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]!
            .split('|')
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => c.trim());

          const alignDefs = tableLines[1]!
            .split('|')
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => {
              const trimmed = c.trim();
              if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
              if (trimmed.endsWith(':')) return 'right';
              return 'left';
            });

          const bodyRows = tableLines.slice(2).map((rowLine) =>
            rowLine
              .split('|')
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
              .map((c) => c.trim())
          );

          result.push(
            <div
              key={`table-${blockIndex++}`}
              className="my-6 w-full overflow-x-auto rounded-2xl border border-zinc-800 shadow-sm"
            >
              <table className="w-full border-collapse text-xs sm:text-sm text-left">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-300">
                    {headerCells.map((header, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 font-semibold uppercase tracking-wider text-xs ${
                          alignDefs[idx] === 'center'
                            ? 'text-center'
                            : alignDefs[idx] === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {renderInlineMarkdown(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/70 text-zinc-200">
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-4 py-2.5 leading-relaxed ${
                            alignDefs[cIdx] === 'center'
                              ? 'text-center'
                              : alignDefs[cIdx] === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
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

      // 8. Task Lists / Checklists
      if (line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/)) {
        const taskItems: Array<{ checked: boolean; text: string; itemIdx: number }> = [];
        while (i < lines.length) {
          const taskMatch = lines[i]?.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/);
          if (!taskMatch) break;
          const checked = taskMatch[2]!.toLowerCase() === 'x';
          const text = taskMatch[3]!;
          taskItems.push({ checked, text, itemIdx: checklistIndex++ });
          i++;
        }

        result.push(
          <ul key={`tasks-${blockIndex++}`} className="my-3 space-y-1.5 text-xs sm:text-sm">
            {taskItems.map((task) => (
              <li key={task.itemIdx} className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={task.checked}
                  disabled={!interactiveChecklists}
                  onChange={(e) => onChecklistToggle?.(task.itemIdx, e.target.checked)}
                  className="mt-1 rounded accent-indigo-500 cursor-pointer w-4 h-4"
                />
                <span className={`leading-relaxed ${task.checked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                  {renderInlineMarkdown(task.text)}
                </span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // 9. Unordered Lists
      if (line.match(/^[-*+]\s+(.*)$/)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i]?.match(/^[-*+]\s+(.*)$/)) {
          const match = lines[i]!.match(/^[-*+]\s+(.*)$/);
          listItems.push(match![1]!);
          i++;
        }
        result.push(
          <ul
            key={`ul-${blockIndex++}`}
            className="my-3 list-disc list-outside pl-5 space-y-1 text-xs sm:text-sm text-zinc-200 leading-relaxed"
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // 10. Ordered Lists
      if (line.match(/^\d+\.\s+(.*)$/)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i]?.match(/^\d+\.\s+(.*)$/)) {
          const match = lines[i]!.match(/^\d+\.\s+(.*)$/);
          listItems.push(match![1]!);
          i++;
        }
        result.push(
          <ol
            key={`ol-${blockIndex++}`}
            className="my-3 list-decimal list-outside pl-5 space-y-1 text-xs sm:text-sm text-zinc-200 leading-relaxed"
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInlineMarkdown(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // 11. Empty lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // 12. Standard Paragraph
      const paragraphLines: string[] = [];
      while (
        i < lines.length &&
        lines[i]?.trim() &&
        !lines[i]?.startsWith('#') &&
        !lines[i]?.startsWith('```') &&
        !lines[i]?.startsWith('$$') &&
        !lines[i]?.startsWith('>') &&
        !lines[i]?.match(/^[-*+]\s+/) &&
        !lines[i]?.match(/^\d+\.\s+/) &&
        !lines[i]?.match(/^(---|---|\*\*\*|___)$/) &&
        !lines[i]?.includes('|')
      ) {
        paragraphLines.push(lines[i]!);
        i++;
      }

      if (paragraphLines.length > 0) {
        result.push(
          <p
            key={`p-${blockIndex++}`}
            className="my-3 text-xs sm:text-sm text-zinc-200 leading-relaxed break-words"
          >
            {renderInlineMarkdown(paragraphLines.join(' '))}
          </p>
        );
      }
    }

    return result;
  }, [content, startHeadingLevel, interactiveChecklists, onChecklistToggle]);

  if (!blocks || blocks.length === 0) {
    if (fallbackText) {
      return (
        <div className={`text-xs text-zinc-500 italic py-6 ${className}`}>
          {fallbackText}
        </div>
      );
    }
    return null;
  }

  return <div className={`markdown-prose max-w-full font-sans ${className}`}>{blocks}</div>;
}
