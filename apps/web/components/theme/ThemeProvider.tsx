'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark' | 'system';
export type EffectsLevel = 'high' | 'medium' | 'low';

export interface ThemeTransitionOrigin {
  clientX?: number;
  clientY?: number;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (
    theme: Theme,
    origin?: ThemeTransitionOrigin | React.MouseEvent | MouseEvent
  ) => void;
  effectsLevel: EffectsLevel;
  setEffectsLevel: (level: EffectsLevel) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
  effectsLevel: 'high',
  setEffectsLevel: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function useEffectsLevel() {
  const { effectsLevel, setEffectsLevel } = React.useContext(ThemeContext);
  return { effectsLevel, setEffectsLevel };
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const d = document.documentElement;
  d.classList.remove('dark', 'light');
  d.classList.add(resolved);
  d.setAttribute('data-theme', resolved);
}

interface ViewTransitionHandle {
  skipTransition?: () => void;
  ready?: Promise<void>;
  finished?: Promise<void>;
}

export function ThemeProvider({
  children,
  initialEffects = 'high',
}: {
  children: React.ReactNode;
  initialEffects?: EffectsLevel;
}) {
  const [theme, setThemeState] = React.useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('dark');
  const [effectsLevel, setEffectsLevelState] = React.useState<EffectsLevel>(initialEffects);

  const themeRef = React.useRef<Theme>('dark');
  themeRef.current = theme;

  const activeTransitionRef = React.useRef<ViewTransitionHandle | null>(null);

  // Initialize effectsLevel strictly from server attribute (backend DB) or URL param
  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryEffects = urlParams.get('effects') as EffectsLevel | null;
      const attr = document.documentElement.getAttribute('data-effects') as EffectsLevel | null;
      const eff: EffectsLevel =
        queryEffects === 'low' || queryEffects === 'medium' || queryEffects === 'high'
          ? queryEffects
          : attr === 'low' || attr === 'medium' || attr === 'high'
            ? attr
            : initialEffects;

      setEffectsLevelState(eff);
      document.documentElement.setAttribute('data-effects', eff);
      try {
        localStorage.removeItem('effects_level');
      } catch {
        // fallback
      }
    } catch {
      // fallback
    }
  }, [initialEffects]);

  const setEffectsLevel = React.useCallback((level: EffectsLevel) => {
    setEffectsLevelState(level);
    document.documentElement.setAttribute('data-effects', level);
  }, []);

  // Initialize from URL param or localStorage on mount
  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryTheme = urlParams.get('theme') as Theme | null;
      const stored = localStorage.getItem('theme') as Theme | null;
      const t =
        queryTheme === 'light' || queryTheme === 'dark' || queryTheme === 'system'
          ? queryTheme
          : stored === 'light' || stored === 'system'
            ? stored
            : 'dark';
      setThemeState(t);
      themeRef.current = t;

      const resolved = t === 'system' ? getSystemTheme() : t;
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch {
      // localStorage unavailable — stay on dark
    }
  }, []);

  // Listen for system preference changes when in 'system' mode
  React.useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';

      const supportsViewTransitions =
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

      const originX = typeof window !== 'undefined' ? Math.round(window.innerWidth / 2) : 500;
      const originY = 0;
      const endRadius =
        typeof window !== 'undefined'
          ? Math.ceil(Math.hypot(originX, window.innerHeight)) + 32
          : 2500;

      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--theme-x', `${originX}px`);
        document.documentElement.style.setProperty('--theme-y', `${originY}px`);
        document.documentElement.style.setProperty('--theme-radius', `${endRadius}px`);
      }

      const update = () => {
        setResolvedTheme(resolved);
        applyTheme(resolved);
      };

      if (supportsViewTransitions) {
        try {
          if (activeTransitionRef.current?.skipTransition) {
            try {
              activeTransitionRef.current.skipTransition();
            } catch {
              // Ignore skip error
            }
          }

          const doc = document as Document & {
            startViewTransition?: (callback: () => void) => ViewTransitionHandle;
          };
          const transition = doc.startViewTransition?.(() => {
            flushSync(() => {
              update();
            });
          });

          if (transition) {
            activeTransitionRef.current = transition;

            transition.ready
              ?.then(() => {
                try {
                  const anim = document.documentElement.animate(
                    {
                      clipPath: [
                        `circle(0px at ${originX}px ${originY}px)`,
                        `circle(${endRadius}px at ${originX}px ${originY}px)`,
                      ],
                    },
                    {
                      duration: 500,
                      easing: 'ease-in-out',
                      pseudoElement: '::view-transition-new(root)',
                      fill: 'forwards',
                    }
                  );
                  anim.addEventListener('error', () => {});
                } catch {
                  // Fallback
                }
              })
              .catch(() => {});

            transition.finished
              ?.catch(() => {})
              .finally(() => {
                if (activeTransitionRef.current === transition) {
                  activeTransitionRef.current = null;
                }
              });
          } else {
            update();
          }
        } catch {
          update();
        }
      } else {
        update();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = React.useCallback(
    (
      newTheme: Theme,
      origin?: ThemeTransitionOrigin | React.MouseEvent | MouseEvent
    ) => {
      if (newTheme === themeRef.current) return;
      themeRef.current = newTheme;

      const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;

      // 1. Feature detection: check for View Transitions API and prefers-reduced-motion
      const supportsViewTransitions =
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

      // 2. Resolve pixel-perfect origin: from passed event or dynamically from Theme Button DOM rect
      let x =
        origin && typeof origin.clientX === 'number' && origin.clientX > 0
          ? Math.round(origin.clientX)
          : null;
      let y =
        origin && typeof origin.clientY === 'number' && origin.clientY > 0
          ? Math.round(origin.clientY)
          : null;

      if (typeof window !== 'undefined' && (x === null || y === null)) {
        // Query the theme trigger icon in the header for exact anchor
        const triggerEl = document.querySelector('[aria-label="Change theme"]');
        if (triggerEl) {
          const rect = triggerEl.getBoundingClientRect();
          x = Math.round(rect.left + rect.width / 2);
          y = Math.round(rect.top + rect.height / 2);
        } else {
          x = Math.round(window.innerWidth * 0.85);
          y = 28;
        }
      }

      const originX = x ?? 100;
      const originY = y ?? 28;

      // 3. Calculate exact distance to farthest screen corner (+32px margin prevents subpixel corner cutoff)
      const endRadius =
        typeof window !== 'undefined'
          ? Math.ceil(
              Math.hypot(
                Math.max(originX, window.innerWidth - originX),
                Math.max(originY, window.innerHeight - originY)
              )
            ) + 32
          : 2500;

      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--theme-x', `${originX}px`);
        document.documentElement.style.setProperty('--theme-y', `${originY}px`);
        document.documentElement.style.setProperty('--theme-radius', `${endRadius}px`);
      }

      const applyThemeChange = () => {
        setThemeState(newTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
      };

      if (supportsViewTransitions) {
        try {
          // Gracefully skip any in-flight transition before starting a new one
          if (activeTransitionRef.current?.skipTransition) {
            try {
              activeTransitionRef.current.skipTransition();
            } catch {
              // Ignore abort error
            }
          }

          const doc = document as Document & {
            startViewTransition?: (callback: () => void) => ViewTransitionHandle;
          };
          const transition = doc.startViewTransition?.(() => {
            flushSync(() => {
              applyThemeChange();
            });
          });

          if (transition) {
            activeTransitionRef.current = transition;

            // Hardware-accelerated circular expansion on GPU compositor thread (smooth 0-to-full size reveal)
            transition.ready
              ?.then(() => {
                try {
                  const anim = document.documentElement.animate(
                    {
                      clipPath: [
                        `circle(0px at ${originX}px ${originY}px)`,
                        `circle(${endRadius}px at ${originX}px ${originY}px)`,
                      ],
                    },
                    {
                      duration: 500,
                      easing: 'ease-in-out',
                      pseudoElement: '::view-transition-new(root)',
                      fill: 'forwards',
                    }
                  );
                  anim.addEventListener('error', () => {});
                } catch {
                  // Fallback
                }
              })
              .catch(() => {});

            transition.finished
              ?.catch(() => {})
              .finally(() => {
                if (activeTransitionRef.current === transition) {
                  activeTransitionRef.current = null;
                }
              });
          } else {
            applyThemeChange();
          }
        } catch {
          applyThemeChange();
        }
      } else {
        applyThemeChange();
      }

      try {
        localStorage.setItem('theme', newTheme);
      } catch {
        // localStorage unavailable — preference won't persist
      }
    },
    []
  );

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __setTheme?: (t: Theme) => void }).__setTheme = setTheme;
    }
  }, [setTheme]);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme, effectsLevel, setEffectsLevel }),
    [theme, resolvedTheme, setTheme, effectsLevel, setEffectsLevel]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
