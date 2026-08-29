# ElseSourav Theme & Design Token Architecture

> **Authoritative Specification**: `@elsesourav/ui/styles.css` & `apps/web/tailwind.config.ts`  
> **Target Alignment**: Dark-First Handcrafted Engineering Aesthetics (WCAG 2.1 AA/AAA)

---

## 1. System Overview & Token Hierarchy

ElseSourav utilizes a **two-tier design token architecture**:

1. **Tier 1: Global CSS Custom Properties** defined in `@elsesourav/ui/src/styles/globals.css`
2. **Tier 2: Tailwind Semantic Utilities** mapped in `apps/web/tailwind.config.ts`

```
┌─────────────────────────────────────────────────────────────┐
│                 TIER 1: CSS CUSTOM PROPERTIES               │
│   (HSL values, durations, radii, glass filters, curves)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mapped via tailwind.config.ts
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 TIER 2: TAILWIND UTILITY CLASSES            │
│  (bg-surface, text-foreground, border-subtle, rounded-xl)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Semantic Color System

Colors are defined in pure HSL color components to support opacity modification (`bg-surface/80`, `border-primary/50`).

### 2.1 Canvas & Surfaces

| Token              | Dark Value (Default)       | Light Mode               | Semantic Role                           |
| :----------------- | :------------------------- | :----------------------- | :-------------------------------------- |
| `background`       | `240 10% 3.9%` (`#09090b`) | `0 0% 100%` (`#ffffff`)  | Root page canvas background             |
| `surface`          | `240 10% 4.9%` (`#0d0d10`) | `0 0% 98%` (`#fafafa`)   | Standard card and panel wells           |
| `surface-subtle`   | `240 6% 8%` (`#131317`)    | `240 5% 96%` (`#f4f4f5`) | Inset code wells, table headers         |
| `surface-elevated` | `240 5% 11%` (`#1b1b20`)   | `0 0% 100%` (`#ffffff`)  | Floating menus, modal dialogs, popovers |
| `surface-overlay`  | `240 10% 3.9%` (`#09090b`) | `0 0% 100%` (`#ffffff`)  | Modal overlay backdrop base             |
| `surface-sunken`   | `240 10% 2.5%` (`#050507`) | `240 5% 94%` (`#f0f0f2`) | Inset terminal viewport screens         |

### 2.2 Typography & Foregrounds

| Token                | Dark Value                 | Light Mode                   | Semantic Role                           |
| :------------------- | :------------------------- | :--------------------------- | :-------------------------------------- |
| `foreground`         | `0 0% 98%` (`#fafafa`)     | `240 10% 3.9%` (`#09090b`)   | High-contrast headings and primary text |
| `muted-foreground`   | `240 5% 64.9%` (`#a1a1aa`) | `240 3.8% 46.1%` (`#71717a`) | Subtitles, supporting copy, labels      |
| `subtle-foreground`  | `240 5% 45%` (`#71717a`)   | `240 4% 60%` (`#a1a1aa`)     | Timestamps, metadata, footnotes         |
| `primary-foreground` | `0 0% 98%` (`#fafafa`)     | `0 0% 98%` (`#ffffff`)       | High-contrast text on primary buttons   |

### 2.3 Accents & Statuses

| Role                    | Dark Value                      | Utility Class                    | Semantic Purpose                             |
| :---------------------- | :------------------------------ | :------------------------------- | :------------------------------------------- |
| **Primary**             | `238.7 83.5% 66.7%` (`#818cf8`) | `bg-primary`, `text-primary`     | Main interactive brand actions & CTAs        |
| **Secondary**           | `240 3.7% 15.9%` (`#27272a`)    | `bg-secondary`, `text-secondary` | Secondary buttons and action pills           |
| **Success**             | `152 69% 52%` (`#34d399`)       | `bg-success`, `text-success`     | Operational health, resolved tickets, checks |
| **Warning**             | `45 93% 58%` (`#fbbf24`)        | `bg-warning`, `text-warning`     | Deprecations, pending audits, triage alerts  |
| **Error / Destructive** | `0 62.8% 50.6%` (`#f87171`)     | `bg-error`, `text-error`         | Validation errors, delete actions, blockers  |
| **Info**                | `199 89% 60%` (`#38bdf8`)       | `bg-info`, `text-info`           | Devlogs, system notices, release tags        |

### 2.4 Borders & Focus Rings

| Token           | Dark Value                      | Purpose                                    |
| :-------------- | :------------------------------ | :----------------------------------------- |
| `border`        | `240 3.7% 15.9%` (`#27272a`)    | Standard card and button perimeter borders |
| `border-subtle` | `240 4% 11%` (`#18181b`)        | Internal dividers, subtle gridlines        |
| `border-strong` | `240 5% 26%` (`#3f3f46`)        | Hover focus states, active panel edges     |
| `ring`          | `238.7 83.5% 66.7%` (`#818cf8`) | WCAG 2.1 focus outline ring                |

---

## 3. Typography Scale & Roles

### 3.1 Font Families

- **Display**: `'Space Grotesk', system-ui, sans-serif` — Expressive headings, hero titles, stats numbers.
- **Body & UI**: `'Geist Sans', 'Inter', system-ui, sans-serif` — Paragraphs, labels, buttons, navigation.
- **Monospace**: `'JetBrains Mono', 'Geist Mono', monospace` — Code blocks, terminal viewports, version tags, telemetry numbers.

### 3.2 Responsive Type Hierarchy

| Role             | Mobile Size        | Desktop Size       | Tracking / Weight             | Semantic Element              |
| :--------------- | :----------------- | :----------------- | :---------------------------- | :---------------------------- |
| **Display 2XL**  | `2.5rem` (40px)    | `3.75rem` (60px)   | `-0.03em` / `font-black`      | Hero main proposition         |
| **Display XL**   | `2rem` (32px)      | `3rem` (48px)      | `-0.025em` / `font-extrabold` | Section spotlight headings    |
| **Heading 1**    | `1.75rem` (28px)   | `2.25rem` (36px)   | `-0.02em` / `font-bold`       | `<h1>` Page title             |
| **Heading 2**    | `1.375rem` (22px)  | `1.75rem` (28px)   | `-0.015em` / `font-bold`      | `<h2>` Section header         |
| **Heading 3**    | `1.125rem` (18px)  | `1.25rem` (20px)   | `-0.01em` / `font-semibold`   | `<h3>` Card / Feature title   |
| **Body Large**   | `1rem` (16px)      | `1.125rem` (18px)  | `normal` / `font-normal`      | Lead paragraph                |
| **Body Base**    | `0.875rem` (14px)  | `0.9375rem` (15px) | `normal` / `font-normal`      | Main article & UI body text   |
| **Label / Meta** | `0.75rem` (12px)   | `0.8125rem` (13px) | `0.01em` / `font-medium`      | Form labels, tags, timestamps |
| **Code**         | `0.8125rem` (13px) | `0.875rem` (14px)  | `normal` / `font-mono`        | Inline code, telemetry        |

---

## 4. Spacing & Spatial Rhythm Scale

Strict $4\text{px} / 8\text{px}$ linear progression:

```
Token    │ Pixels │ Typical Usage
─────────┼────────┼──────────────────────────────────────────────────────────
space-1  │   4px  │ Icon-to-text gap, badge inline padding
space-2  │   8px  │ Button internal padding, micro-card gaps
space-3  │  12px  │ Input vertical padding, list item gaps
space-4  │  16px  │ Card default padding (mobile), component standard margin
space-5  │  20px  │ Card default padding (desktop), stack spacing
space-6  │  24px  │ Section gap (mobile), drawer padding
space-8  │  32px  │ Grid column gaps, container vertical rhythm
space-12 │  48px  │ Section vertical padding (mobile)
space-16 │  64px  │ Section vertical padding (desktop)
space-24 │  96px  │ Hero top/bottom padding
```

---

## 5. Semantic Surfaces & Glassmorphism 2.0

### 5.1 Solid Surfaces (Default Foundation)

- `.surface-solid`: Standard dark card panel (`bg-surface border-border`).
- `.surface-subtle`: Sunken container or header well (`bg-surface-subtle border-border-subtle`).
- `.surface-elevated`: Floating popover or dropdown (`bg-surface-elevated shadow-2xl`).

### 5.2 Glassmorphism 2.0 (Restrained Accents)

- `.surface-glass`: Standard floating nav / action bar (`bg-glass backdrop-blur-md border-glass`).
- `.surface-glass-subtle`: Subtle badge pill / card overlay (`bg-glass-subtle backdrop-blur-sm`).
- `.surface-glass-elevated`: Elevated modal dialog (`bg-glass-elevated backdrop-blur-lg shadow-2xl`).

---

## 6. Depth, Borders & Radii

### 6.1 Corner Radii

- `rounded-sm`: `6px` (`--radius-sm`) — Badges, small pills
- `rounded-md`: `8px` (`--radius-md`) — Buttons, inputs, dropdown items
- `rounded-lg`: `12px` (`--radius-lg`) — Standard cards, modals
- `rounded-xl`: `16px` (`--radius-xl`) — Feature spotlight containers
- `rounded-2xl`: `24px` (`--radius-2xl`) — Hero containers, large dialogs
- `rounded-full`: `9999px` — Avatars, status dots

### 6.2 Elevation Shadows

- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)`
- `shadow-xl`: `0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)`
- `shadow-glow-indigo`: `0 0 30px -5px rgba(99, 102, 241, 0.15)`

---

## 7. Motion & Interaction Tokens

### 7.1 Durations & Curves

- **Fast**: `150ms` (`--duration-fast` / `duration-fast`) — Hover, press, toggle switches.
- **Smooth**: `250ms` (`--duration-smooth` / `duration-smooth`) — Dropdown unfold, tab change, modal fade.
- **Slow**: `400ms` (`--duration-slow` / `duration-slow`) — Page transitions, drawer slide.
- **Easing**: `--ease-smooth` (`cubic-bezier(0.16, 1, 0.3, 1)`)

### 7.2 Reduced Motion Protocol

Automatically enforced in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Responsive Breakpoints

Aliged with Tailwind default standards:

- `sm`: `640px` — Large phones / small tablets
- `md`: `768px` — Tablets / portrait devices (Mobile drawer collapses below this)
- `lg`: `1024px` — Desktop / Laptop (Full sidebar navigation expands)
- `xl`: `1280px` — Wide screen monitors
- `2xl`: `1536px` — Ultra-wide displays

---

## 9. Developer Usage Guide

### Example: Semantic Card

```tsx
import { Card } from '@elsesourav/ui';

export function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-surface hover:bg-surface-elevated border border-border hover:border-border-strong rounded-xl p-5 transition-all duration-fast">
      <h3 className="text-foreground font-bold text-base">{title}</h3>
      <p className="text-muted-foreground text-sm mt-2">{description}</p>
    </div>
  );
}
```

### Example: Glass Navigation Shell

```tsx
export function StickyNavbar({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 surface-glass border-b border-border-subtle px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">{children}</div>
    </header>
  );
}
```
