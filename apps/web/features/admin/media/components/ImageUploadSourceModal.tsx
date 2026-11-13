'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Button, Card } from '@elsesourav/ui';
import { HardDrive, ClipboardPaste, Upload, X, AlertCircle, Sparkles } from 'lucide-react';

export interface ImageUploadSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile?: (file: File) => void;
  onSelectFiles?: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  description?: string;
}

export function ImageUploadSourceModal({
  isOpen,
  onClose,
  onSelectFile,
  onSelectFiles,
  multiple = false,
  title = 'Upload Image',
  description = 'Choose how you want to add this image',
}: ImageUploadSourceModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [clipboardError, setClipboardError] = React.useState<string | null>(null);
  const [isReadingClipboard, setIsReadingClipboard] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock
  React.useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Handle global paste event (Cmd+V / Ctrl+V)
  React.useEffect(() => {
    if (!isOpen) return;

    const handleWindowPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        if (multiple && onSelectFiles) {
          onSelectFiles(pastedFiles);
        } else if (onSelectFile && pastedFiles[0]) {
          onSelectFile(pastedFiles[0]);
        }
        onClose();
        return;
      }

      setClipboardError('Pasted content did not contain an image. Please copy an image first.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handleWindowPaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, multiple, onSelectFile, onSelectFiles, onClose]);

  if (!isOpen || !mounted) return null;
  const targetHost = typeof document !== 'undefined' ? document.body : null;
  if (!targetHost) return null;

  // Handler for file picker
  const handleDeviceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      setClipboardError('Please select a valid image file');
      return;
    }

    if (multiple && onSelectFiles) {
      onSelectFiles(files);
    } else if (onSelectFile && files[0]) {
      onSelectFile(files[0]);
    }
    onClose();
  };

  // Handler for clipboard read button
  const handlePasteFromClipboard = async () => {
    setIsReadingClipboard(true);
    setClipboardError(null);

    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        const files: File[] = [];

        for (const item of clipboardItems) {
          const imageType = item.types.find((type) => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const ext = imageType.split('/')[1] || 'png';
            const file = new File([blob], `clipboard-${Date.now()}-${files.length}.${ext}`, {
              type: imageType,
            });
            files.push(file);
          }
        }

        if (files.length > 0) {
          if (multiple && onSelectFiles) {
            onSelectFiles(files);
          } else if (onSelectFile && files[0]) {
            onSelectFile(files[0]);
          }
          onClose();
          return;
        }

        setClipboardError(
          'No image found in clipboard. Copy an image first, or press ⌘V / Ctrl+V to paste.'
        );
      } else {
        setClipboardError(
          'Direct clipboard reading is not supported by your browser. Please press ⌘V / Ctrl+V to paste.'
        );
      }
    } catch {
      setClipboardError(
        'Clipboard permission denied or unavailable. Please press ⌘V / Ctrl+V to paste your image directly.'
      );
    } finally {
      setIsReadingClipboard(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-source-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99995] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="upload-source-modal-title"
                className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
              >
                {title}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden device input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          className="hidden"
          onChange={handleDeviceFileChange}
        />

        {clipboardError && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{clipboardError}</span>
          </div>
        )}

        {/* Source Selection Buttons */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          {/* 1. Upload from Device */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-105 transition-all shrink-0 shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Upload from Device
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Files
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Browse images from computer or phone storage
              </p>
            </div>
          </button>

          {/* 2. Upload from Clipboard */}
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            disabled={isReadingClipboard}
            className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:scale-105 transition-all shrink-0 shadow-xs">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Upload from Clipboard</span>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  ⌘V / Ctrl+V
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Paste copied screenshot or image from clipboard
              </p>
            </div>
          </button>
        </div>

        {/* Quick Paste Dropzone Hint */}
        <div
          tabIndex={0}
          onClick={handlePasteFromClipboard}
          className="p-3 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors select-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-800 dark:text-zinc-200 font-bold">⌘V</kbd> or <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-800 dark:text-zinc-200 font-bold">Ctrl+V</kbd> anywhere in this popup to upload immediately
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>,
    targetHost
  );
}
