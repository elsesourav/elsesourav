'use client';

import * as React from 'react';

export interface OtpBoxesProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function OtpBoxes({ value, onChange, disabled }: OtpBoxesProps) {
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const next = [...digits];
        next[index] = '';
        onChange(next.join('').trimEnd());
      }
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    const joined = next.join('');
    onChange(joined);
    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) {
      onChange(text.padEnd(6, ''));
      const focusIdx = Math.min(text.length, 5);
      inputsRef.current[focusIdx]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex items-center gap-2 justify-center py-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 bg-slate-50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 transition-all outline-none
            ${digits[i] ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-white/10'}
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25
            disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}
