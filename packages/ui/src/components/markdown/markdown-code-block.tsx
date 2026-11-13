'use client';

import * as React from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { highlight, type LanguageName } from 'sugar-high';
import { lang } from 'sugar-high/lang';

export interface MarkdownCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

/**
 * Friendly display labels for code block header badges
 */
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript (TSX)',
  typescript: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript (JSX)',
  javascript: 'JavaScript',
  py: 'Python',
  python: 'Python',
  sh: 'Bash',
  bash: 'Bash',
  zsh: 'Zsh',
  shell: 'Shell',
  rs: 'Rust',
  rust: 'Rust',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  cs: 'C#',
  csharp: 'C#',
  go: 'Go',
  golang: 'Go',
  html: 'HTML',
  htm: 'HTML',
  css: 'CSS',
  json: 'JSON',
  jsonc: 'JSON',
  sql: 'SQL',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
  wasm: 'WebAssembly',
  wat: 'WebAssembly',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  diff: 'Diff',
  toml: 'TOML',
  swift: 'Swift',
  kotlin: 'Kotlin',
  java: 'Java',
  php: 'PHP',
  ruby: 'Ruby',
  rb: 'Ruby',
  lua: 'Lua',
  zig: 'Zig',
};

/**
 * Performant, Accessible Code Block with real-time Syntax Highlighting
 * and theme-adaptive token styling matching ElseSourav's dark-first aesthetic.
 */
export function MarkdownCodeBlock({
  code,
  language = '',
  showLineNumbers,
  className = '',
}: MarkdownCodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const cleanLang = React.useMemo(() => {
    return (language || '').toLowerCase().trim();
  }, [language]);

  const displayLanguage = React.useMemo(() => {
    if (!cleanLang) return 'Code';
    return LANGUAGE_DISPLAY_NAMES[cleanLang] || cleanLang.toUpperCase();
  }, [cleanLang]);

  // Determine line count to decide whether to show line numbers automatically
  const lineCount = React.useMemo(() => {
    if (!code) return 0;
    return code.split('\n').length;
  }, [code]);

  const shouldShowLines = showLineNumbers ?? lineCount > 2;

  // Generate syntax-highlighted HTML synchronously
  const highlightedHtml = React.useMemo(() => {
    if (!code) return '';
    try {
      // Resolve canonical language supported by sugar-high
      let targetLang: LanguageName | undefined;
      if (cleanLang) {
        targetLang = lang(cleanLang);
        // Custom alias fallbacks
        if (!targetLang && (cleanLang === 'wasm' || cleanLang === 'wat')) {
          targetLang = 'c';
        }
      }

      return highlight(code, {
        lang: targetLang,
      });
    } catch {
      // Safe fallback if highlighting throws on malformed snippets
      return '';
    }
  }, [code, cleanLang]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted in sandbox
    }
  };

  return (
    <div
      className={`my-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#070810] text-zinc-900 dark:text-zinc-100 font-mono text-xs shadow-xl transition-colors ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-200/50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-[11px] select-none">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>{displayLanguage}</span>
          </span>
          {lineCount > 1 && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-300/40 dark:bg-zinc-800/60 font-sans">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-300/60 dark:bg-zinc-800/80 hover:bg-zinc-300 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none text-[11px] cursor-pointer"
          aria-label="Copy code snippet to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 opacity-70" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto max-w-full text-zinc-900 dark:text-zinc-200 leading-relaxed font-mono selection:bg-primary/25">
        {highlightedHtml ? (
          <code
            className={`sh-code-theme block font-mono ${
              shouldShowLines ? 'has-line-numbers' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <code className="block font-mono">{code}</code>
        )}
      </pre>
    </div>
  );
}
