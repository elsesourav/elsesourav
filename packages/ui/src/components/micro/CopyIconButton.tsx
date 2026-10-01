'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy } from 'lucide-react';

export interface CopyIconButtonProps {
  value: string;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onCopy?: (value: string) => void;
}

export default function CopyIconButton({
  value,
  label = 'Copy',
  size = 'xs',
  className = '',
  onCopy,
}: CopyIconButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!value) return;

      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          const area = document.createElement('textarea');
          area.value = value;
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
        }
        setCopied(true);
        onCopy?.(value);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    },
    [value, onCopy]
  );

  const sizeClasses = {
    xs: 'w-6 h-6 p-1 text-[11px]',
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-8 h-8 p-2 text-sm',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size];

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied to clipboard!' : label}
      className={`relative inline-flex items-center justify-center rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer select-none active:scale-90 ${sizeClasses} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="text-emerald-500 flex items-center justify-center"
          >
            <Check className={iconSizes} strokeWidth={2.5} />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex items-center justify-center"
          >
            <Copy className={iconSizes} strokeWidth={1.8} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
