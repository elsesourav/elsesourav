# @elsesourav/ui — Design System & Component Library

The official, accessible, performance-first design system and interaction library powering the **ElseSourav** platform.

---

> ## ⚠️ Mandatory UI Development Workflow (Skill-First Policy)
>
> **Every developer and AI coding agent (including Gemini Code, Antigravity, Claude, etc.) must strictly adhere to the following mandatory workflow for all UI tasks:**
>
> 1. **Read & Follow Skills/Docs First**: Before making any UI changes or creating new components, always read and follow the relevant UI development skill or documentation first (`packages/ui/README.md`, `docs/design/DESIGN_CONSTITUTION.md`, `docs/design/THEME_TOKEN_ARCHITECTURE.md`, `docs/design/ADMIN_UI_DEVELOPMENT_GUIDELINES.md`).
> 2. **Mandatory Step**: Treat this as a mandatory step for every UI-related task, including bug fixes, updates, redesigns, and new components.
> 3. **Design, Accessibility & Maintainability**: Use the guidelines to ensure consistent design tokens, WCAG 2.1 AA accessibility, fluid responsive layouts, strict TypeScript (0 errors, 0 `any`), and modularity (**strictly under 500 lines of code per file**).
> 4. **Synchronize Documentation**: After creating or modifying components, update `README.md` immediately to document the changes and keep it synchronized with the actual codebase.
> 5. **Anti-Duplication Principle**: Avoid duplicating existing components. Reuse and extend existing primitives (`@elsesourav/ui`), physics components (`@elsesourav/ui/interior`), and micro-interactions (`@elsesourav/ui/micro`) whenever practical.
> 6. **Clarity for Future Collaborators**: Keep all documentation detailed, well-organized, and intuitive for future human engineers and AI coding agents.

---

## Architecture & Subpath Exports

The `@elsesourav/ui` library is architected into three specialized, high-performance subpaths to optimize bundle size, avoid tree-shaking overhead, and isolate physics engines:

```
@elsesourav/ui
├── .                    -> Core primitives, layouts, forms, surfaces, overlays, navigation
├── /interior            -> 54 fluid physics & tactile components (powered by motion/react)
└── /micro               -> 34 high-energy micro-interactions (matter.js, three, motion/react)
```

### Import Conventions:

```tsx
// 1. Core Primitives & Layout Shells
import { Button, Card, Dialog, Input, PageShell } from '@elsesourav/ui';

// 2. Interior Fluid Physics Components
import { BlurUpImage, HoldToConfirm, LoadingButton, OtpInput } from '@elsesourav/ui/interior';

// 3. Playful Micro-Interactions & Physics Toys
import { BellToggle, RubberSegment, SquishSwitch } from '@elsesourav/ui/micro';
```

---

## Semantic Color & Theme Token Architecture

All colors and surfaces are driven by HSL CSS custom variables defined in `globals.css` and mapped to Tailwind CSS utilities:

| Token                           | CSS Variable                   | Dark Hex / Value             | Light Hex / Value            | Purpose                                      |
| :------------------------------ | :----------------------------- | :--------------------------- | :--------------------------- | :------------------------------------------- |
| **`--background`**              | `hsl(var(--background))`       | `#09090b` (`240 10% 3.9%`)   | `#ffffff` (`0 0% 100%`)      | Main viewport foundation canvas              |
| **`--foreground`**              | `hsl(var(--foreground))`       | `#fafafa` (`0 0% 98%`)       | `#09090b` (`240 10% 3.9%`)   | Primary high-contrast body text              |
| **`--surface`**                 | `hsl(var(--surface))`          | `#0d0d10` (`240 10% 4.9%`)   | `#f4f4f5` (`240 5% 96%`)     | Base card and panel surface                  |
| **`--surface-subtle`**          | `hsl(var(--surface-subtle))`   | `#131317` (`240 6% 8%`)      | `#ececee` (`240 5% 93%`)     | Inset code pre-blocks, table headers         |
| **`--surface-elevated`**        | `hsl(var(--surface-elevated))` | `#1b1b20` (`240 5% 11%`)     | `#ffffff` (`0 0% 100%`)      | Floating dropdowns, popovers, flyouts        |
| **`--surface-overlay`**         | `hsl(var(--surface-overlay))`  | `#09090b` (`240 10% 3.9%`)   | `#ffffff` (`0 0% 100%`)      | Modal dialog scrims and overlays             |
| **`--primary`**                 | `hsl(var(--primary))`          | `#6366f1` / `#818cf8`        | `#4f46e5` (`238 83% 58%`)    | Primary brand accent and focus rings         |
| **`--secondary`**               | `hsl(var(--secondary))`        | `#27272a` (`240 3.7% 15.9%`) | `#f4f4f5` (`240 4.8% 95.9%`) | Secondary buttons, subtle pill badges        |
| **`--muted-foreground`**        | `hsl(var(--muted-foreground))` | `#a1a1aa` (`240 5% 64.9%`)   | `#71717a` (`240 3.8% 46.1%`) | Secondary labels, descriptions, timestamps   |
| **`--border`**                  | `hsl(var(--border))`           | `#27272a` (`240 3.7% 15.9%`) | `#e4e4e7` (`240 5.9% 90%`)   | Standard card and container borders          |
| **`--border-subtle`**           | `hsl(var(--border-subtle))`    | `#18181b` (`240 4% 11%`)     | `#f4f4f5` (`240 4.8% 95.9%`) | Dividers, row borders, table grid lines      |
| **`--success`**                 | `hsl(var(--success))`          | `#34d399` (`152 69% 52%`)    | `#059669` (`160 84% 39%`)    | Success confirmations, online presence       |
| **`--warning`**                 | `hsl(var(--warning))`          | `#fbbf24` (`45 93% 58%`)     | `#d97706` (`38 92% 50%`)     | Warnings, pending states, cautious actions   |
| **`--error` / `--destructive`** | `hsl(var(--error))`            | `#f87171` (`0 62.8% 50.6%`)  | `#dc2626` (`0 72% 51%`)      | Form validation errors, destructive buttons  |
| **`--info`**                    | `hsl(var(--info))`             | `#38bdf8` (`199 89% 60%`)    | `#0284c7` (`201 96% 32%`)    | Information badges, tooltips, system notices |
| **`--ambient-pointer-glow`**    | `var(--ambient-pointer-glow)`  | `rgba(99, 102, 241, 0.08)`   | `rgba(99, 102, 241, 0.14)`   | Desktop cursor follow ambient illumination   |

---

## 5-Layer Surface Elevation Hierarchy

1. **Layer 0 (Canvas — `.depth-0`)**: Deep `#09090b` viewport foundation (`bg-background`).
2. **Layer 1 (Subtle Inset — `.depth-1`)**: Embedded blocks, table headers, inset preview areas (`bg-surface-subtle`).
3. **Layer 2 (Solid Surface — `.depth-2`)**: Standard content cards, data tables, sidebars (`bg-surface` or `bg-surface-elevated`).
4. **Layer 3 (Overlays — `.depth-3`)**: Dropdown menus, tooltips, dialogs, drawers (`bg-surface-overlay` with `shadow-xl`).
5. **Layer 4 (Focused — `.depth-4`)**: Active selection rings, brand illumination rings (`ring-2 ring-primary/40`).

---

## Visual Effects & Scroll Performance Fidelity Engine (`data-effects`)

The platform supports a 3-tier visual effects and scroll performance engine controlled exclusively via database `SiteSetting[effects_level]` in the Admin Dashboard (`/admin/settings` -> UI & Effects tab) and rendered platform-wide on `<html data-effects="high" | "medium" | "low">`. Regular users cannot modify this setting.

| Fidelity Level | `data-effects` | Backdrop Blur | Elevation Shadows | Ambient Glow Fields | Target Device / Profile |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High (Default)** | `'high'` | Full multi-layer (up to 40px) | Deep 3D elevation + neon cards | Dynamic drifting cosmic orbs | High-end desktop GPUs |
| **Medium (Balanced)** | `'medium'` | Clamped light blur (4px max) | Single-layer soft shadows (4–6px) | Static dimmed glow (paused) | Laptops & smooth 60 FPS scrolling |
| **Low (Performance)** | `'low'` | **Zero** (`backdrop-filter: none`) | **Flat** (crisp hairline borders) | **Disabled** (zero GPU convolution) | Ultra-smooth butter scroll on all devices |

### Global Token Overrides in `low` Mode:
- Zero backdrop-filter shaders across all `[class*='backdrop-blur']` and glass cards, eliminating GPU compositor re-rasterization during scroll.
- Flat elevation shadows (`box-shadow: none !important`), converting floating card depth into crisp, accessible hairline borders across all card and button variants.
- Background glow orbs (`.ambient-glow-orb`, `div[class*='blur-3xl']`, `div[class*='blur-2xl']`, `div[class*='blur-xl']`) and atmospheric canvas loops (`.hero-atmospheric-canvas`) are hidden (`display: none !important`), eliminating offscreen Gaussian blur calculations and RAF render loops.
- Translucent cards, sticky headers, and navigations solidified with opaque canvas colors (`hsl(var(--surface))` / `hsl(var(--background))`) to ensure zero background bleed.

---

## Typography Architecture

The platform uses a unified 3-tier font system loaded with zero layout shift (CLS) via `next/font/google`:

- **Display & Headings (`--font-display` / `font-display`)**: **Outfit** — Geometric, crisp, and high-impact across hero headlines, section titles, and modal headers.
- **Body & UI Elements (`--font-sans` / `font-sans`)**: **Plus Jakarta Sans** — Highly legible, modern neutral grotesque optimized for dashboard widgets, reading comfort, and small UI scales.
- **Monospace & Metrics (`--font-mono` / `font-mono`)**: **JetBrains Mono** — Technical precision for code blocks, badges, system metrics, and numeric telemetry.

---

# Part 1: Core Primitives & Layout Foundations (`@elsesourav/ui`)

All components in this section are exported directly from `@elsesourav/ui`.

```tsx
import { ... } from '@elsesourav/ui';
```

## Category 1: Foundation Primitives

### `Button` & `IconButton`

- **Purpose**: Tactile, accessible, physics-enhanced triggers for actions, submissions, navigation, and modal dismissals.
- **Key Features**:
  - **Motion Physics**: Driven by `motion/react` spring physics (`CELL = { stiffness: 520, damping: 34, mass: 0.45 }`) with tactile micro-press `whileTap: { y: 1, scale: 0.985 }`.
  - **Accessibility First**: Automatic `prefers-reduced-motion` fallback via `useReducedMotion()`, ARIA live regions for copy/loading states, keyboard navigation.
  - **Integrated Loading State**: Seamless rotating SVG spinner with `loadingText` blur/crossfade and layout stabilization (zero CLS).
  - **Integrated Copy to Clipboard**: Pass `copyValue="text"` to transform any button into a morphing copy trigger with SVG checkmark path draw animation and fallback clipboard writer.
  - **Ripple Bloom**: Optional radial physics ripple on pointer/keyboard press (`ripple?: boolean`).
  - **Slots & Single-Line Flex**: Direct flex layout with zero layout-shift `leftIcon` and `rightIcon` slots or direct inline SVG + text children (`whitespace-nowrap inline-flex items-center gap-[size] [&_svg]:inline-block [&_svg]:shrink-0 [&_svg]:align-middle [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2`) preventing vertical stacking or rogue wrapper breaks.
- **Props**:
  - `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive' | 'subtle' | 'elevated'` (default: `'primary'`)
  - `size`: `'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'` (default: `'md'`)
  - `loading?: boolean` / `isLoading?: boolean`
  - `loadingText?: string`
  - `copyValue?: string`
  - `copiedLabel?: string`
  - `leftIcon?: React.ReactNode`
  - `rightIcon?: React.ReactNode`
  - `ripple?: boolean`
  - `disabled?: boolean`
  - `children: React.ReactNode`
- **Usage Example**:
  ```tsx
  import { Button, IconButton } from '@elsesourav/ui';
  import { Sparkles, Trash2, ArrowRight } from 'lucide-react';

  // Tactile primary with loading state and icons
  <Button
    variant="primary"
    size="md"
    loading={isPending}
    loadingText="Saving..."
    leftIcon={<Sparkles className="h-4 w-4" />}
    rightIcon={<ArrowRight className="h-4 w-4" />}
    onClick={handleSave}
  >
    Save Changes
  </Button>

  // Morphing copy button
  <Button
    variant="outline"
    size="sm"
    copyValue="https://elsesourav.com/apps/nexus"
    copiedLabel="Link Copied!"
  >
    Copy Link
  </Button>

  // Accessible icon button
  <IconButton
    variant="ghost"
    size="icon-sm"
    aria-label="Delete item"
    icon={<Trash2 className="h-4 w-4 text-rose-400" />}
    onClick={handleDelete}
  />
  ```
- **When & Where to Use**: Use across all forms, dialog footers, navigation bars, cards, and toolbars. Use `destructive` / `danger` only for irreversible or sensitive operations.
- **Responsive Ergonomics & Anti-Duplication**: In mobile viewports (`< 640px`, including compact 350px and phablet 600px screens), always prefer `size="xs"` or `size="sm"` with responsive padding classes (e.g. `text-[10px] sm:text-xs h-6.5 sm:h-7 px-2 sm:px-3`), enabling `ripple` for physical click feedback and responsive text labels (e.g. `Change` on mobile, `Change Password` on desktop) to prevent button wrapping and preserve compact form alignment. Native `<button>` elements must never be used directly in user pages—always compose `@elsesourav/ui` `Button` or `@elsesourav/ui/interior` `LoadingButton`.

---

### `Badge`

- **Purpose**: Compact visual tag indicating status, category, count, or metadata.
- **Key Features**: High-contrast text exceeding WCAG 4.5:1 ratio, subtle border accent, rounded pill shape.
- **Props**:
  - `variant`: `'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline'`
  - `size`: `'sm' | 'md'` (default: `'md'`)
- **Usage Example**:
  ```tsx
  import { Badge } from '@elsesourav/ui';

  <Badge variant="success" size="sm">Active</Badge>
  <Badge variant="warning">Pending Review</Badge>
  <Badge variant="outline">v2.0.0</Badge>
  ```
- **When & Where to Use**: User profile statuses, blog tags, project tech stacks, table cell statuses, notification count pills.

---

### `Avatar`

- **Purpose**: Circular visual representation of a user, organization, or identity.
- **Key Features**: Smooth fallback initials generator, image load error handling with zero broken text overflow during network loading or offline fallback, automatic `referrerPolicy="no-referrer"` for secure Google/GitHub OAuth CDN loading, border ring for dark mode definition.
- **Props**:
  - `src?: string`
  - `alt: string`
  - `fallback: string`
  - `size?: 'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- **Usage Example**:
  ```tsx
  import { Avatar } from '@elsesourav/ui';

  <Avatar src="/images/avatar.jpg" alt="Sourav" fallback="SO" size="lg" />;
  ```
- **When & Where to Use**: Profile headers, comment streams, account navigation menus, collaborator lists.

---

### `Separator`

- **Purpose**: Accessible visual divider separating content sections or layout groups.
- **Key Features**: Supports horizontal or vertical orientation, semantic `role="separator"`.
- **Props**:
  - `orientation?: 'horizontal' | 'vertical'` (default: `'horizontal'`)
  - `className?: string`
- **Usage Example**:
  ```tsx
  import { Separator } from '@elsesourav/ui';

  <Separator orientation="horizontal" className="my-6" />;
  ```

---

## Category 2: Layout & Structural Shells

### `Container`

- **Purpose**: Standard horizontal constraint container that centers content and enforces responsive side gutters.
- **Key Features**: Consistent max-width breakpoints (`max-w-7xl`, `max-w-5xl`, etc.), responsive padding (`px-4 sm:px-6 lg:px-8`).
- **Props**:
  - `size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'prose' | 'full'`
  - `className?: string`
- **Usage Example**:
  ```tsx
  import { Container } from '@elsesourav/ui';

  <Container size="lg">
    <Content />
  </Container>;
  ```

---

### `PageShell`

- **Purpose**: Unified outer viewport wrapper providing consistent background depth, compact responsive top padding (`pt-3 sm:pt-5`) under sticky headers, and bottom layout rhythm (`pb-12 sm:pb-16`).
- **Key Features**: Coordinates ambient background effects, skip-link integration, and SEO semantics. Prevents excessive top margin/padding under sticky navigation headers.
- **Props**:
  - `size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'prose' | 'full'`
  - `glow?: boolean`
  - `padded?: boolean` (defaults to `true`, applying `pt-3 sm:pt-5 pb-12 sm:pb-16`)
  - `className?: string`
  - `children: React.ReactNode`
- **Usage Example**:
  ```tsx
  import { PageShell, Container } from '@elsesourav/ui';

  export default function ProfilePage() {
    return (
      <PageShell>
        <Container size="lg">...</Container>
      </PageShell>
    );
  }
  ```

---

### `Section` & `SectionHeader`

- **Purpose**: Semantic `<section>` element with automated vertical spacing, anchored heading hierarchy, and subtitle styling.
- **Key Features**: Monospace eyebrow tag support, optional action button slot in header.
- **Props**:
  - `title: string`
  - `subtitle?: string`
  - `badge?: string`
  - `action?: React.ReactNode`
- **Usage Example**:
  ```tsx
  import { Section, SectionHeader } from '@elsesourav/ui';

  <Section>
    <SectionHeader
      badge="SECURITY"
      title="Two-Factor Authentication"
      subtitle="Add an extra layer of defense to your developer account."
      action={<Button size="sm">Enable</Button>}
    />
    <div className="mt-6">...</div>
  </Section>;
  ```

---

### `AmbientBackground`

- **Purpose**: Non-intrusive GPU-accelerated gradient aura and micro-dot grid providing subtle depth to hero sections and settings headers. Calibrated with restrained ambient opacities to preserve deep obsidian space contrast (`#0a0b14`) without muddy purple over-glow.
- **Key Features**: Automatically integrates with `data-effects="high" | "medium" | "low"` and `prefers-reduced-motion`. In `medium` mode, animations are paused and opacities dimmed. In `low` mode, blurred gradient orbs are removed from the compositor completely for maximum scroll performance.
- **Usage Example**:
  ```tsx
  import { AmbientBackground } from '@elsesourav/ui';

  <AmbientBackground variant="home" />;
  ```

---

### `ContentGrid` & `EditorialLayout`

- **Purpose**: Structured grid systems for blog posts, project listings, and long-form technical documentation.
- **Key Features**: Responsive 1-to-3 column reflow, sticky sidebar table-of-contents support.
- **Usage Example**:
  ```tsx
  import { ContentGrid } from '@elsesourav/ui';

  <ContentGrid columns={3}>
    <Card>Project 1</Card>
    <Card>Project 2</Card>
    <Card>Project 3</Card>
  </ContentGrid>;
  ```

---

### `SkipLink`

- **Purpose**: Accessibility skip-to-content anchor for keyboard and screen reader users.
- **Key Features**: Visually hidden until focused via `Tab`, jumps focus directly to `#main-content`.
- **Usage Example**:
  ```tsx
  import { SkipLink } from '@elsesourav/ui';

  <SkipLink targetId="main-content" />;
  ```

---

## Category 3: Form Controls & Inputs

### `Input` & `Textarea`

- **Purpose**: Text entry fields engineered with strict focus rings, error states, and clear placeholder contrast.
- **Key Features**: Dark-mode optimized background (`bg-surface-subtle`), red error ring on invalid state, disabled opacity handling.
- **Props**:
  - `error?: string`
  - Standard HTML input / textarea attributes
- **Usage Example**:
  ```tsx
  import { Input, Textarea } from '@elsesourav/ui';

  <Input
    type="email"
    placeholder="you@example.com"
    error={errors.email?.message}
    {...register('email')}
  />;
  ```

---

### `FormField` & `Label`

- **Purpose**: Accessible form field wrapper connecting `Label`, control, helper text, and validation error message.
- **Key Features**: Automatic `htmlFor` and `aria-describedby` wiring, optional `required` asterisk.
- **Usage Example**:
  ```tsx
  import { FormField, Input } from '@elsesourav/ui';

  <FormField
    label="Full Name"
    required
    error={errors.name}
    description="Visible on your public profile."
  >
    <Input placeholder="Sourav" />
  </FormField>;
  ```

---

### `Select`, `Checkbox`, `Switch`, `RadioGroup`

- **Purpose**: Form selection controls complying with WCAG 2.1 AA keyboard navigation (Arrow keys, Space to toggle).
- **Usage Example**:
  ```tsx
  import { Switch, Checkbox, Select, RadioGroup, RadioGroupItem } from '@elsesourav/ui';

  <Switch
    label="Email notifications"
    description="Receive security alerts whenever your account is accessed."
    checked={notify}
    onChange={setNotify}
  />;
  ```

---

### `ImageUploadWithCrop` & `ImageCropperModal` (`useCropInteraction`)

- **Purpose**: Accessible, high-precision client-side interactive image cropping, corner-drag resizing, and dimension optimization system powered by the modular `useCropInteraction` hook.
- **Key Features**:
  - **Top-Level Body Portal & Viewport Overlay**: Modal renders via `createPortal` directly into `document.body` with `fixed inset-0 z-[99999]` and `bg-black/85 backdrop-blur-md`, guaranteeing the crop window breaks out of any parent card stacking contexts, transforms, or overflow boundaries to sit on the absolute top visual layer of the application. Includes automatic document scroll locking, outside backdrop click dismissal, and `Escape` key close. Full dual-theme styling (`bg-white dark:bg-zinc-950`).
  - **Interactive Resizable Crop Selection**: 4 tactile corner handles (`nw`, `ne`, `se`, `sw`) and 4 edge midpoint handles (`n`, `s`, `w`, `e`) with fixed opposing-corner anchors, continuous window-level pointer tracking, and smooth dragging and resizing directly on the image.
  - **Quick Framing Actions**: One-click **Fit Full** (`fitFullImage`) button to maximize the crop frame across the full width and height of the image, and **Center** (`centerCrop`) button to re-center the crop frame.
  - **Smart Ratio Detection & Upload**: Direct upload when the selected image matches the target aspect ratio; automatically opens the crop modal if the aspect ratio deviates, with on-demand manual crop buttons.
  - **Preset Aspect Ratios & Freeform**: Instant preset pills for `1:1 Square`, `4:3 Standard`, `3:4 Portrait`, `16:9 Hero`, `21:9 Ultrawide`, `1:6 Carousel/Slider`, `6:1 Banner`, and `Free` (unconstrained rectangle drag).
  - **Aspect Ratio Locking**: Toggle between `Locked` (strict proportional scaling from corners) and `Free` (independent 8-handle resizing) at any time.
  - **Unrestricted Viewport Zoom**: Zoom out to `0.25x` (25%) so the full image width and height boundaries are clearly visible with generous margins, with zoom in up to `3.0x` (300%), percentage readout, 100% reset button, and rule-of-thirds 3×3 composition grid lines.
  - Automatic target dimension enforcement with bicubic high-smoothing HTML5 Canvas export to WebP/PNG.
  - Direct integration with Cloudinary signed server actions.
- **Props**:
  - `value`: `string`
  - `onChange`: `(url: string) => void`
  - `onUploadFile?: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>`
  - `aspectRatio?: number | null` (default: `1`)
  - `allowedRatios?: PresetRatioOption[]` (Optional list of allowable ratio options to constrain cropping)
  - `cropShape?: 'round' | 'rect'`
  - `targetWidth?: number` (default: `512`)
  - `targetHeight?: number` (default: `512`)
  - `previewShape?: 'circle' | 'square' | 'banner' | 'portrait'`
- **Usage Example**:
  ```tsx
  import { ImageUploadWithCrop } from '@elsesourav/ui';

  <ImageUploadWithCrop
    label="Creator Avatar"
    value={avatarUrl}
    onChange={setAvatarUrl}
    cropShape="round"
    aspectRatio={1}
    targetWidth={512}
    targetHeight={512}
    previewShape="circle"
    onUploadFile={async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return await uploadAction(formData);
    }}
  />;
  ```

---

## Category 4: Surfaces & Elevation

### `Card` Suite

- **Purpose**: Primary surface container for chunking related information, stats, or configuration settings.
- **Subcomponents**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Responsive Padding**: Standardized fluid padding scale (`p-3 sm:p-4 md:p-5`): compact on mobile devices, gently expanding on tablet, and optimized for desktop clarity without oversized padding.
- **Hover & Interaction Convention**: Card containers avoid whole-card hover scaling or translation shifts (`hover:scale-*`, `hover:-translate-y-*`); interaction emphasis is directed cleanly to inner image zoom (`group-hover:scale-105 duration-300/500`) and subtle border/shadow transitions.
- **Props**:
  - `variant`: `'default' | 'solid' | 'subtle' | 'elevated' | 'glass' | 'interactive'`
  - `depth`: `0 | 1 | 2 | 3 | 4`
- **Usage Example**:
  ```tsx
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Button,
  } from '@elsesourav/ui';

  <Card variant="default">
    <CardHeader>
      <CardTitle>API Access Tokens</CardTitle>
      <CardDescription>Manage keys used to authenticate with ElseSourav REST API.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">No active tokens.</p>
    </CardContent>
    <CardFooter>
      <Button size="sm">Generate New Token</Button>
    </CardFooter>
  </Card>;
  ```

---

### `GlassSurface`

- **Purpose**: Controlled glassmorphic container utilizing backdrop-filter blur and hairline borders.
- **Key Features**: Adheres to the "Maximum 2 glass elements per viewport" rule to preserve rendering performance.
- **Props**:
  - `blur`: `'sm' | 'md' | 'lg' | 'xl'`
  - `intensity`: `'subtle' | 'medium' | 'high'`
- **Usage Example**:
  ```tsx
  import { GlassSurface } from '@elsesourav/ui';

  <GlassSurface blur="md" intensity="medium" className="p-6 rounded-2xl">
    <h3>Highlighted Feature</h3>
  </GlassSurface>;
  ```

---

## Category 5: Feedback & Status Indicators

### `Alert`, `AlertTitle`, `AlertDescription`

- **Purpose**: Inline contextual notices communicating errors, security warnings, or system confirmations with built-in semantic icons and WCAG AA/AAA compliant high-contrast color scales for light and dark modes.
- **Variants**: `'info' | 'success' | 'warning' | 'error'`
- **Usage Example**:
  ```tsx
  import { Alert, AlertTitle, AlertDescription } from '@elsesourav/ui';

  <Alert variant="error">
    <AlertTitle>Action required</AlertTitle>
    <AlertDescription>Failed to verify the security code. Please try again.</AlertDescription>
  </Alert>;
  ```

---

### `ToastProvider` & `useToast`

- **Purpose**: Non-blocking floating status notifications appearing at the bottom-right corner.
- **Key Features**: Lightweight zero-dependency toast queue, auto-dismissal timer, screen-reader polite announcement.
- **Usage Example**:
  ```tsx
  import { useToast } from '@elsesourav/ui';

  const { toast } = useToast();
  toast.success('Profile avatar updated successfully!');
  toast.error('Failed to update email. Please try again.');
  ```

---

### `EmptyState` & `ErrorState`

- **Purpose**: Standardized visual placeholders for empty query results or network/server failure boundaries.
- **Usage Example**:
  ```tsx
  import { EmptyState, ErrorState } from '@elsesourav/ui';
  import { FolderArchive } from 'lucide-react';

  <EmptyState
    icon={FolderArchive}
    title="No Repositories Found"
    description="Connect your GitHub account or create a new repository to get started."
    action={<Button size="sm">Create Repository</Button>}
  />;
  ```

---

### `Skeleton` Suite & Content Loading Architecture

- **Purpose**: Shimmering content placeholder primitives designed for in-page asynchronous streaming and filter state transitions (preventing disruptive full-screen takeovers during search/filtering).
- **Subcomponents**: `Skeleton`, `SkeletonText`, `SkeletonBadge`, `SkeletonButton`, `SkeletonAvatar`, `SkeletonImage`, `CardSkeleton`, `TableSkeleton`, `DetailSkeleton`.
- **Dedicated Route Skeletons**:
  - `SupportDeskPageSkeleton`: Mirrored responsive skeleton for the public support desk (`/support`), matching ticket creation form, dropdowns, and callout banner.
  - `SupportTicketsPageSkeleton`: Mirrored responsive skeleton for ticket lists (`/support/tickets`), matching filter tabs and ticket item cards across mobile (350px/600px), tablet (768px), and desktop (1280px).
  - `SupportTicketDetailSkeleton`: Mirrored responsive skeleton for ticket conversations (`/support/tickets/[id]`), matching breadcrumbs, metadata badges, message thread bubbles, and reply composer.
  - `HelpCategoryArticlesSkeleton`: Mirrored responsive skeleton for category articles grid (`/help/[categorySlug]`).
- **Loading Architecture Guidelines**:
  - **In-Page Changes (Filters, Queries, Tags, Search, Sorting)**: ALWAYS use in-page content skeletons (`AppsCatalogSkeleton`, `UpdatesCatalogSkeleton`, `SearchLoadingSkeleton`, etc.). Never display full-screen loading screens for inside-page modifications.
  - **Cross-Route Transitions (Page Changes)**: Full-screen canvas logo loader (`PageTransitionLoader`) triggers strictly when navigating between different pathnames (`targetUrl.pathname !== currentPathname`), running a single smooth convergence animation without loops or restarts.
  - **Zero-Lag Loading Screen Architecture**: Runtime transitions strictly consume in-memory array points (`parseLogoPixels`) with 0ms startup latency and zero runtime image downloading. All logo sampling is performed once during admin upload (`extractLogoPixelsFromUrl`), converted to a lightweight ~146-particle matrix (~876 bytes), and persisted to `site_logo_pixels_json`. Particle convergence uses pure continuous parametric cubic easing (`easeOutCubic = 1 - (1 - t)^3`) to eliminate visual snapping and stutter.
- **Usage Example**:
  ```tsx
  import { Skeleton, SkeletonBadge, CardSkeleton } from '@elsesourav/ui';

  // In-page catalog filter loading state
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
  ```

---

## Category 6: Overlays & Contextual Triggers

### `Dialog` Suite

- **Purpose**: Accessible modal overlay for focused workflows (delete confirmations, edit modal forms).
- **Subcomponents**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- **Key Features**: Automatic focus trap, Esc key listener, backdrop blur scrim, accessible ARIA labeling.
- **Usage Example**:
  ```tsx
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Button,
  } from '@elsesourav/ui';

  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogDescription>
          This action is irreversible. All your data will be permanently wiped.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete Account
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
  ```

---

### `Drawer` Suite

- **Purpose**: Slide-out panel originating from the right or left viewport edge, ideal for mobile filters and navigation.
- **Key Features**: Smooth CSS transition, body scroll-lock during display.

---

### `DropdownMenu` Suite

- **Purpose**: Contextual menu anchored to a trigger button for secondary options.
- **Subcomponents**: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`.
- **Usage Example**:
  ```tsx
  import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    Button,
  } from '@elsesourav/ui';
  import { MoreVertical } from 'lucide-react';

  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => edit()}>Edit</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => archive()}>Archive</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
  ```

---

### `Tooltip` Suite

- **Purpose**: Lightweight hover/focus label explaining icon buttons or truncated metadata.

---

## Category 7: Navigation & Content Flow

### `Tabs` Suite

- **Purpose**: Accessible tabbed interface partitioning related content views within the same URL route.
- **Subcomponents**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- **Usage Example**:
  ```tsx
  import { Tabs, TabsList, TabsTrigger, TabsContent } from '@elsesourav/ui';

  <Tabs defaultValue="general">
    <TabsList>
      <TabsTrigger value="general">General</TabsTrigger>
      <TabsTrigger value="security">Security</TabsTrigger>
      <TabsTrigger value="billing">Billing</TabsTrigger>
    </TabsList>
    <TabsContent value="general">
      <GeneralSettings />
    </TabsContent>
    <TabsContent value="security">
      <SecuritySettings />
    </TabsContent>
    <TabsContent value="billing">
      <BillingSettings />
    </TabsContent>
  </Tabs>;
  ```

---

### `Breadcrumb` & `Pagination`

- **Purpose**: Hierarchical navigation trail and accessible pagination controls for large data tables.

---

### `BrandLogo`

- **Purpose**: Unified, responsive wordmark component presenting the signature ElseSourav identity with zero layout shift (CLS = 0).
- **Key Features**:
  - Automatically switches between crisp solid black (light mode) and glowing solid white (dark mode) via `variant="theme"`.
  - Supports color SVG/PNG variant (`variant="color"`) featuring the full vibrant magenta to cyan gradient.
  - Scaled down 40% for optimal ergonomic fit in desktop, tablet, and mobile (350×750) headers and footers.
  - Screen-reader accessible with `<span className="sr-only">ElseSourav</span>`.
- **Props**:
  - `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'` (default: `'md'`)
  - `variant`: `'color' | 'theme' | 'white' | 'black'` (default: `'color'`)
  - `priority?: boolean`
- **Usage Example**:
  ```tsx
  import { BrandLogo } from '@/components/brand/BrandLogo';

  // Theme-adaptive brand wordmark (black in light, white in dark)
  <BrandLogo size="md" variant="theme" />

  // Full color brand SVG version
  <BrandLogo size="md" variant="color" />
  ```

---

### `BackToTopButton`

- **Purpose**: Accessible, smooth-scrolling tactile trigger returning viewport to top of page (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
- **Key Features**:
  - Works globally across all routes regardless of target section IDs.
  - Animated directional arrow with spring elevation on hover and tap.
  - Full keyboard focus ring and ARIA label.
- **Props**:
  - `label?: string` (default: `'Back to Top'`)
  - `className?: string`
- **Usage Example**:
  ```tsx
  import { BackToTopButton } from '@/components/navigation/BackToTopButton';

  <BackToTopButton />
  ```

---

### `Navigation Headroom & Auto-Hide`

- **Purpose**: High-performance auto-hiding header navigation powered by `useHeaderHeadroom`. Smoothly hides on downward scroll and reveals on upward scroll, maximizing mobile and desktop reading canvas while maintaining instant access to navigation.
- **Key Characteristics**:
  - Hardware-accelerated CSS transforms (`translate-y-0` vs `-translate-y-full`) with `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Directional hysteresis threshold (10px) to prevent micro-jitter and trackpad bounce fluttering.
  - Zero layout thrashing via `requestAnimationFrame` and passive scroll event listeners.

---

### `MobileBottomNav`

- **Purpose**: Full-width mobile bottom navigation bar (`md:hidden`) attached directly to the bottom edge, mirroring the top header, offering streamlined, reciprocal scroll-aware navigation across primary destinations (`Apps`, `Updates`, `About`, `Account`).
- **Key Features**:
  - **Full-Width Edge-to-Edge Architecture**: Flushed against the bottom viewport edge with safe-area inset compensation (`env(safe-area-inset-bottom)`) and frosted glassmorphism backdrop (`backdrop-blur-xl`).
  - **Reciprocal Scroll Synchronization**: Automatically reveals when scrolling down or at the page bottom; smoothly slides down when scrolling up or at the top of the viewport (when the top header is active).
  - **Gliding Active Indicator**: Morphing active pill indicator powered by `layoutId="mobile-bottom-nav-active-indicator"` and spring dynamics.
  - **Tactile Micro-Interactions**: Haptic-style scale tap feedback and icon spring lift.
  - **Fluid Transitions**: Entrance and exit orchestrated with `AnimatePresence` and spring physics (`stiffness: 360, damping: 32`), with automatic `prefers-reduced-motion` override.
- **Destinations**:
  - `Apps` (`/apps`, `<Layers />`)
  - `Updates` (`/updates`, `<Sparkles />`)
  - `About` (`/about`, `<Info />` with `elsesourav:about-activate` custom event)
  - `Account` (`/profile` or `/login`, `<User />`)
- **Usage Example**:
  ```tsx
  import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

  <MobileBottomNav user={session?.user || null} />
  ```
  - Keyboard accessibility: automatically reveals if keyboard focus (`focusin`) moves inside the header.
  - Pinned visible at page top (`scrollY <= topOffset`) and when mobile dialogs/menus are active (`isLocked`).

---

## Category 8: Data Display, Markdown & Motion

### `Table` Suite

- **Purpose**: Horizontally responsive, accessible data tables with sticky headers and zebra row hover states.
- **Subcomponents**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`.

---

### `StatCard`

- **Purpose**: Key performance indicator (KPI) metric box with trend indicator.
- **Usage Example**:
  ```tsx
  import { StatCard } from '@elsesourav/ui';

  <StatCard label="Monthly Page Views" value="48.2k" change="+12.4%" changeType="positive" />;
  ```

---

### `MarkdownRenderer` & `AdminMarkdownEditor`

- **Purpose**: Secure, GFM-compliant modular markdown rendering suite with synchronized syntax highlighting (`sugar-high`), LaTeX math (KaTeX) support, theme-matched color tokens, copy actions, responsive tables, and full write/split/preview editing suite.
- **Key Features**:
  - **Modular Architecture (< 500 lines per file)**: Separated into `@elsesourav/ui` primitives:
    - `MarkdownRenderer`: Core block parser (headings, tables, callouts, lists, checklists, paragraphs).
    - `MarkdownCodeBlock`: Zero-lag syntax highlighting powered by `sugar-high` and CSS custom properties (`--sh-keyword`, `--sh-string`, etc.) with copy button and language badges.
    - `MathFormula`: Client-safe KaTeX LaTeX renderer with TeX copy action.
    - `renderInlineMarkdown`: Inline token sanitizer with strict XSS filtering for links, images, bold, italic, and inline code.
  - **Syntax Highlighting & Theme Tokens**: Handcrafted dark/light theme tokens matching ElseSourav's cosmic palette (Indigo keywords `#818cf8`, Emerald strings `#34d399`, Violet types `#c084fc`, Cyan properties `#38bdf8`, Amber literals `#fbbf24`).
  - **CSS Gutter Line Numbers**: Automatic line numbers for multi-line snippets using CSS counters without polluting copy-to-clipboard or DOM textContent.
  - **Language Badge & Normalization**: Automatically normalizes language tags (`ts`, `tsx`, `py`, `bash`, `rust`, `c`, `cpp`, `wasm`, `dockerfile`, etc.) and displays a terminal badge.
  - **Interactive Admin Editing**: Live Word and character count tracking, side-by-side split, write, and full preview modes.
- **When & Where to Use**: Technical blog articles, updates, documentation pages, admin CMS editor.

---

### `Reveal`, `RevealGroup`, `ScrollReveal`, `ScrollRevealGroup`

- **Purpose**: GPU-accelerated viewport entrance animations using native `IntersectionObserver`.
- **Key Features**:
  - Automatically respects `prefers-reduced-motion: reduce` by immediately revealing content statically.
  - SSR and JS-fallback resilient (renders with `opacity: 1` before client hydration).
  - Staggered card sequences (`staggerDelay: 0.06s`) without making the user wait.
  - Fires once (`once: true` by default) to avoid annoying re-triggering during minor scrolling.
- **Props**:
  - `direction?: 'up' | 'down' | 'left' | 'right' | 'fade'` (default: `'up'`)
  - `distance?: number` (default: `12`)
  - `delay?: number` (seconds)
  - `duration?: number` (default: `0.35s`)
  - `threshold?: number` (default: `0.05`)
- **Usage Example**:
  ```tsx
  import { ScrollReveal, ScrollRevealGroup } from '@elsesourav/ui';

  <ScrollReveal direction="up" distance={16}>
    <h2>Section Title</h2>
  </ScrollReveal>

  <ScrollRevealGroup staggerDelay={0.08} className="grid grid-cols-3 gap-6">
    <Card>Item 1</Card>
    <Card>Item 2</Card>
    <Card>Item 3</Card>
  </ScrollRevealGroup>
  ```

---

# Part 2: Fluid Physics Components (`@elsesourav/ui/interior`)

Import path:

```tsx
import { ... } from '@elsesourav/ui/interior';
```

The `@elsesourav/ui/interior` collection contains **54 physics-based animated UI components** powered by `motion/react`. They adapt automatically to theme tokens (`--interior-fg`, `--interior-bg`, `--interior-border`) and respect `prefers-reduced-motion`.

## Featured Physics Components

### 1. `BlurUpImage` & `useBlurUpImage`

- **Purpose**: Progressive image component that transitions from a lightweight blur placeholder or solid color to high-resolution asset without pop-in.
- **Key Features**:
  - Instant reveal for already cached browser images (zero unnecessary re-fade).
  - Smooth spring exposure transition (`duration: 0.65`, `cubic-bezier(0.23, 1, 0.32, 1)`).
  - Cross-origin CDN safety with automatic `referrerPolicy="no-referrer"` for Google/GitHub user avatars.
  - Automatic error and retry callbacks.
- **Props**:
  - `src?: string`
  - `alt: string`
  - `width?: number`, `height?: number` (optional when `fill: true`)
  - `fill?: boolean` (absolute inset-0 full-bleed cover layout)
  - `placeholder?: string` (base64 or thumbnail)
  - `color?: string` (dominant color placeholder)
  - `blur?: number` (default: `14`)
  - `radius?: number` (default: `11`, or `undefined` when `fill: true`)
  - `imgClassName?: string` (class names for inner image, e.g. object position/fit)
  - `className?: string` (container class names)
  - `loading?: 'lazy' | 'eager'`
  - `fetchPriority?: 'high' | 'low' | 'auto'`
- **Usage Example**:
  ```tsx
  import { BlurUpImage } from '@elsesourav/ui/interior';

  // Standard fixed aspect ratio:
  <BlurUpImage
    src="/portfolio/hero.jpg"
    alt="Project Preview"
    width={800}
    height={450}
    color="#18181b"
    blur={16}
    radius={12}
  />;

  // Full-bleed responsive fill:
  <BlurUpImage
    src="/hero/sky-bg.webp"
    placeholder="/hero/sky-bg-thumb.webp"
    alt="Hero sky background"
    fill
    loading="eager"
    fetchPriority="high"
    imgClassName="object-[82%_center] md:object-center object-cover"
  />;
  ```
- **When to Use**: Hero background scenes, profile avatar previews, blog header banners, image galleries.

---

### 2. `HoldToConfirm` & `useHoldToConfirm`

- **Purpose**: Intentional hold-down trigger requiring the user to press and hold for a designated duration before executing a destructive action.
- **Key Features**:
  - Spring-loaded progress fill bar with directional release decay.
  - Movement tolerance detection (cancels if finger/cursor drags away).
  - Supports keyboard hold (`Space` or `Enter`) and `Escape` to abort.
  - Haptic feedback trigger and ARIA progress semantics.
- **Props**:
  - `onConfirm: () => void`
  - `onAbort?: () => void`
  - `confirmLabel?: string` (default: `'Confirmed'`)
  - `duration?: number` (default: `1800` ms)
  - `variant?: 'default' | 'destructive'`
  - `children: React.ReactNode`
- **Usage Example**:
  ```tsx
  import { HoldToConfirm } from '@elsesourav/ui/interior';

  <HoldToConfirm
    variant="destructive"
    duration={2000}
    confirmLabel="Account Deleted"
    onConfirm={executeAccountWipe}
  >
    Hold to Delete Account
  </HoldToConfirm>;
  ```
- **When to Use**: Permanent data deletion, revoking critical API keys, database drops, leaving an organization.

---

### 3. `LoadingButton` & `useAsyncAction`

- **Purpose**: Fluid asynchronous action button with morphing spinner and success/error status badges.
- **Key Features**:
  - Seamless width crossfade between idle text, spinning circle, and "Done" checkmark.
  - Automatic timeout reset back to idle state (`resetAfter = 1400` ms).
  - Prevents double-submission while async promise is pending.
- **Props**:
  - `onAction: () => Promise<unknown> | unknown`
  - `children: string`
  - `pendingLabel?: string`
  - `successLabel?: string` (default: `'Done'`)
  - `errorLabel?: string` (default: `'Try again'`)
  - `resetAfter?: number`
- **Usage Example**:
  ```tsx
  import { LoadingButton } from '@elsesourav/ui/interior';

  <LoadingButton
    onAction={async () => {
      await updatePassword(newPassword);
    }}
    pendingLabel="Updating..."
    successLabel="Password Updated!"
  >
    Change Password
  </LoadingButton>;
  ```
- **When to Use**: Critical form submissions, checkout buttons, email updates, file upload triggers.

---

### 4. `OtpInput` & `useOtpInput`

- **Purpose**: Accessible multi-digit verification code input with smooth spring focus halos and auto-advance.
- **Key Features**:
  - Full paste support (auto-fills all slots upon pasting 6 digits from clipboard).
  - Backspace navigation (deletes current cell or steps back to clear previous cell).
  - Arrow keys, Home, and End keyboard navigation.
  - Alphanumeric or numeric modes, grouping separators (e.g. 3-3 split).
- **Props**:
  - `length?: number` (default: `6`)
  - `mode?: 'numeric' | 'alphanumeric'`
  - `onChange?: (value: string) => void`
  - `onComplete?: (value: string) => void`
  - `status?: 'idle' | 'error' | 'success'`
  - `errorMessage?: string`
- **Usage Example**:
  ```tsx
  import { OtpInput } from '@elsesourav/ui/interior';

  <OtpInput
    length={6}
    mode="numeric"
    groupEvery={3}
    onComplete={(code) => verify2FACode(code)}
    errorMessage={error}
  />;
  ```
- **When to Use**: 2FA authentication, email verification codes, SMS login steps.

---

### 5. `PasswordStrength` & `usePasswordStrength`

- **Purpose**: Real-time password entropy and requirement checklist with animated segment bars.
- **Key Features**:
  - Instant regex evaluation of length, upper/lower casing, digits, and symbols.
  - Dictionary check for common insecure passwords (`password`, `qwerty`, `admin`).
  - Screen reader announcement debouncer (`aria-live="polite"`).
- **Props**:
  - `value: string`
  - `rules?: readonly PasswordRule[]`
  - `showRules?: boolean` (default: `true`)
- **Usage Example**:
  ```tsx
  import { PasswordStrength } from '@elsesourav/ui/interior';

  <PasswordStrength value={passwordValue} showRules={true} />;
  ```
- **When to Use**: User registration forms, password reset modals, account security settings.

---

### 6. `SegmentedControl`

- **Purpose**: Sliding tactile tab switcher with spring-physics pill indicator.
- **Key Features**:
  - Physics thumb spring (`stiffness: 520, damping: 34`).
  - Fluid text color inversion as the thumb glides underneath.
  - Full keyboard arrow selection.
- **Props**:
  - `options: { value: string; label: string; disabled?: boolean }[]`
  - `value?: string`
  - `defaultValue?: string`
  - `onValueChange?: (value: string) => void`
- **Usage Example**:
  ```tsx
  import { SegmentedControl } from '@elsesourav/ui/interior';

  <SegmentedControl
    label="Theme Preference"
    options={[
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ]}
    value={theme}
    onValueChange={setTheme}
  />;
  ```
- **When to Use**: Filter toggles, view switchers (Grid vs List), billing intervals (Monthly vs Annual).

---

### 7. `SnapCarousel` & `useSnapCarousel`

- **Purpose**: Physics gesture carousel with inertia, flick velocity detection, and snap points.
- **Key Features**:
  - Touch and pointer drag gestures with elastic wall resistance.
  - Arrow keys, Home, and End keyboard support.
  - Active index progress dots.
- **Props**:
  - `label: string`
  - `gap?: number`
  - `peek?: number`
  - `index?: number`
  - `onIndexChange?: (index: number) => void`
- **Usage Example**:
  ```tsx
  import { SnapCarousel } from '@elsesourav/ui/interior';

  <SnapCarousel label="Featured Projects" gap={16} peek={40}>
    <ProjectCard1 />
    <ProjectCard2 />
    <ProjectCard3 />
  </SnapCarousel>;
  ```
- **When to Use**: Portfolio highlights, testimonial sliders, photo galleries, onboarding carousels.

---

### 8. `CopyButton` & `useCopyToClipboard`

- **Purpose**: Compact tactile button for copying code snippets, hashes, or URLs.
- **Key Features**:
  - Crossfade transition from copy icon to checkmark with emerald accent.
  - Fallback textarea copy for older environments without `navigator.clipboard`.
  - Configurable auto-reset timeout.
- **Props**:
  - `value: string`
  - `label?: string` (default: `'Copy'`)
  - `copiedLabel?: string` (default: `'Copied'`)
- **Usage Example**:
  ```tsx
  import { CopyButton } from '@elsesourav/ui/interior';

  <CopyButton value="npm i @elsesourav/ui" />;
  ```

---

### 9. `PressDepth` & `usePressDepth`

- **Purpose**: 3D isometric button surface that sinks with authentic physical depth upon click.
- **Key Features**:
  - Directional tilt physics based on pointer click coordinate.
  - Customizable depth (`depth = 4` px) and tilt intensity.
- **Usage Example**:
  ```tsx
  import { PressDepth } from '@elsesourav/ui/interior';

  <PressDepth depth={5} onClick={() => alert('Pressed!')}>
    <span className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg">Launch Console</span>
  </PressDepth>;
  ```

---

### 10. `ShowMore` & `useShowMore`

- **Purpose**: Progressive content disclosure that smoothly interpolates height between clamped and expanded states.
- **Key Features**:
  - Automatic line-height and total height measurement via ResizeObserver.
  - Gradient fade mask over clamped text.
  - Screen reader region labeling.
- **Props**:
  - `lines?: number` (default: `3`)
  - `moreLabel?: string` (default: `'Show more'`)
  - `lessLabel?: string` (default: `'Show less'`)
- **Usage Example**:
  ```tsx
  import { ShowMore } from '@elsesourav/ui/interior';

  <ShowMore lines={4} moreLabel="Read full bio" lessLabel="Collapse bio">
    {longAuthorBio}
  </ShowMore>;
  ```

---

### 11. `MorphSlider`

- **Purpose**: WebGL GPU displacement slider morphing between slides with fluid shader transitions (melt, ripple, shear, swirl).
- **Key Features**:
  - Procedural noise displacement and chromatic aberration peak on transition.
  - Infinite auto-scroll (default 5s interval) with drag pause and automatic timer refresh.
  - Interactive touch/pointer drag with spring commit.
  - Smooth animated captions with blur entry.
  - Automatic `prefers-reduced-motion` override (fast-fade fallback).
- **Props**:
  - `items?: MorphItem[]` (`{ image: string; caption?: string }[]`)
  - `startIndex?: number` (default: `0`)
  - `transition?: 'melt' | 'ripple' | 'shear' | 'swirl'` (default: `'melt'`)
  - `duration?: number` (default: `1.1`)
  - `intensity?: number` (default: `0.55`)
  - `scale?: number` (default: `2.4`)
  - `aberration?: number` (default: `0.35`)
  - `drift?: number` (default: `0.4`)
  - `autoplay?: boolean` (default: `true`)
  - `autoplayDelay?: number` (default: `5` seconds)
  - `loop?: boolean` (default: `true`)
  - `radius?: number` (default: `16`)
  - `showCaptions?: boolean`, `showControls?: boolean`, `showIndicators?: boolean`
- **Usage Example**:
  ```tsx
  import { MorphSlider } from '@elsesourav/ui/interior';

  <div className="relative h-[500px] w-full">
    <MorphSlider
      items={[
        { image: '/apps/showcase-1.webp', caption: 'Creative Canvas' },
        { image: '/apps/showcase-2.webp', caption: 'Interactive Studio' },
        { image: '/apps/showcase-3.webp', caption: 'Fluid Playground' },
      ]}
      transition="melt"
      autoplay
      autoplayDelay={5}
    />
  </div>;
  ```
- **When to Use**: Interactive hero banners, visual portfolio carousels, immersive project previews.

---

## Complete Directory: All 54 Interior.dev Components

| Component                | Primary Props / Types                                                                     | Physics & Animation Behavior                                                                | Ideal Use Case                                           |
| :----------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| **`Accordion`**          | `items: { id, title, content }[]`                                                         | Spring height disclosure with chevron rotation                                              | FAQ sections, collapsible settings                       |
| **`BlurUpImage`**        | `src, alt, width, height, fill, blur, imgClassName`                                       | Smooth progressive reveal with instant cache bypass                                         | Hero backdrops, avatar studios, media cards              |
| **`CollapsibleBanner`**  | `open, onDismiss, children`                                                               | Elastic collapse with top-border bounce                                                     | System announcements, discount alerts                    |
| **`CommandPalette`**     | `open, onOpenChange, items`                                                               | Centered floating scale-in with instant fuzzy search                                        | Quick action palette (`Cmd+K`)                           |
| **`ContextMenu`**        | `items, children`                                                                         | Cursor-anchored spring reveal with bounds collision                                         | Table row right-click actions                            |
| **`CopyButton`**         | `value, timeout, label`                                                                   | Tactile icon morph from Copy to Checkmark                                                   | Code blocks, shareable links, API tokens                 |
| **`Drawer`**             | `open, onOpenChange, side`                                                                | Side slide-in with elastic overshoot                                                        | Mobile menus, side inspectors, filter decks              |
| **`Dropdown`**           | `items, value, defaultValue, onChange, placeholder, label, error, icon, triggerClassName` | Scaled fade with active item highlight & dynamic selected label; body-portaled fixed positioning (`z-[9999]`) with automatic vertical flipping, collision avoidance, and viewport clamping (`useDropdownPosition`) | Form selection, filter criteria, responsive dropdowns    |
| **`ExpandingSearch`**    | `placeholder, onSearch`                                                                   | Smooth horizontal width expansion on click                                                  | Minimalist navigation headers                            |
| **`FilterGrid`**         | `items, filters, getKey, renderItem, fluid`                                               | Layout reflow with FLIP spring animation & counts                                           | Portfolio filters, project showcases                     |
| **`FloatingLabelInput`** | `label, value, onChange, placeholder, type, icon, rightElement, hint, error, invalid`     | Fluid micro-label lift transition with spring physics, leading icon & trailing action slots | Authentication, account management, administrative forms |
| **`HideOnScroll`**       | `children, bar, useWindow`                                                                | Smooth vertical transform header hide/reveal (with `useHideOnScroll` hook)                  | Sticky navigation bars, mobile toolbars                  |
| **`HoldToConfirm`**      | `onConfirm, duration, variant`                                                            | Progressive stroke fill with release decay                                                  | Irreversible deletions, critical actions                 |
| **`IconMorph`**          | `iconA, iconB, active`                                                                    | Smooth SVG path crossfade                                                                   | Play/Pause, Hamburger/Close buttons                      |
| **`InlineValidation`**   | `status, message`                                                                         | Slide-down error pill with red accent pulse                                                 | Real-time email and username checkers                    |
| **`InteractivePortrait`**| `imageDarkSrc, imageLightSrc, alt, isDark, effectsLevel, size`                             | WebAssembly C++ physics engine with raw WebGL point sprite pipeline & glowing halo shader  | Creator profile showcases, interactive portrait avatars |
| **`WasmPortraitCanvas`** | `imageDarkSrc, imageLightSrc, alt, isDark, effectsLevel, size, lightIntensity, simulationResolution, imageAlgorithm, particleDensity, particleSize, glowBrightness, flightSpeed, pathSpread, showPathGuide, edgeAlgorithm, edgeThreshold, pinBottomEdge, topParticleSize, topParticleQuantity, topParticleSpeed, glowDistance, backsideStars, backsideHalo, backsideOrbits, backsideSpecks, clickForce, clickRadius, bounceSpeed, hoverSpeed, hoverRadius, clickSpeed, introDuration, introSpread, introPattern, disableFullscreenIntro` | WebAssembly (C++) 4x micro-pixel engine featuring 100% authentic photographic color fidelity (natural skin tones, crisp curl definitions, zero artificial tinting), selectable downsampling & quantization algorithms (`stepped` Mipmap Multi-Pass, `perceptual` Linear-Gamma fabric detail, `edge_preserve` Bilateral Area Filter, `native` Canvas Bicubic baseline), high-contrast Light Theme rendering (saturated azure `#0078dc` & royal amethyst `#8723cd` celestial orbits, stars and halos with 4.1:1+ contrast against white backgrounds, plus subtle clothing edge micro-shadow preventing light hoodies from vanishing against light cards), dual-channel separate WebGL alpha compositing (`gl.blendFuncSeparate`) preventing edge halos and fringing, instant inspection path guide toggle with zero latency buffer clearing, universal full-screen overlay particle entrance across Desktop, Tablet, and Mobile viewports with dynamic 1:1 aspect-ratio scaling docking into the portrait card, equidistant arc-length contour path resampling (100% constant particle travel velocity with zero speed spikes), resolution-scaled orbits and retro diamond stars, selectable edge detection algorithms (Perimeter Alpha Scan, Sobel Edge Gradient), configurable edge sensitivity threshold (10..65), bottom canvas perimeter anchoring (flush bottom edge), customizable top glow particle size/quantity/speed, adjustable top particle glow distance and reach (4px to 32px), customizable backside space objects (halo ring density, 5-pixel diamond stars count, celestial orbit loops 0–4, ambient cosmic specks), localized touch/click blast impulse force (0.1x to 1.8x), customizable click disturbance radius (24px to full canvas), floaty Hooke elastic return bounce speed (1.5 to 10.0), touch & cursor velocity scaling (0.3x to 2.2x), hover proximity threshold radius (30px to 160px), click shockwave speed (0.3x to 2.4x), configurable intro flight duration (0.1s to 3.0s), intro initial pixel dispersion spread (0.5x to 3.0x), 4 selectable intro arrival patterns (Cosmic Spiral Vortex, Random Constellations Stagger, Ascending Wave Surge, Direct Magnetic Warp), full independent per-device target settings profiles (Desktop, Tablet, Mobile saved separately without cross-device override), mobile touch drag as smooth hover displacement and touch release as click blast, immediate frame 0 proximity rim glow, constant ~340px Admin Studio preview card, and one-click Public Site Publishing with expanded mobile portrait card sizing | High-performance interactive developer portraits with universal cross-device full-screen particle stream entrance, single-canvas resizing architecture, hardware-adaptive performance scaling & complete Admin Dashboard customization |
| **`WasmAtmosphereCanvas`** | `isDark, isSceneActive, particleDensityMultiplier, speedMultiplier, meteorFrequencyMultiplier, mobileEffectsMode, className, onLoaded` | High-performance WebGL + WebAssembly (C++) atmospheric particle engine replacing 2D canvas drawing. Renders crisp retro micro-pixel celestial stars (1.5px–2.5px solid square point sprites with zero blur, accompanied by 5-pixel retro diamond cross stars matching the About portrait side stars with sinusoidal opacity twinkle), sleek small & medium shooting stars / asteroids (1.2px–2.6px nucleus with 45px–125px tapered plasma streak and trailing stardust sparks), volumetric morning fog puffs, and sunlit motes in a single GPU draw call. Features active 60 FPS mobile rendering with touch swipe meteors, real-time hardware-adaptive performance scaling, `touchAction: pan-y` mobile scroll passthrough (`pointer-events-none md:pointer-events-auto`), and complete Admin Dashboard customization. | Homepage hero cosmic background, daylight atmospheric clouds, interactive sky canvas with zero JS GC overhead |
| **`Lightbox`**           | `src, alt, open, onClose, onPrev, onNext, index, total`                                   | Fullscreen zoom from clicked element thumbnail with spring physics & gallery navigation     | Image gallery previews, proof viewing, apps showcase     |
| **`LikeBurst`**          | `liked, onLike, count`                                                                    | Particle burst explosion with heart scale punch                                             | Social likes, upvoting blog posts                        |
| **`LiveActivity`**       | `title, status, time`                                                                     | Dynamic island capsule expansion                                                            | Audio player status, background job tracker              |
| **`LoadMore`**           | `onLoad, hasMore, loading`                                                                | Spinner crossfade with content injection                                                    | Paginated blog posts, endless lists                      |
| **`LoadingButton`**      | `onAction, pendingLabel`                                                                  | Morphing width button with spinner and checkmark                                            | Async forms, checkout, authentication                    |
| **`LogoMarquee`**        | `logos, speed, pauseOnHover`                                                              | Seamless infinite CSS ticker                                                                | Partner logos, client trust badges                       |
| **`LongPress`**          | `onLongPress, delay`                                                                      | Radial progress ring indicator                                                              | Mobile quick-actions, preview triggers                   |
| **`Modal`**              | `open, onClose, title`                                                                    | Backdrop blur scrim with centered pop                                                       | Confirmation dialogs, modal forms                        |
| **`MorphSlider`**        | `items, transition, intensity, aberration, drift, autoplay, autoplayDelay`                | WebGL GPU displacement morph with melt, ripple, shear, swirl shaders & auto-timer           | Hero showcases, visual portfolios, interactive galleries |
| **`NewItemsPill`**       | `count, onClick`                                                                          | Floating pill drop-in at top of feed                                                        | "3 new posts" feed notification                          |
| **`OtpInput`**           | `length, onComplete, mode`                                                                | Cell-by-cell focus glide and clipboard auto-fill                                            | 2FA verification, SMS login codes                        |
| **`Pagination`**         | `page, total, onChange`                                                                   | Floating sliding pill over active page number                                               | Multi-page data tables, search results                   |
| **`PasswordStrength`**   | `value, rules, showRules`                                                                 | Multi-bar entropy rating with live rule tests                                               | New account creation, password resets                    |
| **`PollResults`**        | `options, totalVotes`                                                                     | Animated percentage bar widths                                                              | Community voting, survey widgets                         |
| **`Popover`**            | `trigger, content, align`                                                                 | Anchored floating card with pointer arrow                                                   | Rich tooltips, user preview hovercards                   |
| **`PresenceAvatars`**    | `users, max`                                                                              | Overlapping avatar stack with hover expansion                                               | Active collaborators, live viewers                       |
| **`PressDepth`**         | `depth, tilt, onClick`                                                                    | 3D tactile button push with directional lean                                                | Primary CTA buttons, game-like triggers                  |
| **`ProgressBar`**        | `value, max, animated`                                                                    | Smooth progress bar with glowing tip                                                        | Onboarding checklist, file upload progress               |
| **`ReadingProgress`**    | `targetRef`                                                                               | Window top scroll tracker hairline                                                          | Long-form editorial and technical articles               |
| **`ReorderList`**        | `items, onReorder`                                                                        | Drag-and-drop reorder with spring physics                                                   | Task priority lists, navigation organizers               |
| **`Ripple`**             | `children, color`                                                                         | Radial water ripple radiating from click coordinate                                         | Material buttons, interactive surface tiles              |
| **`ScrollSpy`**          | `sections, activeId`                                                                      | Active marker that tracks scroll position                                                   | Table of contents in documentation                       |
| **`SegmentedControl`**   | `options, value, onChange`                                                                | Spring thumb gliding across segmented options                                               | Filter modes, theme pickers, view switches               |
| **`ShowMore`**           | `lines, moreLabel`                                                                        | Spring height clamp disclosure                                                              | Long user bios, project descriptions                     |
| **`SkeletonSwap`**       | `loading, skeleton, children`                                                             | Seamless crossfade between skeleton and content                                             | API data loading transitions                             |
| **`SliderDetents`**      | `value, min, max, steps`                                                                  | Slider thumb with magnetic snap to notches                                                  | Volume controls, pricing tier sliders                    |
| **`SnapCarousel`**       | `children, gap, peek`                                                                     | Momentum flick carousel with snap points                                                    | Project showcases, photo galleries                       |
| **`SortableTable`**      | `columns, data, onSort`                                                                   | Column header sort arrow animation                                                          | Administrative data grids                                |
| **`StickyHeader`**       | `children, offset`                                                                        | Glass transition when page scrolls beyond threshold                                         | Sticky navigation bars                                   |
| **`StreamingText`**      | `text, speed`                                                                             | Typewriter word-by-word streaming effect                                                    | AI chatbot responses, terminal greetings                 |
| **`SwipeDeck`**          | `cards, onSwipe`                                                                          | Tinder-style swipe cards with fling velocity                                                | Match cards, card sorting workflows                      |
| **`Tabs`**               | `tabs, activeTab, onChange`                                                               | Floating sliding underline indicator                                                        | Tabbed interfaces                                        |
| **`TagInput`**           | `tags, onAdd, onRemove`                                                                   | Pill tag insertion with spring entrance                                                     | Blog tagging, tech stack selection                       |
| **`TaskSteps`**          | `steps, currentStep`                                                                      | Stepper bar with connected progress lines                                                   | Multi-step setup wizards                                 |
| **`TextReveal`**         | `text, by, stagger, delay, className`                                                     | Word-by-word or character-by-character de-blur spring rise                                  | Hero titles, landing page headlines                      |
| **`TooltipGroup`**       | `tooltips, activeIndex`                                                                   | Shared tooltip bubble that glides between items                                             | App toolbars, icon ribbons                               |
| **`TreeView`**           | `nodes, onSelect`                                                                         | Nested folder disclosure with connecting lines                                              | File explorers, hierarchical category trees              |
| **`TypingIndicator`**    | `size, color`                                                                             | Three oscillating dots in speech bubble                                                     | Live chat waiting status                                 |
| **`ValueFlash`**         | `value`                                                                                   | Green/Red pulse whenever numeric value updates                                              | Live crypto prices, analytics counters                   |
| **`WizardSteps`**        | `steps, activeIndex`                                                                      | Step-by-step progress cards with validation                                                 | Multi-step checkout, user onboarding                     |

---

# Part 3: High-Energy Micro-Interactions (`@elsesourav/ui/micro`)

Import path:

```tsx
import { ... } from '@elsesourav/ui/micro';
```

The `@elsesourav/ui/micro` collection contains **34 playful, high-tactility micro-interactions** that provide delightful feedback for notifications, switches, sliders, and buttons.

## Featured Micro Components

### 1. `BellToggle`

- **Purpose**: Interactive notification toggle with authentic harmonic bell wobble physics.
- **Key Features**:
  - Harmonic wobble simulation with decayed passes (`ringAmplitude = 0.4`, `passes = 3`).
  - Active/inactive state color morphing.
  - Notification count badge pill.
- **Usage Example**:
  ```tsx
  import { BellToggle } from '@elsesourav/ui/micro';

  <BellToggle label="Notifications" count={4} badge size="md" onColor="#6366f1" />;
  ```

---

### 2. `SquishSwitch`

- **Purpose**: Organic silicone toggle switch that stretches and squishes as it is dragged or tapped.
- **Key Features**:
  - Velocity-based thumb elongation (`FLOW_SPRING`, `MAX_STRETCH = 0.4`).
  - Tactile tap slop filtering.
- **Usage Example**:
  ```tsx
  import { SquishSwitch } from '@elsesourav/ui/micro';

  <SquishSwitch checked={isEnabled} onChange={setIsEnabled} label="Dark Mode" />;
  ```

---

### 3. `RubberSegment`

- **Purpose**: Playful sliding segment selector where the active indicator behaves like an elastic rubber band.
- **Key Features**:
  - Drag momentum projection and notch snapping.
  - Rubber resistance on over-drag.
- **Usage Example**:
  ```tsx
  import { RubberSegment } from '@elsesourav/ui/micro';

  <RubberSegment
    items={['Daily', 'Weekly', 'Monthly']}
    defaultValue="Weekly"
    size="md"
    onChange={(val) => setPeriod(val)}
  />;
  ```

---

### 4. `CallChip`

- **Purpose**: Expandable floating chip for live call sessions or audio streams with pulsing wave rings.
- **Usage Example**:
  ```tsx
  import { CallChip } from '@elsesourav/ui/micro';

  <CallChip name="Sourav" duration="04:12" active />;
  ```

---

### 5. `FlipCard`

- **Purpose**: 3D interactive card that flips on hover or tap to reveal hidden back details.
- **Usage Example**:
  ```tsx
  import { FlipCard } from '@elsesourav/ui/micro';

  <FlipCard front={<div>Front Content</div>} back={<div>Back Secret Details</div>} />;
  ```

---

### 6. `PaperCrumple` & `Shredder`

- **Purpose**: Matter.js physical simulation components that crumple or shred documents upon deletion.
- **When to Use**: Creative easter eggs, discarding draft documents, playful trash bin triggers.

---

### 7. `SwipeRow` & `SwipeToast`

- **Purpose**: Mobile touch-optimized swipe row showing action drawers (Archive/Delete) underneath.

---

## Complete Directory: All 34 Micro Components

| Component            | Description                                               | Best Used For                                 |
| :------------------- | :-------------------------------------------------------- | :-------------------------------------------- |
| **`BellToggle`**     | Harmonic ringing bell toggle with badge counter           | Notification preferences, alert subscriptions |
| **`BranchedMenu`**   | Radial tree branching menu opening from central hub       | Quick radial toolbars, floating speed dials   |
| **`CallChip`**       | Expandable status capsule with pulsing live waves         | Active call status, podcast player indicator  |
| **`CodeSlots`**      | Mechanical slot-machine digit counter                     | Live user counts, star counters               |
| **`CometDial`**      | Circular dial slider with glowing comet tail              | Volume controllers, circular timers           |
| **`CopyIconButton`** | Ultra-sleek inline icon copy trigger with morph animation | Copying usernames, emails, tokens, and IDs    |
| **`DodgeField`**     | Text input with playful dodging character eye             | Login passwords, whimsical form fields        |
| **`FlipCard`**       | 3D perspective flip card with realistic shadow            | Developer business cards, portfolio showcases |
| **`FolderFloat`**    | Origami floating folder opening with paper preview        | File attachments, folder organizers           |
| **`FuseButton`**     | Action button with burning fuse trail before commit       | Final irreversible action trigger             |
| **`GlideSelect`**    | Magnetic glide selector with smooth cursor suction        | Compact dropdown alternatives                 |
| **`HoldButton`**     | Charge-up hold button with electric particle aura         | Game actions, authorization confirmations     |
| **`JellyRadio`**     | Gelatinous radio button that jiggles upon selection       | Form surveys, rating choices                  |
| **`LatticeLoader`**  | Interlocking geometric matrix loading spinner             | Fullscreen page transition loaders            |
| **`PaperCrumple`**   | Physical 2D matter.js paper crumple into ball             | Discarding drafts, throwing away notes        |
| **`PeekRating`**     | Five-star rating where stars smile/frown based on score   | Customer feedback, project review ratings     |
| **`PromptBar`**      | Sleek AI prompt bar with rainbow micro aura               | AI query inputs, command search bars          |
| **`PulseHeart`**     | Anatomical pulsating heart button for favorites           | Favoriting articles, sponsoring projects      |
| **`RefineFrame`**    | Crop and adjust bounding box with magnetic handles        | Avatar crop studio, image adjustments         |
| **`RubberSegment`**  | Elastic rubber band segment selector                      | Range switches, view filters                  |
| **`ScrubField`**     | Number input draggable horizontally like After Effects    | Numeric adjustments, CSS dimensions           |
| **`Shredder`**       | Matter.js physics shredder turning documents into ribbons | Permanent account wipes, security cleanups    |
| **`SlideCommit`**    | Slide-to-unlock style commit bar                          | Slide to pay, slide to publish                |
| **`SlingButton`**    | Slingshot pull-and-release button                         | Sending messages, launching actions           |
| **`SloshGauge`**     | Liquid sloshing gauge with water physics                  | Storage usage, battery meter                  |
| **`SpringCheck`**    | High-energy bouncing checkmark                            | To-do lists, task completion confirmation     |
| **`SquishSwitch`**   | Elastic silicone switch with stretch and squish           | Setting toggles, mode switches                |
| **`StatusMark`**     | Tactile status badge with pinging pulse ring              | Server status, online indicator               |
| **`SwipeRow`**       | iOS-style swipe action row revealing actions              | Mobile list items, mail inbox items           |
| **`SwipeToast`**     | Dismissible toast notification flickable off-screen       | High-priority mobile notifications            |
| **`TearTicket`**     | Perforated discount ticket that tears in half             | Event tickets, voucher redemption             |
| **`ThoughtLine`**    | Animated thinking line pulse for AI reasoning             | AI stream reasoning indicator                 |
| **`VoicePill`**      | Audio wave pill reacting to voice microphone input        | Voice search, audio notes                     |
| **`WakeSlider`**     | Sleeping slider that opens eyes when touched              | Brightness controls, sensory sliders          |
| **`WarmTooltip`**    | Floating tooltip with organic jelly squash effect         | Rich interactive element explanations         |

---

## Developer Guidelines & Constraints

1. **Strict Line Limit Enforced**: No single component or feature file may exceed **500 lines of code**. If a component grows near this threshold, break it into composable subcomponents or extract custom hooks (e.g. `useHoldToConfirm`, `useBlurUpImage`).
2. **Strict TypeScript Standards**: All components must pass `tsc --noEmit` with **0 errors** and **0 `any` types**. Use strongly-typed generics and explicit prop interfaces.
3. **Subpath Cleanliness**: Do NOT import micro or interior components directly from `@elsesourav/ui`. Always use the subpath:
   - ✅ `import { BlurUpImage } from '@elsesourav/ui/interior';`
   - ✅ `import { BellToggle } from '@elsesourav/ui/micro';`
   - ❌ `import { BlurUpImage } from '@elsesourav/ui';` (causes webpack runtime call issues!)
4. **Accessibility Compliance**: Every interactive element MUST include an accessible label (`aria-label` or visible text), keyboard navigation (`onKeyDown` handling for Space/Enter), and automatic `prefers-reduced-motion` fallbacks.
5. **Always Update Documentation**: When adding new components or altering existing props, update this `README.md` immediately to reflect changes.
6. **Global Scrollbar System**: Custom sleek 9px translucent capsule scrollbar with transparent gutters is enabled globally across WebKit and Firefox (`globals.css`), eliminating native operating-system scrollbar jumps. To hide horizontal carousels or shelf scrollbars, use `.no-scrollbar` or `.scrollbar-none`.
7. **App Hero & Dynamic Metrics Architecture**: App detail pages implement a minimalist eyebrow header (category chip and critical auth state only) and a 5-column Key Stats Strip (`RATINGS`, `AGE`, `CATEGORY`, `LANGUAGE`, `SIZE`). Age is dynamically computed from project creation/publish date (`getProjectAge`), size is dynamic/non-constant (`getAppDisplaySize`), and redundant clutter or action bloat (such as non-auth save to library) is strictly omitted.
8. **Ratings & Reviews System Architecture**:
   - **Two-Line Layout**: App detail pages display the Ratings overview and Reviews carousel on two separate lines. The ratings overview spans full width with numerical score (`X.X out of 5`) and wide, high-fidelity horizontal star distribution bars with total ratings count right-aligned under the bars.
   - **Horizontal Review Carousel**: Renders below the ratings overview as its own dedicated row with responsive width cards, drag-to-scroll, and edge navigation chevrons.
   - **Floating Fullscreen Window**: Clicking "Ratings & Reviews" opens a focused floating fullscreen modal window (`AllReviewsModal`) over the current page without navigating away, featuring detailed star breakdowns, sort filters (`Newest`, `Oldest`, `Highest`, `Lowest`), and full paginated review feeds. When reviews exist (`totalCount > 0`), exactly one review button (`Write a Review`) is rendered at the bottom of the left column beneath the star breakdown card, keeping the review feed purely focused on reading community feedback. When no previous reviews exist (`totalCount === 0`), the review feed presents a single, centered "Write First Review" action button with no sort controls or redundant text. The modal is portaled directly into `document.body` via React's `createPortal`, preventing nested CSS transform inheritance from `<Reveal>` or layout boundaries and ensuring zero top-gap or layout bleed across all viewports.
   - **Default Zero Rating Score**: When an application has no ratings submitted yet, the score card renders a clean, crisp `0` by default rather than a thick em-dash (`—`), preserving typography hierarchy and readability. The redundant `0 Total` badge in the modal header title cluster is omitted for visual cleanliness.
   - **Dedicated Review Composer**: Clicking "Write a Review" opens a dedicated modal (`WriteReviewModal`) portaled cleanly to `document.body` with `z-[110]`, showing strictly and only review options (interactive 5-star rating with sentiment feedback, title, review body, and submission actions) without unrelated options or clutter.
   - **Per-User Helpful Vote Tracking**: Review helpful/like reactions are tracked at the database level (`AppFeedbackLike`) per user (and per IP/identifier for anonymous visitors), preventing duplicate votes, returning persistent `hasLiked` state across page reloads, and ensuring authentic community engagement.
9. **Native View Transitions Circular Expansion Architecture**:
   - **API & Hardware Acceleration Pipeline**: Theme switching in `ThemeProvider` wraps theme state and DOM mutations inside `document.startViewTransition()`. To achieve 60/120fps GPU compositor performance and eliminate main-thread lag, `transition.ready` executes the circular wipe exclusively via the Web Animations API (`document.documentElement.animate`) on `::view-transition-new(root)`. In `globals.css`, `::view-transition-new(root)` is set to `animation: none;` to eliminate competing CSS keyframe animations and prevent fill-mode conflicts.
   - **Pixel-Perfect Source Location**: The expansion origin coordinates (`originX`, `originY`) are determined directly from the Theme Button's live bounding rect (`rect.left + rect.width / 2`, `rect.top + rect.height / 2`) in `ThemePopup`, with dynamic DOM fallback (`[aria-label="Change theme"]`). The circular wipe always originates cleanly from `circle(0px at originX originY)` directly at the Sun/Moon icon on all screen resolutions, rather than arbitrary percentages or un-interpolated CSS variables.
   - **Full Viewport Hypotenuse Coverage**: The target wipe radius is computed geometrically using `Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 32px`, guaranteeing that 100% of the screen (all 4 corners) is fully covered before the transition completes without any clipping, popping, or visual edge stutter. An `ease-in-out` 500ms curve provides perceptible, smooth acceleration from 0 size to full viewport coverage.
   - **Synchronous flushSync DOM Synchronization**: `ThemePopup` synchronously unmounts from the DOM via `flushSync` before `startViewTransition()` takes its initial snapshot, preventing ghost popup menus from appearing in the outgoing snapshot. `ThemeProvider` similarly flushes theme state inside the transition callback for synchronous DOM capture.
   - **Accessibility First**: Automatically gates the transition under `@media (prefers-reduced-motion: no-preference)`, providing an instant switch without motion for users with vestibular sensitivities.
10. **App Media Showcase & Video/Image Card Controls Architecture**:

- **Fully Normal Hover (Zero Image Dimming)**: Images and video cards maintain 100% natural visual clarity on hover. Dark overlays (`bg-black/25`), zoom effects, and large center play/expand circles are eliminated so media previews remain completely unobstructed.
- **Bottom Line Control Bar**: Interactive actions are housed exclusively along the bottom line of the card with smooth entrance transitions (`opacity-0 translate-y-1` -> `opacity-100 translate-y-0` with `transition-all duration-300 ease-out`):
  - **Video Cards (`AppMediaVideoCard`)**: Features a sleek glassmorphic bottom bar with Replay on the left, and Play/Pause, Mute/Unmute, and Fullscreen/Expand buttons grouped on the right.
  - **Image Cards (`AppMediaShowcase`)**: Displays strictly and only the Fullscreen/Expand icon button in the exact same bottom-right position (`bottom-3 right-3`) as the video card's expand trigger, preserving layout consistency across media types.
- **2-Image Viewport Fit & Stepped Carousel Scrolling**: Carousel cards are sized responsively (`w-[86vw] sm:w-[calc(50%-8px)] shrink-0 aspect-[16/10]`) so that on screens `sm` and above, exactly two image/video cards fit cleanly side-by-side within the container width with zero awkward cutoff. Scrolling advances by `clientWidth`, smoothly stepping the carousel by 2 images at a time with native snap alignment (`snap-x snap-mandatory`).
- **Dynamic Dual-Directional Navigation Chevrons**: Navigation buttons follow the canonical `ShelfCarouselRow` pattern, rendering Left/Right floating buttons governed by real-time scroll position (`ResizeObserver` + passive scroll tracking):
  - **At Start**: Left button is hidden (`opacity-0 scale-90 pointer-events-none`), Right button is active (`opacity-100 scale-100 pointer-events-auto`).
  - **Scrolled in Middle (Both Sides)**: Both Left and Right buttons show simultaneously with smooth scale/opacity transitions.
  - **At End**: Right button smoothly fades out, while Left button remains active.
11. **Global Search Overlay Scroll Preservation Architecture**:
- **Zero Auto-Scroll on Open & Close**: Opening or closing the global search overlay (via `⌘K`, `/`, escape, or click-outside) strictly preserves the user's scroll position anywhere on the page without jumping or scrolling towards the header.
- **Scroll-Free Focus Restoration**: Both input autofocus and search button focus restoration use `element.focus({ preventScroll: true })`. This prevents browser layout engines from scrolling the window to bring the off-screen or hidden sticky header button into view.
- **Exact Pixel Scroll Locking**: When search opens, `window.scrollY` is captured. When `document.body.style.overflow = 'hidden'` is removed upon unmounting/closing, the window scroll position is verified and instantly re-locked (`window.scrollTo({ top: savedScrollY, behavior: 'instant' })`), eliminating subpixel layout jumps.
12. **Editorial Software Shelf Card Geometry & Badge Theming Architecture (`ShelfCarouselRow`)**:
- **Compact Single-Line Title with Ellipsis Truncation**: App card titles use a sleek, proportional typography scale (`text-xs sm:text-[13px] md:text-sm font-bold truncate leading-snug`). Long titles truncate cleanly with an ellipsis (`...`), keeping cards uniformly compact across all shelf carousels.
- **Vertical Icon Centering (`items-center`)**: The app icon on the left is vertically centered along the y-axis relative to the title, category, and rating row, creating balanced and harmonious spacing.
- **Theme-Adaptive Frosted Version Badges**: The top-right version badge uses theme-reactive styling:
  - **Light Mode**: `bg-white/70 backdrop-blur-md text-zinc-900 border-black/10 shadow-xs`, replacing dark black boxes with an airy, translucent frosted pill that remains legible over any banner art.
  - **Dark Mode**: `dark:bg-black/60 dark:text-white/90 dark:border-white/15`, maintaining sleek cosmic contrast.
13. **Mobile Floating Island & Hero Light Theme Contrast Architecture (`HomeHero` & `EarthScene`)**:
- **Top-Center Mobile Floating Island (`md:hidden`)**: On mobile viewports, the old static background island is eliminated. In its place, a compact interactive `<EarthScene isMobileCompact />` is rendered at the very beginning (top center) with subtle floating oscillation and individual rock physics animations.
- **Active Live Laptop Canvas on Mobile (`LaptopLiveCanvas`)**: The live typing 2D canvas runs actively on both mobile and desktop (`aspect-[1024/888]`), showcasing code snippets, terminal simulations, and syntax-highlighted editor typing inside the floating laptop screen.
- **Backside-Only Landscape Mobile Sky Background**:
  - The landscape background image (`sky-light-bg.webp` in light mode, `sky-bg.webp` in dark mode) is set strictly and exclusively on the backside of the floating island at the top (`h-[290px] xs:h-[320px] sm:h-[350px]`) with `object-[78%_center]`, framing the glowing celestial planet and sunset clouds directly behind the island.
  - A vertical gradient mask (`mask-image: linear-gradient(to bottom, black 0%, black 65%, transparent 100%)`) seamlessly feathers the landscape image into the page foundation before reaching the text.
  - The hero text below sits directly on the clean page canvas (`bg-background`), eliminating full-screen washed out scrims and delivering 100% WCAG AAA text contrast.
- **High-Contrast Typography & Surface Styling**:
  - Lead headline uses `text-slate-950 font-extrabold` with deep indigo/violet highlight gradients (`from-blue-700 via-indigo-700 to-violet-800`), and subtitle uses `text-slate-800 font-medium`.
  - Secondary "About Me" CTA button renders with `text-slate-900 bg-white/90 hover:bg-white border-slate-300/80 shadow-xs backdrop-blur-md`. Trust metric numbers use `text-slate-950 font-extrabold`, labels use `text-slate-700 font-semibold`, and icons sit inside high-contrast pastel rounded containers (`bg-purple-100 border-purple-300`, `bg-blue-100`, `bg-indigo-100`).
14. **Clean Editorial Catalog Card Architecture (`AppEditorialCard`)**:
- **Unobstructed Featured Artwork**: Overlay eyebrow tags (e.g. `ARCADE SHOWCASE`, `AI BREAKTHROUGH`) and secondary editorial headlines are eliminated from the card face. This ensures full visual priority for the custom cover illustration without redundant text overlays.
- **Dedicated Bottom Frosted Capsule**: Card information is consolidated strictly into the bottom frosted glass capsule (`backdrop-blur-md`), containing the rounded app icon, bold app title, category label, and the hover-reactive `View ↗` button.
- **Focused Bottom Gradient Scrim**: Shading is confined strictly to the bottom ~30% of the card (`transparent 68%` to `rgba(0,0,0,0.28) 100%`) for capsule contrast, preserving 70%+ of the artwork completely unshaded.
15. **Mobile Hero Ultra-Smooth Performance & Optimization Architecture (`HomeHero`, `EarthScene`, `useIsMobile`)**:
- **Single-Mount Scene Isolation**: SSR-safe media query hook (`useIsMobile`) ensures `<EarthScene>` is mounted exactly once across all breakpoints. On mobile screens (`isMobile`), only the compact mobile scene is mounted, eliminating duplicate live typing intervals, duplicate ticker loops, and 27 redundant DOM nodes.
- **WASM Particle Engine & Desktop Asset Bypass**: `WasmAtmosphereCanvas` (full-screen WebGL + WebAssembly particle simulator) and full-bleed desktop background images are conditioned with `isMounted && !isMobile`, preventing heavy WebGL context allocation, CPU loop thrashing, and 29 unnecessary image network requests on mobile devices.
- **Curated 6-Rock Anchor Cluster (`MOBILE_ROCKS`)**: Mobile floating geometry is streamlined from 27 rocks down to 6 curated anchor rocks (`Rock 1, 2, 3, 4, 5, 8`), completely stripping expensive `filter: drop-shadow(...)` from mobile rock elements.
- **Zero-Blur Instant Typography Entrance**: Mobile headlines, badge, and subtitles bypass word-level `filter: blur(8px)` spring animations in favor of block-level `<Reveal>` containers. This eliminates mobile compositor repaints across 35+ text elements during page load.
- **Optimized Mobile 2D Laptop Rasterization**: Mobile `LaptopLiveCanvas` operates at `320x198` resolution (compared to `420x260` on desktop), saving 40% canvas raster memory and CPU fill-rate cycles while maintaining crisp, live-typing syntax highlighting.
- **React Strict-Mode Transition Lifecycle Hardening**: Fixed transition loader lifecycle in `PageTransitionLoader` to gracefully handle React 18 / Next.js development Strict Mode mounting without timer drops, ensuring guaranteed 520ms snappy particle dismissal.
16. **Dynamic Author & Contributor Attribution System (`BlogArticleHeader`, `BlogCard`, `AppInformationSpecs`)**:
- **Default Studio Attribution Omission**: Because ElseSourav is the creator's personal software studio, redundant creator names ("Sourav") and generic profile avatars are eliminated by default from update articles, update cards, and app specifications.
- **Explicit Contributor Architecture**: Database schemas (`BlogPost` and `App`) provide first-class optional attribution fields (`authorName`, `authorImageUrl`, `authorUrl`, `authorRole`). Only when an explicit contributor is configured does the UI render their avatar, name, and role.
- **Non-Wrapping Mobile Publication Metadata**: In `BlogArticleHeader`, publication dates (`Calendar`), reading times (`Clock`), and view counts (`Eye`) render in a streamlined, non-wrapping inline strip (`whitespace-nowrap`) alongside the content-aware Share action, preventing date breakaways across small mobile screens.



