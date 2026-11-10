'use client';

import * as React from 'react';
import { MarkdownRenderer } from './markdown-renderer';
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  Columns,
  HelpCircle,
  Maximize2,
  Minimize2,
  Trash2,
  Sigma,
  Variable,
} from 'lucide-react';

export type MarkdownEditorMode = 'write' | 'preview' | 'split';

export interface AdminMarkdownEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: number | string;
  required?: boolean;
  helperText?: string;
  mode?: MarkdownEditorMode;
  defaultMode?: MarkdownEditorMode;
  onModeChange?: (mode: MarkdownEditorMode) => void;
  showToolbar?: boolean;
}

export function AdminMarkdownEditor({
  label,
  value,
  onChange,
  placeholder = 'Write Markdown with headings, code blocks, lists, and LaTeX math formulas ($E=mc^2$ or $$\\int_0^1 x dx$$)...',
  rows = 14,
  minHeight = '360px',
  required = false,
  helperText,
  mode: controlledMode,
  defaultMode = 'split',
  onModeChange,
  showToolbar = true,
}: AdminMarkdownEditorProps) {
  const isModeControlled = controlledMode !== undefined;
  const [internalMode, setInternalMode] = React.useState<MarkdownEditorMode>(defaultMode);
  const currentMode = isModeControlled ? controlledMode : internalMode;

  const [showCheatsheet, setShowCheatsheet] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleModeChange = (nextMode: MarkdownEditorMode) => {
    if (!isModeControlled) {
      setInternalMode(nextMode);
    }
    onModeChange?.(nextMode);
  };

  const insertSnippet = (prefix: string, suffix: string = '', placeholderText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const selected = previous.substring(start, end);

    const insertion = `${prefix}${selected || placeholderText}${suffix}`;
    const nextVal = previous.substring(0, start) + insertion + previous.substring(end);

    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      const selectionStart = start + prefix.length;
      const selectionEnd = selectionStart + (selected ? selected.length : placeholderText.length);
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }, 0);
  };

  const wordCount = React.useMemo(() => {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
  }, [value]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div
      className={`space-y-2 ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-6 bg-zinc-950/95 backdrop-blur-md overflow-y-auto flex flex-col justify-start'
          : ''
      }`}
    >
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label ? (
          <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-300">
            {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
          </label>
        ) : (
          <div className="text-xs font-semibold text-zinc-300">Markdown & Math Editor</div>
        )}

        <div className="flex items-center gap-1.5">
          {/* Markdown Tips Toggle */}
          <button
            type="button"
            onClick={() => setShowCheatsheet((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer"
            title="Markdown syntax reference"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Guide</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Mode Switcher Tabs */}
          <div
            role="tablist"
            className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
          >
            <button
              type="button"
              role="tab"
              aria-selected={currentMode === 'write'}
              onClick={() => handleModeChange('write')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                currentMode === 'write'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentMode === 'split'}
              onClick={() => handleModeChange('split')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                currentMode === 'split'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={currentMode === 'preview'}
              onClick={() => handleModeChange('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                currentMode === 'preview'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cheatsheet */}
      {showCheatsheet && (
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200 text-[11px] uppercase tracking-wider">
              Markdown Syntax Reference
            </span>
            <span className="text-[10px] text-indigo-400">KaTeX Math Enabled</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">## Heading 2</code>
            </div>
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">**Bold Text**</code>
            </div>
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">*Italic Text*</code>
            </div>
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">~~Strike~~</code>
            </div>
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">$E = mc^2$</code> (Inline)
            </div>
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">{'$$\\int_0^\\infty e^{-x}dx$$'}</code>
            </div>
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">- [x] Done task</code>
            </div>
            <div>
              <code className="text-indigo-600 dark:text-indigo-300">&gt; [!NOTE]</code> (Callout)
            </div>
          </div>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm flex flex-col flex-1">
        {/* Toolbar */}
        {showToolbar && currentMode !== 'preview' && (
          <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
            <button
              type="button"
              onClick={() => insertSnippet('# ', '', 'Heading 1')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('## ', '', 'Heading 2')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('### ', '', 'Heading 3')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertSnippet('**', '**', 'bold text')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('*', '*', 'italic text')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('~~', '~~', 'strikethrough text')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('`', '`', 'code')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            {/* Math Formula Buttons */}
            <button
              type="button"
              onClick={() => insertSnippet('$', '$', 'E = mc^2')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 text-indigo-400 rounded transition-colors cursor-pointer"
              title="Insert Inline Math ($formula$)"
            >
              <Variable className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">$f(x)$</span>
            </button>
            <button
              type="button"
              onClick={() =>
                insertSnippet('$$\n', '\n$$\n', '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}')
              }
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 text-indigo-400 rounded transition-colors cursor-pointer"
              title="Insert Display Math Block ($$ ... $$)"
            >
              <Sigma className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">$$\Sigma$$</span>
            </button>
            <span className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertSnippet('> ', '', 'quote')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('- ', '', 'item')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('1. ', '', 'item')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('- [ ] ', '', 'task')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Checklist"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertSnippet('[', '](https://)', 'link')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('![', '](https://...)', 'alt')}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertSnippet('| Column 1 | Column 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n', '')
              }
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('```typescript\n', '\n```\n', '// code')}
              className="px-2 py-1 text-[11px] font-mono hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded transition-colors cursor-pointer"
              title="Code Block"
            >
              &lt;/&gt;
            </button>
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 text-zinc-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                title="Clear content"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div
          className={`flex-1 grid min-h-[300px] ${
            currentMode === 'split'
              ? 'grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800'
              : 'grid-cols-1'
          }`}
          style={{ minHeight }}
        >
          {(currentMode === 'write' || currentMode === 'split') && (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              required={required}
              rows={rows}
              className="w-full h-full min-h-[320px] p-4 bg-transparent border-0 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono leading-relaxed resize-none selection:bg-indigo-500/30"
            />
          )}

          {(currentMode === 'preview' || currentMode === 'split') && (
            <div className="h-full p-5 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/80 min-h-[320px]">
              {value.trim() ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-zinc-400 text-xs italic">
                  <Eye className="w-8 h-8 mb-2 opacity-30 text-indigo-400" />
                  <span>Nothing to preview yet. Switch to &ldquo;Write&rdquo; to draft content.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
        <span>{helperText || 'Supports GFM + KaTeX Math ($...$ and $$...$$)'}</span>
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>{value.length} characters</span>
        </div>
      </div>
    </div>
  );
}

export const MarkdownEditor = AdminMarkdownEditor;
