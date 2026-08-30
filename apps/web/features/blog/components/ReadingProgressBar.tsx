'use client';

import * as React from 'react';

/**
 * ReadingProgressBar - Minimal, unobtrusive, accessible reading progress bar.
 * Calculates scroll percentage across the document and smoothly animates at the top edge of the viewport.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight =
            document.documentElement.scrollHeight - document.documentElement.clientHeight;

          if (docHeight > 0) {
            const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
            setProgress(pct);
          } else {
            setProgress(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (progress <= 0) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
