# ElseSourav Design Token System

This document outlines the complete design token specification for ElseSourav. Every component and layout must reference these CSS custom properties rather than hardcoded colors, spacing, or radii.

---

## 1. Color System

Tokens automatically adapt between `[data-theme='dark']` (default) and `[data-theme='light']`.

### Canvas & Surfaces

| Token                         | Dark Value              | Light Value                 | Purpose                          |
| :---------------------------- | :---------------------- | :-------------------------- | :------------------------------- |
| `--color-bg-canvas`           | `#07090e`               | `#f8fafc`                   | Base page background             |
| `--color-bg-surface`          | `#0f141f`               | `#ffffff`                   | Content panels and cards         |
| `--color-bg-surface-elevated` | `#151b2a`               | `#f1f5f9`                   | Elevated cards, modals, popovers |
| `--color-bg-surface-sunken`   | `#040508`               | `#e2e8f0`                   | Inset code blocks, input wells   |
| `--color-bg-card`             | `rgba(21, 27, 42, 0.6)` | `rgba(255, 255, 255, 0.85)` | Card background with glass base  |

### Typography & Foregrounds

| Token                    | Dark Value | Light Value | Purpose                           |
| :----------------------- | :--------- | :---------- | :-------------------------------- |
| `--color-text-primary`   | `#f8fafc`  | `#0f172a`   | Main body & heading text          |
| `--color-text-secondary` | `#94a3b8`  | `#475569`   | Subtitles, labels, secondary info |
| `--color-text-muted`     | `#64748b`  | `#64748b`   | Captions, subtle metadata         |
| `--color-text-accent`    | `#38bdf8`  | `#0284c7`   | Highlighted text links & stats    |

### Borders

| Token                    | Dark Value                  | Light Value           | Purpose                              |
| :----------------------- | :-------------------------- | :-------------------- | :----------------------------------- |
| `--color-border-subtle`  | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.06)` | Subtle dividers, card borders        |
| `--color-border-default` | `rgba(255, 255, 255, 0.12)` | `rgba(0, 0, 0, 0.10)` | Interactive elements, borders        |
| `--color-border-strong`  | `rgba(255, 255, 255, 0.20)` | `rgba(0, 0, 0, 0.18)` | Hover borders, emphasized containers |

### Accents & Statuses

- `--color-accent-primary`: `#38bdf8` (Dark) / `#0284c7` (Light)
- `--color-accent-indigo`: `#818cf8` (Dark) / `#6366f1` (Light)
- `--color-accent-violet`: `#c084fc` (Dark) / `#9333ea` (Light)
- `--color-success`: `#34d399` (Dark) / `#059669` (Light)
- `--color-warning`: `#fbbf24` (Dark) / `#d97706` (Light)
- `--color-error`: `#f87171` (Dark) / `#dc2626` (Light)

---

## 2. Typography

- **UI / Body**: `--font-sans: 'Geist', ...`
- **Headings / Display**: `--font-heading: 'Space Grotesk', ...`
- **Code / Monospace**: `--font-mono: 'JetBrains Mono', ...`

### Scale

- Display 2XL: `--font-size-display-2xl` (`clamp(2.5rem, 5vw, 3.75rem)`)
- Display XL: `--font-size-display-xl` (`clamp(2rem, 4vw, 3rem)`)
- H1: `--font-size-h1` (`2rem` / 32px)
- H2: `--font-size-h2` (`1.5rem` / 24px)
- H3: `--font-size-h3` (`1.25rem` / 20px)
- Body Large: `--font-size-body-lg` (`1rem` / 16px)
- Body Medium: `--font-size-body-md` (`0.875rem` / 14px)
- Body Small: `--font-size-body-sm` (`0.8125rem` / 13px)
- Caption: `--font-size-caption` (`0.75rem` / 12px)
- Code: `--font-size-code` (`0.8125rem` / 13px)

---

## 3. Spacing Scale

Linear 4px/8px scale:

- `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-6` (24px), `--space-8` (32px), `--space-12` (48px), `--space-16` (64px), `--space-24` (96px).

---

## 4. Glassmorphism System

Glass effects are reserved as accents for elevated shells, headers, and cards.

- `--glass-bg-subtle`: `rgba(15, 20, 31, 0.55)` (Dark) / `rgba(255, 255, 255, 0.6)` (Light)
- `--glass-bg-default`: `rgba(15, 20, 31, 0.72)` (Dark) / `rgba(255, 255, 255, 0.75)` (Light)
- `--glass-blur-default`: `16px`
- Classes available: `.glass-panel`, `.glass-panel-subtle`, `.glass-panel-elevated`, `.glass-interactive`

---

## 5. Motion & Accessibility

- Transitions: `--transition-fast` (150ms), `--transition-smooth` (250ms), `--transition-slow` (400ms)
- Curve: `--ease-smooth` (`cubic-bezier(0.16, 1, 0.3, 1)`)
- Focus Ring: `--focus-ring-width: 2px`, `--focus-ring-color`, `--focus-ring-offset: 2px`
- `@media (prefers-reduced-motion: reduce)` automatically scales transitions to `0.01ms`.
