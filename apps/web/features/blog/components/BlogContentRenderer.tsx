'use client';

import * as React from 'react';
import Image from 'next/image';
import { Copy, Check } from 'lucide-react';
import { isSafeUrl } from '@elsesourav/utils';

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

export function BlogCodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-[11px]">
        <span className="uppercase tracking-wider font-semibold text-zinc-300">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-200 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenRegex = /(!?\[([^\]]*)\]\(((?:[^()]+|\([^()]*\))+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

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

    if (isLinkOrImg) {
      if (fullMatch.startsWith('!')) {
        // Image
        if (isSafeUrl(rawLinkUrl) && (rawLinkUrl.startsWith('https://') || rawLinkUrl.startsWith('http://') || rawLinkUrl.startsWith('/'))) {
          nodes.push(
            <span key={`img-${keyIndex++}`} className="block my-6 relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-800">
              <Image
                src={rawLinkUrl}
                alt={linkText || 'Article image'}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            </span>
          );
        }
      } else {
        // Safe Link
        const isSafe = isSafeUrl(rawLinkUrl);
        if (isSafe) {
          const isExternal = rawLinkUrl.startsWith('http://') || rawLinkUrl.startsWith('https://');
          nodes.push(
            <a
              key={`link-${keyIndex++}`}
              href={rawLinkUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-medium transition-colors"
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
          className="px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-indigo-300 text-xs font-mono"
        >
          {codeText}
        </code>
      );
    } else if (isBold) {
      nodes.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-zinc-100">
          {boldText}
        </strong>
      );
    } else if (isItalic) {
      nodes.push(
        <em key={`italic-${keyIndex++}`} className="italic text-zinc-200">
          {italicText}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}

export function BlogContentRenderer({ content, className = '' }: BlogContentRendererProps) {
  const blocks = React.useMemo(() => {
    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    let i = 0;
    let blockIndex = 0;

    while (i < lines.length) {
      const line = lines[i] ?? '';

      // Fenced Code Block
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
          <BlogCodeBlock
            key={`code-block-${blockIndex++}`}
            code={codeLines.join('\n')}
            language={language}
          />
        );
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        result.push(
          <h1 key={`h1-${blockIndex++}`} className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-10 mb-4 tracking-tight">
            {renderInlineFormatting(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        result.push(
          <h2 key={`h2-${blockIndex++}`} className="text-xl sm:text-2xl font-bold text-zinc-100 mt-8 mb-3 tracking-tight border-b border-zinc-800/80 pb-2">
            {renderInlineFormatting(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }

      if (line.startsWith('### ')) {
        result.push(
          <h3 key={`h3-${blockIndex++}`} className="text-lg sm:text-xl font-bold text-zinc-200 mt-6 mb-2 tracking-tight">
            {renderInlineFormatting(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquotes
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
            className="my-6 pl-4 border-l-4 border-indigo-500 bg-indigo-950/20 py-3 pr-4 rounded-r-xl text-zinc-300 italic text-sm"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
                {renderInlineFormatting(ql)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // Unordered Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems: string[] = [line.slice(2)];
        i++;
        while (i < lines.length && (lines[i]?.startsWith('- ') || lines[i]?.startsWith('* '))) {
          listItems.push(lines[i]?.slice(2) ?? '');
          i++;
        }
        result.push(
          <ul key={`ul-${blockIndex++}`} className="my-4 space-y-2 list-disc list-inside text-sm text-zinc-300 leading-relaxed pl-2">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx}>{renderInlineFormatting(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Empty Lines
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Regular Paragraphs
      const paragraphLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i]?.trim() !== '' &&
        !lines[i]?.startsWith('#') &&
        !lines[i]?.startsWith('```') &&
        !lines[i]?.startsWith('> ') &&
        !lines[i]?.startsWith('- ') &&
        !lines[i]?.startsWith('* ')
      ) {
        paragraphLines.push(lines[i] ?? '');
        i++;
      }

      result.push(
        <p key={`p-${blockIndex++}`} className="my-4 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
          {renderInlineFormatting(paragraphLines.join(' '))}
        </p>
      );
    }

    return result;
  }, [content]);

  return <article className={`prose-zinc max-w-none text-zinc-300 ${className}`}>{blocks}</article>;
}
