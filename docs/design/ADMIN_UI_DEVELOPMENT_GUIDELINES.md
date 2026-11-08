# ElseSourav — Admin UI/UX Development Guidelines

> **Authority**: Authoritative Standard for all Admin Portal Views (`/admin/*`)  
> **Target Alignment**: Administrative Operations Tier (Design Constitution §3 & Theme Token Architecture)  
> **Enforcement Scope**: 100% of Admin routes, layouts, navigation shells, data tables, forms, and cards.

---

## 1. Core Philosophy & Administrative Tier Strategy

The Admin Control Portal is engineered for **operational velocity, high data density, and uncompromising ergonomics**. It prioritizes utilitarian clarity and fast ocular scanning over narrative storytelling:

| Trait | Specification |
| :--- | :--- |
| **Surface Hierarchy** | Default to solid surfaces (`bg-surface`, `bg-surface-elevated`, `bg-zinc-950`, `bg-zinc-900/60`). Avoid decorative frosted glass behind dense data tables. |
| **Visual Effects** | Crisp hairline borders (`border-border` / `border-zinc-800`), controlled elevation shadows, zero distracting ambient canvas loops. |
| **Naming Mandate** | Never mention "V1", "V2", "New V2" in any UI text, labels, or badges. Use "Admin Portal" or "Control Portal". |
| **Typography** | Display headlines in `font-display` (Outfit), body & UI labels in `font-sans` (Plus Jakarta Sans), and telemetry/metrics in `font-mono` (JetBrains Mono). |

---

## 2. Multi-Device Responsive Testing Matrix

Every page in the Admin Portal must be rigorously engineered and verified across the following viewports:

```
┌──────────────────┬─────────────────┬────────────────────────────────────────────────────────┐
│ Device Class     │ Target Viewport │ Mandatory UI Adaptations                               │
├──────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ **Mobile Mini**  │ **350px × 750** │ • Single-column reflow (no side-by-side card crowding) │
│                  │ (iPhone SE)     │ • Action buttons wrap or collapse cleanly              │
│                  │                 │ • Subtitle/description text clamps or truncates        │
│                  │                 │ • Touch targets maintain min 40-44px tap zone          │
│                  │                 │ • Top header bar sticky with accessible mobile drawer  │
├──────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ **Mobile Wide**  │ **600px × 900** │ • 2-column stats grid reflow                           │
│                  │ (Phablets)      │ • Quick action buttons row flex with auto spacing      │
│                  │                 │ • Compact card padding (`p-3.5` to `p-4`)              │
├──────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ **Tablet**       │ **768px × 1024**│ • 2-3 column stats grid                                │
│                  │ (iPad Portrait) │ • Sidebar collapses to mobile drawer or compact state  │
│                  │                 │ • Tables offer horizontal scroll with sticky headers   │
├──────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ **Desktop**      │ **1024px - 1280**│ • Full persistent sidebar (w-64) with active indicator │
│                  │ (Laptops)       │ • 3-5 column stats metrics grid                        │
│                  │                 │ • Multi-column forms and side-by-side activity feeds   │
├──────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ **Large Wide**   │ **1536px+**     │ • Content max-width constrained to `max-w-7xl mx-auto` │
│                  │ (Monitors)      │ • Consistent horizontal margins and visual balance     │
└──────────────────┴─────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. Layout, Viewport Height & Scrolling Standards

### 3.1 Container & Viewport Setup
- **Root Shell**: `min-h-screen flex flex-col md:flex-row bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`
- **Zero Horizontal Overflow**: Every top-level wrapper must enforce `min-w-0 max-w-full overflow-x-hidden` or horizontal scroll containers specifically dedicated to tables (`overflow-x-auto`).
- **Main Content Area**:
  - `flex-1 min-w-0 flex flex-col`
  - Responsive padding: `p-3.5 sm:p-5 lg:p-8`
  - Max constrained container: `w-full max-w-7xl mx-auto space-y-6 sm:space-y-8`
- **No Double Scrollbars**: Prevent accidental `h-screen overflow-y-scroll` inside nested layout divs. The outer body/window should manage normal scroll physics smoothly.

### 3.2 Navigation Architecture
- **Desktop Sidebar (`md:flex`)**:
  - Width: `w-64`, persistent fixed/sticky height `min-h-screen`.
  - Border: `border-r border-border` (`border-zinc-800/80`).
  - Active Link: `bg-primary/10 border border-primary/30 text-primary-300 font-semibold shadow-sm`.
  - Inactive Link: `text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60 transition-colors`.
  - Footer: Return link to public site with left arrow.
- **Mobile Header & Drawer (`md:hidden`)**:
  - Sticky top bar: `sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3`.
  - Accessible drawer toggle button with ARIA `aria-label="Toggle navigation menu"` and `aria-expanded`.
  - Slide-in/overlay drawer with focus trap, `Escape` key dismissal, and backdrop click dismissal.
  - Body scroll lock when open: toggle `document.body.style.overflow = 'hidden'` on open.

---

## 4. Component Composition & Anti-Duplication Rules

Always compose from `@elsesourav/ui` and `@elsesourav/ui/interior`. **Never duplicate or reinvent primitives**:

### 4.1 Buttons & Action Controls
- **Never use raw `<button>` HTML elements** for UI actions.
- Use `@elsesourav/ui` `Button` or `IconButton`:
  - **Primary CTA**: `variant="primary"` (`bg-primary hover:bg-primary/90`)
  - **Secondary Actions**: `variant="outline"` (`border-border text-foreground hover:bg-surface-elevated`)
  - **Quick Action Pills**: `size="sm"` with responsive padding (`px-2.5 sm:px-3 text-xs`)
  - **Icon Buttons**: `IconButton` with `aria-label` for screen readers.
- For async triggers (Save, Delete, Publish): Use `@elsesourav/ui/interior` `LoadingButton` or `Button` with `loading={isPending}`.

### 4.2 Cards & Data Containers
- Standard Card: Use `@elsesourav/ui` `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- Responsive Padding: `p-3.5 sm:p-4 md:p-5` with `rounded-2xl` or `rounded-3xl`.
- Surface Color: `bg-surface border-border` (`bg-zinc-900/40 border-zinc-800/80`).
- No whole-card scaling or jumping on hover (`hover:scale-*` is forbidden). Only subtle border brightness (`hover:border-zinc-700`).

### 4.3 Badges & Status Indicators
- Use `@elsesourav/ui` `Badge`.
- Role badges: `variant="warning"` or `variant="primary"` with `font-mono text-[10px] uppercase`.
- Status badges:
  - Published / Active: `variant="success"`
  - Draft / Pending: `variant="warning"`
  - Error / Blocker: `variant="error"`
  - Neutral / Info: `variant="outline"` or `variant="default"`

---

## 5. Strict Code Quality & Maintainability Rules

1. **500 Lines per File Limit**:
   - No single component, page, or layout file may exceed 500 lines of code.
   - Modularize large files into subcomponents under `features/admin/<section>/components/`.
2. **Strict TypeScript (Zero `any`)**:
   - 0 TypeScript errors.
   - 0 `any` types. All API payloads, props, context shapes, and params must use explicit interfaces from `@elsesourav/types` or local Zod schemas.
   - Verify continuously with `pnpm typecheck`.
3. **Accessibility (WCAG 2.1 AA)**:
   - Exactly one `<h1>` per page.
   - Sequential headings (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).
   - High contrast text ($\ge 4.5:1$).
   - Visible focus rings (`focus-visible:ring-2 focus-visible:ring-primary`).
   - Touch targets $\ge 40\text{px} \times 40\text{px}$ on mobile.

---

## 6. Page-by-Page Audit & Verification Workflow

When optimizing each admin page:
1. **Analyze existing code**: Inspect layout, queries, components, line counts, and CSS classes.
2. **Execute baseline capture**: Take screenshots across viewports: `350x750`, `600x900`, `768x1024`, `1280x900`.
3. **Refactor & enhance**:
   - Fix responsive wrapping, button sizes, spacing, and overflowing text.
   - Replace any raw `<button>` with `@elsesourav/ui` `Button`.
   - Ensure proper dark mode tokens and contrast.
   - Modularize files if $> 500$ lines.
4. **Re-capture & Visual Verification**: Take updated screenshots and verify across all 4 screen widths.
5. **Typecheck & Sync Docs**: Run `pnpm typecheck` to guarantee 0 errors, and update `packages/ui/README.md` if components were modified.
