import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border))',
          subtle: 'hsl(var(--border-subtle))',
          strong: 'hsl(var(--border-strong))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          subtle: 'hsl(var(--surface-subtle))',
          elevated: 'hsl(var(--surface-elevated))',
          overlay: 'hsl(var(--surface-overlay))',
          sunken: 'hsl(var(--surface-sunken))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        subtle: {
          foreground: 'hsl(var(--subtle-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        '2xl': 'var(--radius-2xl)',
        xl: 'var(--radius-xl)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        full: 'var(--radius-full)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        smooth: 'var(--duration-smooth)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        smooth: 'var(--ease-smooth)',
        bounce: 'var(--ease-bounce)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'neon-pulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 0 2.5px rgba(99,102,241,0.85), 0 0 24px rgba(99,102,241,0.4), 0 0 0 7px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.3)',
          },
          '50%': {
            boxShadow:
              '0 0 0 3px rgba(99,102,241,0.95), 0 0 32px rgba(99,102,241,0.55), 0 0 0 8.5px rgba(139,92,246,0.35), 0 0 50px rgba(139,92,246,0.4)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-fast) var(--ease-smooth)',
        'slide-up': 'slide-up var(--duration-smooth) var(--ease-smooth)',
        'slide-down': 'slide-down var(--duration-smooth) var(--ease-smooth)',
        'scale-in': 'scale-in var(--duration-fast) var(--ease-smooth)',
        'neon-pulse': 'neon-pulse 4s ease-in-out infinite',
      },
      boxShadow: {
        'neon-ring':
          '0 0 0 2.5px rgba(99,102,241,0.85), 0 0 24px rgba(99,102,241,0.4), 0 0 0 7px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.3)',
        'neon-card': '0 20px 50px rgba(0,0,0,0.6)',
        'neon-card-hover': '0 20px 60px rgba(99,102,241,0.1), 0 0 0 1px rgba(99,102,241,0.25)',
        'neon-glow-sm': '0 0 15px rgba(99,102,241,0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
