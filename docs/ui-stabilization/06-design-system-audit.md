# UI Stabilization Phase — 06: Design System Standardization & Token Audit

**Project**: ElseSourav Monorepo V2  
**Date**: August 29, 2026  
**Status**: COMPLETE — SHARED DESIGN SYSTEM STANDARDIZED & VERIFIED  

---

## 1. Design System Inventory

The application styling architecture is structured into a cohesive 3-tier token and primitive hierarchy:

1. **Global Tokens & CSS Variables** (`packages/ui/src/styles/globals.css` & `apps/web/tailwind.config.ts`):
   - Semantic HSL color variables: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`.
   - Core dark theme foundation: `#09090b` (zinc-950) with neutral high-contrast foreground `#fafafa`.
2. **Foundational UI Primitives** (`packages/ui/src/components/*`):
   - Actions: `Button` (primary, secondary, outline, ghost, danger).
   - Forms: `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `FormField`, `Label`.
   - Surfaces: `Card`, `GlassSurface`, `Separator`.
   - Data Display: `Table`, `Badge`, `Avatar`, `StatCard`.
   - Overlays: `Dialog`, `Drawer`.
   - Navigation: `Tabs`, `Pagination`, `Breadcrumb`.
   - Feedback: `Alert`, `EmptyState`, `ErrorState`, `Skeleton`, `Spinner`.
3. **Domain Projections** (`apps/web/features/*`):
   - Feature-specific cards (`AppCard`, `BlogCard`, `HelpCategoryCard`, `LibraryAppCard`, `NotificationItemCard`).
   - Discovery bars (`AppDiscoveryBar`, `BlogDiscoveryBar`, `HelpSearchBar`).
   - Unified headers (`PublicHeader`, `AdminSidebar`, `AdminMobileNav`).

---

## 2. Token Standardization & Consolidations

| Category | Token | Standardized Value | Usage / Application |
| :--- | :--- | :--- | :--- |
| **Colors** | Canvas Background | `#09090b` (`bg-zinc-950`) | Global page background |
| | Surface Layer 1 | `bg-zinc-900/40` (`border-zinc-800/80`) | Content cards, widgets, panel sections |
| | Surface Layer 2 | `bg-zinc-900/80` (`border-zinc-700/60`) | Interactive card hover states, filter bars |
| | Primary Accent | `#4f46e5` (`bg-indigo-600` / `text-indigo-400`) | Main CTAs, badges, brand indicators |
| | Secondary Neutral | `bg-zinc-800` (`text-zinc-200`) | Secondary buttons, tag pills |
| | Success | `emerald-500` (`bg-emerald-950/60 text-emerald-300`) | Published apps, active tickets, save confirmations |
| | Warning | `amber-500` (`bg-amber-950/60 text-amber-300`) | In-progress tasks, featured badges, warnings |
| | Danger / Error | `rose-500` (`bg-rose-950/60 text-rose-300`) | Critical alerts, delete actions, form errors |
| **Radius** | `sm` | `0.375rem` (`rounded-md` / `rounded-lg`) | Form inputs, buttons, menu items |
| | `md` | `0.75rem` (`rounded-xl`) | Dialogs, table wrappers, stats |
| | `lg` | `1rem` (`rounded-2xl` / `rounded-3xl`) | App cards, blog cards, hero containers |
| | `full` | `9999px` (`rounded-full`) | Status badges, category pills, avatar monograms |
| **Typography**| Display H1 | `text-4xl sm:text-6xl font-extrabold tracking-tight` | Hero sections |
| | Page H1 | `text-2xl sm:text-4xl font-extrabold tracking-tight` | Directory and detail pages |
| | Section H2 | `text-xl sm:text-2xl font-bold tracking-tight` | Major page sections, form headers |
| | Card H3 | `text-base font-semibold text-zinc-100` | Card titles |
| | Body Text | `text-sm text-zinc-300 leading-relaxed` | Descriptions, article prose |
| | Meta / Micro | `text-xs text-zinc-400 font-medium` | Timestamps, reading times, version numbers |

---

## 3. Visual Modes: Editorial vs. Structured

The application purposefully supports two complementary visual modes sharing the identical design system:

### 3.1 Editorial / Expressive Mode
- **Pages**: Homepage (`/`), Featured App showcases, Engineering Blog (`/blog`, `/blog/[slug]`).
- **Characteristics**:
  - Radial gradient atmospheric glows (`bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.500/10),transparent)]`).
  - Fluid asymmetric grid compositions (e.g. 3-column span for featured lead blog posts).
  - Editorial spacing (`py-16 sm:py-20`), rich markdown typography, and social share actions.

### 3.2 Structured / Archival Mode
- **Pages**: Apps Directory (`/apps`), Knowledge Base (`/help`), User Library (`/library`), Support Desk (`/support`), Admin Portal (`/admin/*`).
- **Characteristics**:
  - Predictable, scannable density with uniform card grids and structured headers.
  - High-efficiency discovery controls (search inputs, horizontal pill carousels, sorting selectors).
  - Data-heavy tables with responsive horizontal scrolling (`overflow-x-auto`).

---

## 4. Component Duplications Removed & Verified
1. **Header Consolidation**: Replaced duplicate raw headers in `layout.tsx` and `page.tsx` with unified [`PublicHeader.tsx`](file:///Users/sourav/Developer/WEB/elsesourav/apps/web/components/navigation/PublicHeader.tsx).
2. **Tailwind Content Path Fix**: Added `'./features/**/*.{ts,tsx}'` to `apps/web/tailwind.config.ts` to ensure zero CSS class purges in production builds.
3. **Shared Card Primitives**: Unified card padding, border opacity, and backdrop blur across all feature cards using base `@elsesourav/ui` tokens.

---

## 5. Accessibility & Contrast Compliance
- All text meets or exceeds WCAG AA (4.5:1) and AAA (7:1) contrast standards.
- Interactive controls use consistent focus rings: `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`.
- Color is never used as the sole state communicator — all badges and status indicators pair color styling with clear text labels or descriptive icons.
