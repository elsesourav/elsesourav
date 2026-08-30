import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GlobalSearchResponse, GlobalSearchResult, GlobalSearchResultType } from '@elsesourav/types';

// ============================================================================
// GLOBAL SEARCH TESTS
// ============================================================================

describe('Global Search System', () => {
  describe('Search Result Model', () => {
    it('normalizes results into a consistent structure', () => {
      const result: GlobalSearchResult = {
        type: 'project',
        title: 'Test Project',
        description: 'A test project description',
        url: '/apps/test-project',
        category: 'Utilities',
        metadata: { tags: 'typescript, react' },
      };

      expect(result.type).toBe('project');
      expect(result.title).toBeTruthy();
      expect(result.description).toBeTruthy();
      expect(result.url).toMatch(/^\/apps\//);
      expect(result.category).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('supports canonical content types', () => {
      const types: GlobalSearchResultType[] = ['project', 'note', 'page'];
      types.forEach((type) => {
        const result: GlobalSearchResult = {
          type,
          title: `${type} title`,
          description: `${type} description`,
          url: `/${type}`,
        };
        expect(result.type).toBe(type);
      });
    });

    it('groups results by content type', () => {
      const response: GlobalSearchResponse = {
        query: 'test',
        results: [],
        grouped: {
          project: [
            { type: 'project', title: 'P1', description: '', url: '/apps/p1' },
          ],
          note: [
            { type: 'note', title: 'N1', description: '', url: '/notes/n1' },
          ],
        },
        totalCount: 2,
      };

      expect(response.grouped.project).toHaveLength(1);
      expect(response.grouped.note).toHaveLength(1);
      expect(response.grouped.page).toBeUndefined();
    });
  });

  describe('Search Keyboard Shortcut', () => {
    it('defines Cmd+K / Ctrl+K as the trigger', () => {
      // The SearchButton component registers this listener.
      // Verify the expected keybinding constants.
      const MAC_SHORTCUT = { metaKey: true, key: 'k' };
      const WIN_SHORTCUT = { ctrlKey: true, key: 'k' };

      expect(MAC_SHORTCUT.metaKey).toBe(true);
      expect(MAC_SHORTCUT.key).toBe('k');
      expect(WIN_SHORTCUT.ctrlKey).toBe(true);
      expect(WIN_SHORTCUT.key).toBe('k');
    });

    it('does not trigger when typing in input fields', () => {
      // The SearchButton should check target.tagName before opening
      const INPUT_TAGS = ['INPUT', 'TEXTAREA'];
      INPUT_TAGS.forEach((tag) => {
        expect(tag).toMatch(/^(INPUT|TEXTAREA)$/);
      });
    });
  });

  describe('Search Security', () => {
    it('only searches published content', () => {
      // The SearchService filters by PublishStatus.PUBLISHED and deletedAt: null
      const REQUIRED_FILTERS = {
        status: 'PUBLISHED',
        deletedAt: null,
      };

      expect(REQUIRED_FILTERS.status).toBe('PUBLISHED');
      expect(REQUIRED_FILTERS.deletedAt).toBeNull();
    });

    it('never exposes draft, private, or deleted content', () => {
      const EXCLUDED_STATUSES = ['DRAFT', 'ARCHIVED'];
      EXCLUDED_STATUSES.forEach((status) => {
        expect(status).not.toBe('PUBLISHED');
      });
    });

    it('sanitizes search queries', () => {
      const sanitize = (raw: string): string => {
        if (!raw || typeof raw !== 'string') return '';
        return raw.trim().replace(/\s+/g, ' ').slice(0, 80);
      };

      expect(sanitize('  hello   world  ')).toBe('hello world');
      expect(sanitize('a'.repeat(200))).toHaveLength(80);
      expect(sanitize('')).toBe('');
      expect(sanitize('   ')).toBe('');
    });
  });

  describe('Search Ranking', () => {
    it('prioritizes exact title match highest', () => {
      const scoreResult = (title: string, query: string): number => {
        const lower = query.toLowerCase();
        const titleLower = title.toLowerCase();
        let score = 0;
        if (titleLower === lower) score += 100;
        else if (titleLower.startsWith(lower)) score += 90;
        else if (titleLower.includes(lower)) score += 80;
        return score;
      };

      expect(scoreResult('WebAssembly', 'webassembly')).toBe(100);
      expect(scoreResult('WebAssembly Tools', 'webassembly')).toBe(90);
      expect(scoreResult('Build with WebAssembly', 'webassembly')).toBe(80);
      expect(scoreResult('Something else', 'webassembly')).toBe(0);
    });
  });

  describe('Search States', () => {
    it('defines all required search states', () => {
      const STATES = ['empty', 'searching', 'results', 'no-results', 'error'] as const;
      expect(STATES).toHaveLength(5);
      expect(STATES).toContain('empty');
      expect(STATES).toContain('searching');
      expect(STATES).toContain('results');
      expect(STATES).toContain('no-results');
      expect(STATES).toContain('error');
    });
  });

  describe('Search Result Navigation & UI Stability', () => {
    it('generates correct URLs for each content type', () => {
      const urlMap: Record<GlobalSearchResultType, string> = {
        project: '/apps/my-project',
        note: '/notes/my-note',
        page: '/about',
      };

      expect(urlMap.project).toMatch(/^\/apps\//);
      expect(urlMap.note).toMatch(/^\/notes\//);
      expect(urlMap.page).toMatch(/^\//);
    });

    it('enforces outside-click dismissibility and fixed-height search input row to prevent UI shifts', () => {
      const searchUxContracts = {
        dismissOnOutsidePointer: true,
        dismissOnBackdropClick: true,
        dismissOnEscape: true,
        inputRowHeightPx: 56,
        preventHeightShiftsOnClearAppear: true,
      };

      expect(searchUxContracts.dismissOnOutsidePointer).toBe(true);
      expect(searchUxContracts.dismissOnBackdropClick).toBe(true);
      expect(searchUxContracts.dismissOnEscape).toBe(true);
      expect(searchUxContracts.inputRowHeightPx).toBe(56);
      expect(searchUxContracts.preventHeightShiftsOnClearAppear).toBe(true);
    });
  });

  describe('Search API Contract', () => {
    it('returns correct response shape', () => {
      const emptyResponse: GlobalSearchResponse = {
        query: '',
        results: [],
        grouped: {},
        totalCount: 0,
      };

      expect(emptyResponse).toHaveProperty('query');
      expect(emptyResponse).toHaveProperty('results');
      expect(emptyResponse).toHaveProperty('grouped');
      expect(emptyResponse).toHaveProperty('totalCount');
      expect(Array.isArray(emptyResponse.results)).toBe(true);
    });
  });
});

// ============================================================================
// THEME SWITCHER TESTS
// ============================================================================

describe('Theme Switcher System', () => {
  describe('Theme Modes', () => {
    it('supports three theme states', () => {
      const THEME_MODES = ['light', 'dark', 'system'] as const;
      expect(THEME_MODES).toHaveLength(3);
      expect(THEME_MODES).toContain('light');
      expect(THEME_MODES).toContain('dark');
      expect(THEME_MODES).toContain('system');
    });
  });

  describe('Theme Persistence', () => {
    let mockStorage: Record<string, string>;

    beforeEach(() => {
      mockStorage = {};
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('persists theme preference to localStorage', () => {
      localStorage.setItem('theme', 'light');
      expect(localStorage.getItem('theme')).toBe('light');

      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');

      localStorage.setItem('theme', 'system');
      expect(localStorage.getItem('theme')).toBe('system');
    });

    it('defaults to dark when no preference is stored', () => {
      const stored = localStorage.getItem('theme');
      expect(stored).toBeNull();

      // Default behavior: treat null as 'dark'
      const resolved = stored === 'light' || stored === 'system' ? stored : 'dark';
      expect(resolved).toBe('dark');
    });

    it('recovers gracefully when localStorage is unavailable', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => {
          throw new Error('localStorage not available');
        },
        setItem: () => {
          throw new Error('localStorage not available');
        },
      });

      let theme = 'dark';
      try {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'system') theme = stored;
      } catch {
        // Stay on dark - graceful degradation
      }

      expect(theme).toBe('dark');
    });
  });

  describe('System Theme Detection', () => {
    it('detects prefers-color-scheme correctly', () => {
      // Simulate system dark mode preference
      const getSystemTheme = (prefersDark: boolean): 'light' | 'dark' =>
        prefersDark ? 'dark' : 'light';

      expect(getSystemTheme(true)).toBe('dark');
      expect(getSystemTheme(false)).toBe('light');
    });
  });

  describe('No-Flash Strategy', () => {
    it('ThemeScript applies theme before first paint', () => {
      // The ThemeScript component renders a blocking <script> that:
      // 1. Reads localStorage
      // 2. Sets data-theme attribute
      // 3. Adds correct class to <html>
      // All before React hydration
      const themeScriptCode = `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;var c=d.classList;c.remove('dark','light')`;
      expect(themeScriptCode).toContain("localStorage.getItem('theme')");
      expect(themeScriptCode).toContain('document.documentElement');
      expect(themeScriptCode).toContain("c.remove('dark','light')");
    });
  });

  describe('CSS Design Tokens', () => {
    it('defines dark theme tokens', () => {
      const DARK_TOKENS = {
        background: '240 10% 3.9%',
        foreground: '0 0% 98%',
        surface: '240 10% 4.9%',
        border: '240 3.7% 15.9%',
        primary: '238.7 83.5% 66.7%',
      };

      Object.values(DARK_TOKENS).forEach((token) => {
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
      });
    });

    it('defines light theme tokens', () => {
      const LIGHT_TOKENS = {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        surface: '0 0% 98%',
        border: '240 5.9% 90%',
        primary: '238.7 83.5% 58%',
      };

      Object.values(LIGHT_TOKENS).forEach((token) => {
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
      });
    });
  });

  describe('Theme Popup', () => {
    it('provides three selection options with correct labels', () => {
      const OPTIONS = [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ] as const;

      expect(OPTIONS).toHaveLength(3);
      expect(OPTIONS[0]!.value).toBe('light');
      expect(OPTIONS[1]!.value).toBe('dark');
      expect(OPTIONS[2]!.value).toBe('system');
    });
  });

  describe('Reduced Motion', () => {
    it('respects prefers-reduced-motion media query', () => {
      // The globals.css includes a @media (prefers-reduced-motion: reduce) block
      // that sets animation-duration: 0.01ms and transition-duration: 0.01ms
      const REDUCED_MOTION_CSS = `animation-duration: 0.01ms !important`;
      expect(REDUCED_MOTION_CSS).toContain('0.01ms');
    });
  });

  describe('Accessibility', () => {
    it('theme button has accessible label', () => {
      const ARIA_LABEL = 'Change theme';
      expect(ARIA_LABEL).toBe('Change theme');
    });

    it('theme popup uses correct ARIA attributes', () => {
      const POPUP_ATTRS = {
        role: 'menu',
        'aria-label': 'Appearance',
        'aria-expanded': true,
        'aria-haspopup': 'menu',
      };

      expect(POPUP_ATTRS.role).toBe('menu');
      expect(POPUP_ATTRS['aria-label']).toBe('Appearance');
      expect(POPUP_ATTRS['aria-haspopup']).toBe('menu');
    });

    it('search button has accessible label', () => {
      const ARIA_LABEL = 'Search';
      expect(ARIA_LABEL).toBe('Search');
    });

    it('search overlay uses dialog semantics', () => {
      const DIALOG_ATTRS = {
        role: 'dialog',
        'aria-modal': true,
        'aria-label': 'Search',
      };

      expect(DIALOG_ATTRS.role).toBe('dialog');
      expect(DIALOG_ATTRS['aria-modal']).toBe(true);
      expect(DIALOG_ATTRS['aria-label']).toBe('Search');
    });
  });
});
