'use client';

import * as React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Check, Copy } from 'lucide-react';

export interface MathFormulaProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Renders LaTeX math safely using KaTeX with accessible copy-TeX functionality.
 */
export function MathFormula({
  math,
  displayMode = false,
  className = '',
}: MathFormulaProps) {
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
          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 hover:text-white shadow-sm flex items-center gap-1 cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
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
