'use client';

import * as React from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import {
  Code,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  List,
  Table as TableIcon,
  Link as LinkIcon,
  Eye,
  Edit3,
  HelpCircle,
} from 'lucide-react';

export interface AdminMarkdownEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  helperText?: string;
}

export function AdminMarkdownEditor({
  label,
  value,
  onChange,
  placeholder = 'Write Markdown content with headings, code blocks, lists, and links...',
  rows = 14,
  required = false,
  helperText,
}: AdminMarkdownEditorProps) {
  const [mode, setMode] = React.useState<'edit' | 'preview'>('edit');
  const [showCheatsheet, setShowCheatsheet] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const replacement = `${before}${selectedText || 'text'}${after}`;
    const nextValue =
      previousText.substring(0, start) +
      replacement +
      previousText.substring(end);

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText ? selectedText.length : 4)
      );
    }, 0);
  };

  const wordCount = React.useMemo(() => {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
  }, [value]);

  return (
    <div className="space-y-2">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-semibold text-zinc-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>

        <div className="flex items-center gap-1.5">
          {/* Markdown Tips Toggle */}
          <button
            type="button"
            onClick={() => setShowCheatsheet((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800/60"
            title="Markdown syntax reference"
          >
            <HelpCircle className="w-3 h-3 text-indigo-400" />
            <span>Guide</span>
          </button>

          {/* Mode Switcher Tabs */}
          <div
            role="tablist"
            className="flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-800"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'edit'}
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                mode === 'edit'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'preview'}
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                mode === 'preview'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional Markdown Cheatsheet */}
      {showCheatsheet && (
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-2 animate-in fade-in">
          <div className="font-semibold text-zinc-200 text-[11px] uppercase tracking-wider">
            Markdown Syntax Reference
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <code className="text-indigo-300">## Heading 2</code>
            </div>
            <div>
              <code className="text-indigo-300">**Bold Text**</code>
            </div>
            <div>
              <code className="text-indigo-300">*Italic Text*</code>
            </div>
            <div>
              <code className="text-indigo-300">[Link](https://...)</code>
            </div>
            <div>
              <code className="text-indigo-300">- List item</code>
            </div>
            <div>
              <code className="text-indigo-300">- [x] Checklist</code>
            </div>
            <div>
              <code className="text-indigo-300">&gt; Blockquote</code>
            </div>
            <div>
              <code className="text-indigo-300">```lang ... ```</code>
            </div>
          </div>
        </div>
      )}

      {/* Editor Body */}
      {mode === 'edit' ? (
        <div className="space-y-2">
          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-950/40 border border-zinc-800/80 rounded-t-xl text-zinc-400">
            <button
              type="button"
              onClick={() => insertSnippet('## ', '')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Heading 2"
              aria-label="Add Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('### ', '')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Heading 3"
              aria-label="Add Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertSnippet('**', '**')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Bold"
              aria-label="Add Bold Text"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('*', '*')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Italic"
              aria-label="Add Italic Text"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('`', '`')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Inline Code"
              aria-label="Add Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertSnippet('> ', '')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Blockquote"
              aria-label="Add Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('- ', '')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Bullet List"
              aria-label="Add Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('[', '](https://)')}
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Link"
              aria-label="Add Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertSnippet(
                  '| Column 1 | Column 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n'
                )
              }
              className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Table"
              aria-label="Add Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('```typescript\n', '\n```')}
              className="px-2 py-1 text-[11px] font-mono hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Code Block"
              aria-label="Add Code Block"
            >
              &lt;/&gt;
            </button>
          </div>

          {/* Monospace Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-b-xl -mt-2 p-3.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none font-mono leading-relaxed resize-y selection:bg-indigo-500/30"
          />
        </div>
      ) : (
        /* Live Preview Container */
        <div className="min-h-[300px] p-5 rounded-xl border border-zinc-800 bg-zinc-950/90 overflow-y-auto">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-xs italic">
              <Eye className="w-8 h-8 mb-2 opacity-40" />
              <span>Nothing to preview yet. Switch to &ldquo;Write&rdquo; to draft content.</span>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
        <span>{helperText || 'Supports GitHub-Flavored Markdown (GFM)'}</span>
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>{value.length} characters</span>
        </div>
      </div>
    </div>
  );
}
