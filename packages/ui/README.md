# @elsesourav/ui — Design System & Component Library

The official, accessible, performance-first design system powering the **ElseSourav** platform.

---

## 1. The 10 Core Design Principles

1. **Human-Made Design**: Thoughtfully crafted proportions, subtle tactile feedback, and purposeful layout hierarchy rather than generic templates.
2. **Strategic Design**: Every component serves a specific user objective with clear information scent and visual hierarchy.
3. **Organic / Anti-Grid Where Appropriate**: Micro-asymmetry, subtle glowing borders, and fluid responsive scaling that feels alive.
4. **Motion Narrative**: Fast, predictable transitions (`duration-fast` = 150ms, `duration-smooth` = 250ms) using smooth bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
5. **Subtle Glassmorphism 2.0**: Translucent backgrounds (`bg-zinc-950/70`) paired with ultra-thin, low-opacity borders (`border-white/[0.08]`) and moderate blur (`backdrop-blur-md` / `backdrop-blur-lg`). Selective, never overused.
6. **Archival Index**: Information-dense catalog cards, metadata tags, and monospace accents that feel like an engineered workspace index.
7. **Purposeful Micro-Interactions**: Active scale effects (`active:scale-[0.98]`), high-visibility focus indicators, and instant visual confirmations.
8. **Accessibility-First**: WCAG 2.1 AA compliant contrast ratios (>7:1 on body text, >4.5:1 on badges), explicit `aria-*` attributes, full keyboard navigability, and automatic `prefers-reduced-motion` overrides.
9. **AI as a Tool, Not the Identity**: Clean, honest interface representing creator software and developer utilities.
10. **Performance-First Creativity**: Zero heavy animation libraries; CSS-only transitions and GPU-accelerated transforms for instantaneous 60fps rendering.

---

## 2. Semantic Color Token Architecture

All colors are exposed as HSL CSS custom properties in `globals.css` and mapped to Tailwind utilities:

| Token | CSS Variable | Dark Value | Purpose |
|---|---|---|---|
| `--background` | `hsl(var(--background))` | `240 10% 3.9%` (`#09090b`) | Main viewport background |
| `--foreground` | `hsl(var(--foreground))` | `0 0% 98%` (`#fafafa`) | Primary high-contrast body text |
| `--surface` | `hsl(var(--surface))` | `240 10% 4.9%` (`#0d0d10`) | Base card/container surface |
| `--surface-subtle` | `hsl(var(--surface-subtle))` | `240 6% 8%` (`#131317`) | Inset areas, table headers, code pre-blocks |
| `--surface-elevated` | `hsl(var(--surface-elevated))` | `240 5% 11%` (`#1b1b20`) | Floating panels, dropdowns, popovers |
| `--surface-overlay` | `hsl(var(--surface-overlay))` | `240 10% 3.9%` | Modal/dialog scrims and popovers |
| `--primary` | `hsl(var(--primary))` | `238.7 83.5% 66.7%` (`#6366f1` / `#818cf8`) | Primary brand accent & focus rings |
| `--secondary` | `hsl(var(--secondary))` | `240 3.7% 15.9%` | Secondary button/badge surfaces |
| `--muted-foreground` | `hsl(var(--muted-foreground))` | `240 5% 64.9%` (`#a1a1aa`) | Subtitles, helper text, and secondary copy |
| `--border` | `hsl(var(--border))` | `240 3.7% 15.9%` (`#27272a`) | Standard container borders |
| `--border-subtle` | `hsl(var(--border-subtle))` | `240 4% 11%` (`#18181b`) | Dividers and table grid lines |
| `--border-strong` | `hsl(var(--border-strong))` | `240 5% 26%` (`#3f3f46`) | Active/focused element outlines |
| `--success` | `hsl(var(--success))` | `152 69% 52%` (`#34d399`) | Success states, live metrics, online badges |
| `--warning` | `hsl(var(--warning))` | `45 93% 58%` (`#fbbf24`) | Pending states, alerts, cautious actions |
| `--error` / `--destructive` | `hsl(var(--error))` | `0 62.8% 50.6%` (`#f87171`) | Error banners, validation failures, destructive actions |
| `--info` | `hsl(var(--info))` | `199 89% 60%` (`#38bdf8`) | Informational badges and help links |

---

## 3. Typography Hierarchy

| Style Class | Size (Rem / Clamped) | Weight | Line Height | Tracking | Use Case |
|---|---|---|---|---|---|
| `.text-display` | `clamp(2.25rem, 5vw, 3.75rem)` | 800 (ExtraBold) | 1.08 | `-0.035em` | Hero titles |
| `.text-h1` | `clamp(1.875rem, 4vw, 2.5rem)` | 800 (ExtraBold) | 1.15 | `-0.025em` | Page primary headers |
| `.text-h2` | `clamp(1.375rem, 3vw, 1.75rem)` | 700 (Bold) | 1.25 | `-0.02em` | Section headers |
| `.text-h3` | `1.125rem` (18px) | 600 (SemiBold) | 1.4 | `-0.015em` | Card titles, subsection heads |
| `.text-body` | `0.9375rem` (15px) | 400 (Regular) | 1.6 | Normal | Main reading paragraphs |
| `.text-small` | `0.8125rem` (13px) | 450 (Medium) | 1.5 | Normal | Secondary copy, descriptions |
| `.text-caption` | `0.6875rem` (11px) | 600 (SemiBold) | 1.4 | `0.05em` | Monospace tags, metadata headers |
| `.text-code` | `0.75rem` (12px) | 400 (Mono) | 1.5 | Normal | Inline code, command snippets |

---

## 4. The 5-Layer Surface System

To avoid visual flatness while preserving restraint, interfaces are composed across 5 distinct elevation layers:

1. **Level 0 (Canvas — `--background`)**: Deep `#09090b` viewport foundation (`.depth-0`).
2. **Level 1 (Subtle Inset — `.surface-subtle`)**: Embedded code blocks, secondary toolbars, table headers (`.depth-1`).
3. **Level 2 (Solid Surface — `.surface-solid` / `.surface-elevated`)**: Standard content cards, data tables, sidebars (`.depth-2`).
4. **Level 3 (Overlays — `.surface-overlay`)**: Dropdown menus, tooltips, flyout panels, dialogs (`.depth-3`).
5. **Level 4 (Focused — `.depth-4`)**: Active selection, brand halo ring.

### Glassmorphism 2.0 Rules:
- **Maximum 2 glass elements per viewport**: Sticky header + 1 featured container.
- **Always pair blur with opacity**: Use `rgba(13, 13, 16, 0.72)` with `backdrop-blur-md` (16px).
- **Subtle hairline border**: `border-white/[0.08]` in dark mode for crisp edge definition without heavy white glare.

---

## 5. Shape & Spacing Tokens

- **Control Height Standard**: `40px` (desktop), `44px` (mobile touch target minimum).
- **Radii**:
  - `rounded-lg` (8px): Form inputs, buttons, select menus.
  - `rounded-xl` (12px): Standard cards, dialog containers, tab lists.
  - `rounded-2xl` (16px/24px): Hero containers, large feature cards, image frames.
  - `rounded-full` (9999px): Status badges, avatars, pill tags.
- **Spacing Rhythm**: 4px baseline grid (`space-y-1` = 4px, `space-y-2` = 8px, `space-y-4` = 16px, `space-y-6` = 24px, `space-y-8` = 32px, `space-y-12` = 48px).

---

## 6. Complete UI Primitives Directory

All primitives are exported from `@elsesourav/ui`:

| Category | Component(s) | Primary Props / Variants |
|---|---|---|
| **Foundation** | `Button`, `IconButton` | `variant: 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'`, `size: 'sm' \| 'md' \| 'lg' \| 'icon'`, `loading?: boolean` |
| | `Badge` | `variant: 'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'outline'`, `size: 'sm' \| 'md'` |
| | `Avatar` | `src?: string`, `alt: string`, `fallback: string`, `size?: 'sm' \| 'md' \| 'lg'` |
| | `Separator` | `orientation?: 'horizontal' \| 'vertical'` |
| **Forms** | `Label` | `htmlFor?: string`, `required?: boolean` |
| | `Input` | `type?: string`, `error?: string`, `placeholder?: string` |
| | `Textarea` | `error?: string`, `rows?: number` |
| | `Select` | `options?: SelectOption[]`, `error?: string` |
| | `Checkbox` | `label?: string`, `description?: string`, `checked?: boolean` |
| | `Switch` | `label?: string`, `checked?: boolean`, `onChange?: (checked: boolean) => void` |
| | `RadioGroup`, `RadioGroupItem` | `value?: string`, `onChange?: (val: string) => void`, `name?: string` |
| | `FormField` | `label?: string`, `required?: boolean`, `error?: string`, `description?: string` |
| **Surfaces** | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `variant: 'default' \| 'solid' \| 'subtle' \| 'elevated' \| 'glass' \| 'interactive'`, `depth?: 0 \| 1 \| 2 \| 3 \| 4` |
| | `GlassSurface` | `blur: 'sm' \| 'md' \| 'lg' \| 'xl'`, `intensity: 'subtle' \| 'medium' \| 'high'`, `interactive?: boolean` |
| **Feedback** | `Skeleton` | Pulsing placeholder block |
| | `Spinner` | `size: 'sm' \| 'md' \| 'lg'` |
| | `Alert`, `AlertTitle`, `AlertDescription` | `variant: 'info' \| 'success' \| 'warning' \| 'error'` |
| | `ToastProvider`, `useToast` | Lightweight accessible toast dispatch (`success`, `error`, `info`) |
| | `EmptyState` | `icon?: LucideIcon`, `title: string`, `description: string`, `action?: ReactNode` |
| | `ErrorState` | `title?: string`, `description?: string`, `onRetry?: () => void` |
| **Overlays** | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | `open: boolean`, `onOpenChange: (open: boolean) => void`, `onClose?: () => void` |
| | `Drawer`, `DrawerHeader` | `open: boolean`, `onOpenChange: (open: boolean) => void`, `position: 'left' \| 'right'` |
| | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` | Accessible zero-dependency dropdown overlay |
| | `Tooltip` | `content: ReactNode`, `side: 'top' \| 'bottom' \| 'left' \| 'right'` |
| **Navigation** | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `defaultValue?: string`, `value?: string`, `onValueChange?: (val: string) => void` |
| | `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbSeparator` | Accessible breadcrumb navigation |
| | `Pagination` | `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void` |
| **Data & Content** | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | Responsive horizontal overflow table container |
| | `StatCard` | `label: string`, `value: string \| number`, `change?: string`, `changeType?: 'positive' \| 'negative' \| 'neutral'` |
| | `MarkdownRenderer` | GFM parser, syntax-highlighted code blocks, copy actions, safe links, responsive tables |
| | `AdminMarkdownEditor` | Write/Preview tabs, quick-insert toolbar, GFM cheatsheet, word/character count |

---

## 7. Motion & Interaction Design System

Motion is functional and communicative, not decorative:

| Interaction | Duration Token | Easing Token | Visual Effect |
|---|---|---|---|
| **Button / Control Press** | `--duration-fast` (150ms) | `--ease-smooth` | `active:scale-[0.98]` tactile press |
| **Surface Hover** | `--duration-fast` (150ms) | `--ease-smooth` | Border illumination + subtle background lift |
| **Dialog Entrance** | `--duration-smooth` (250ms) | `--ease-smooth` | Zoom from 96% to 100% + fade-in |
| **Drawer Slide-in** | `--duration-smooth` (250ms) | `--ease-smooth` | Slide horizontally from right/left edge |
| **Dropdown / Tooltip Reveal** | `--duration-fast` (150ms) | `--ease-smooth` | Zoom from 95% to 100% + fade-in |
| **Toast Notification Entry** | `--duration-smooth` (250ms) | `--ease-smooth` | Slide up from bottom right + fade-in |
| **Tab Panel Switch** | `--duration-fast` (150ms) | `--ease-smooth` | Instant switch with active pill background motion |
| **Copy Action Confirmation** | `--duration-fast` (150ms) | `--ease-smooth` | Icon transform from Copy to Check with emerald accent |
