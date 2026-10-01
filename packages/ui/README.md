# @elsesourav/ui — Design System & Component Library

The official, accessible, performance-first design system and interaction library powering the **ElseSourav** platform.

---

> ## ⚠️ Mandatory UI Development Workflow (Skill-First Policy)
>
> **Every developer and AI coding agent (including Gemini Code, Antigravity, Claude, etc.) must strictly adhere to the following mandatory workflow for all UI tasks:**
>
> 1. **Read & Follow Skills/Docs First**: Before making any UI changes or creating new components, always read and follow the relevant UI development skill or documentation first (`packages/ui/README.md`, `docs/design/DESIGN_CONSTITUTION.md`, `docs/design/THEME_TOKEN_ARCHITECTURE.md`).
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

---

## 5-Layer Surface Elevation Hierarchy

1. **Layer 0 (Canvas — `.depth-0`)**: Deep `#09090b` viewport foundation (`bg-background`).
2. **Layer 1 (Subtle Inset — `.depth-1`)**: Embedded blocks, table headers, inset preview areas (`bg-surface-subtle`).
3. **Layer 2 (Solid Surface — `.depth-2`)**: Standard content cards, data tables, sidebars (`bg-surface` or `bg-surface-elevated`).
4. **Layer 3 (Overlays — `.depth-3`)**: Dropdown menus, tooltips, dialogs, drawers (`bg-surface-overlay` with `shadow-xl`).
5. **Layer 4 (Focused — `.depth-4`)**: Active selection rings, brand illumination rings (`ring-2 ring-primary/40`).

---

# Part 1: Core Primitives & Layout Foundations (`@elsesourav/ui`)

All components in this section are exported directly from `@elsesourav/ui`.

```tsx
import { ... } from '@elsesourav/ui';
```

## Category 1: Foundation Primitives

### `Button` & `IconButton`

- **Purpose**: High-contrast, accessible triggers for actions, submissions, navigation, and modal dismissals.
- **Key Features**: Full keyboard focus ring, tactile press animation (`active:scale-[0.98]`), integrated loading spinner state, zero layout shift.
- **Props**:
  - `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'` (default: `'primary'`)
  - `size`: `'sm' | 'md' | 'lg' | 'icon'` (default: `'md'`)
  - `loading?: boolean`
  - `disabled?: boolean`
  - `children: React.ReactNode`
- **Usage Example**:
  ```tsx
  import { Button, IconButton } from '@elsesourav/ui';
  import { Sparkles, Trash2 } from 'lucide-react';

  <Button variant="primary" size="md" loading={isPending} onClick={handleSave}>
    <Sparkles className="h-4 w-4" />
    <span>Save Changes</span>
  </Button>

  <IconButton variant="ghost" size="sm" aria-label="Delete item" onClick={handleDelete}>
    <Trash2 className="h-4 w-4 text-red-400" />
  </IconButton>
  ```
- **When & Where to Use**: Use across all forms, dialog footers, navigation bars, and toolbars. Use `danger` only for irreversible or sensitive operations.

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
- **Key Features**: Smooth fallback initials generator, image load error handling, border ring for dark mode definition.
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
  - `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'`
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

- **Purpose**: Unified outer viewport wrapper providing consistent background depth, top padding, and bottom layout rhythm.
- **Key Features**: Coordinates ambient background effects, skip-link integration, and SEO semantics.
- **Props**:
  - `children: React.ReactNode`
  - `className?: string`
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

- **Purpose**: Non-intrusive GPU-accelerated gradient aura and micro-dot grid providing subtle depth to hero sections and settings headers.
- **Key Features**: Automatically disables heavy filters when `prefers-reduced-motion` is active. Zero CPU drag.
- **Usage Example**:
  ```tsx
  import { AmbientBackground } from '@elsesourav/ui';

  <AmbientBackground variant="subtle" />;
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

## Category 4: Surfaces & Elevation

### `Card` Suite

- **Purpose**: Primary surface container for chunking related information, stats, or configuration settings.
- **Subcomponents**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
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

- **Purpose**: Inline contextual notices communicating errors, security warnings, or system confirmations.
- **Variants**: `'info' | 'success' | 'warning' | 'error'`
- **Usage Example**:
  ```tsx
  import { Alert, AlertTitle, AlertDescription } from '@elsesourav/ui';
  import { AlertTriangle } from 'lucide-react';

  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Password expirable</AlertTitle>
    <AlertDescription>Your password hasn't been changed in 180 days.</AlertDescription>
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

- **Purpose**: Secure, GFM-compliant markdown parser with syntax-highlighted code blocks, copy actions, responsive tables, and full write/preview editing suite.
- **When & Where to Use**: Technical blog articles, documentation pages, admin CMS editor.

---

### `Reveal`, `StaggerContainer`, `StaggerItem`

- **Purpose**: CSS and GPU-accelerated entrance animations that reveal items as they enter the viewport.

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
  - Automatic error and retry callbacks.
- **Props**:
  - `src?: string`
  - `alt: string`
  - `width: number`, `height: number`
  - `placeholder?: string` (base64 or thumbnail)
  - `color?: string` (dominant color placeholder)
  - `blur?: number` (default: `14`)
  - `radius?: number` (default: `11`)
- **Usage Example**:
  ```tsx
  import { BlurUpImage } from '@elsesourav/ui/interior';

  <BlurUpImage
    src="/portfolio/hero.jpg"
    alt="Project Preview"
    width={800}
    height={450}
    color="#18181b"
    blur={16}
    radius={12}
  />;
  ```
- **When to Use**: Hero project images, profile avatar previews, blog header banners, image galleries.

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

## Complete Directory: All 54 Interior.dev Components

| Component               | Primary Props / Types             | Physics & Animation Behavior                         | Ideal Use Case                              |
| :---------------------- | :-------------------------------- | :--------------------------------------------------- | :------------------------------------------ |
| **`Accordion`**         | `items: { id, title, content }[]` | Spring height disclosure with chevron rotation       | FAQ sections, collapsible settings          |
| **`BlurUpImage`**       | `src, alt, width, height, blur`   | Smooth progressive reveal with instant cache bypass  | Hero images, avatar studios, media cards    |
| **`CollapsibleBanner`** | `open, onDismiss, children`       | Elastic collapse with top-border bounce              | System announcements, discount alerts       |
| **`CommandPalette`**    | `open, onOpenChange, items`       | Centered floating scale-in with instant fuzzy search | Quick action palette (`Cmd+K`)              |
| **`ContextMenu`**       | `items, children`                 | Cursor-anchored spring reveal with bounds collision  | Table row right-click actions               |
| **`CopyButton`**        | `value, timeout, label`           | Tactile icon morph from Copy to Checkmark            | Code blocks, shareable links, API tokens    |
| **`Drawer`**            | `open, onOpenChange, side`        | Side slide-in with elastic overshoot                 | Mobile menus, side inspectors, filter decks |
| **`Dropdown`**          | `options, value, onChange`        | Scaled fade with active item highlight               | Form selection, filter criteria             |
| **`ExpandingSearch`**   | `placeholder, onSearch`           | Smooth horizontal width expansion on click           | Minimalist navigation headers               |
| **`FilterGrid`**        | `items, activeCategory`           | Layout reflow with FLIP animation                    | Portfolio filters, project showcases        |
| **`FloatingLabel`**     | `label, value, error`             | Floating micro-label transition upon input focus     | Material/modern login and signup forms      |
| **`HideOnScroll`**      | `children, threshold`             | Smooth vertical transform header hide/reveal         | Sticky navigation bars, mobile toolbars     |
| **`HoldToConfirm`**     | `onConfirm, duration, variant`    | Progressive stroke fill with release decay           | Irreversible deletions, critical actions    |
| **`IconMorph`**         | `iconA, iconB, active`            | Smooth SVG path crossfade                            | Play/Pause, Hamburger/Close buttons         |
| **`InlineValidation`**  | `status, message`                 | Slide-down error pill with red accent pulse          | Real-time email and username checkers       |
| **`Lightbox`**          | `src, alt, open, onClose`         | Fullscreen zoom from clicked element thumbnail       | Image gallery previews, proof viewing       |
| **`LikeBurst`**         | `liked, onLike, count`            | Particle burst explosion with heart scale punch      | Social likes, upvoting blog posts           |
| **`LiveActivity`**      | `title, status, time`             | Dynamic island capsule expansion                     | Audio player status, background job tracker |
| **`LoadMore`**          | `onLoad, hasMore, loading`        | Spinner crossfade with content injection             | Paginated blog posts, endless lists         |
| **`LoadingButton`**     | `onAction, pendingLabel`          | Morphing width button with spinner and checkmark     | Async forms, checkout, authentication       |
| **`LogoMarquee`**       | `logos, speed, pauseOnHover`      | Seamless infinite CSS ticker                         | Partner logos, client trust badges          |
| **`LongPress`**         | `onLongPress, delay`              | Radial progress ring indicator                       | Mobile quick-actions, preview triggers      |
| **`Modal`**             | `open, onClose, title`            | Backdrop blur scrim with centered pop                | Confirmation dialogs, modal forms           |
| **`NewItemsPill`**      | `count, onClick`                  | Floating pill drop-in at top of feed                 | "3 new posts" feed notification             |
| **`OtpInput`**          | `length, onComplete, mode`        | Cell-by-cell focus glide and clipboard auto-fill     | 2FA verification, SMS login codes           |
| **`Pagination`**        | `page, total, onChange`           | Floating sliding pill over active page number        | Multi-page data tables, search results      |
| **`PasswordStrength`**  | `value, rules, showRules`         | Multi-bar entropy rating with live rule tests        | New account creation, password resets       |
| **`PollResults`**       | `options, totalVotes`             | Animated percentage bar widths                       | Community voting, survey widgets            |
| **`Popover`**           | `trigger, content, align`         | Anchored floating card with pointer arrow            | Rich tooltips, user preview hovercards      |
| **`PresenceAvatars`**   | `users, max`                      | Overlapping avatar stack with hover expansion        | Active collaborators, live viewers          |
| **`PressDepth`**        | `depth, tilt, onClick`            | 3D tactile button push with directional lean         | Primary CTA buttons, game-like triggers     |
| **`ProgressBar`**       | `value, max, animated`            | Smooth progress bar with glowing tip                 | Onboarding checklist, file upload progress  |
| **`ReadingProgress`**   | `targetRef`                       | Window top scroll tracker hairline                   | Long-form editorial and technical articles  |
| **`ReorderList`**       | `items, onReorder`                | Drag-and-drop reorder with spring physics            | Task priority lists, navigation organizers  |
| **`Ripple`**            | `children, color`                 | Radial water ripple radiating from click coordinate  | Material buttons, interactive surface tiles |
| **`ScrollSpy`**         | `sections, activeId`              | Active marker that tracks scroll position            | Table of contents in documentation          |
| **`SegmentedControl`**  | `options, value, onChange`        | Spring thumb gliding across segmented options        | Filter modes, theme pickers, view switches  |
| **`ShowMore`**          | `lines, moreLabel`                | Spring height clamp disclosure                       | Long user bios, project descriptions        |
| **`SkeletonSwap`**      | `loading, skeleton, children`     | Seamless crossfade between skeleton and content      | API data loading transitions                |
| **`SliderDetents`**     | `value, min, max, steps`          | Slider thumb with magnetic snap to notches           | Volume controls, pricing tier sliders       |
| **`SnapCarousel`**      | `children, gap, peek`             | Momentum flick carousel with snap points             | Project showcases, photo galleries          |
| **`SortableTable`**     | `columns, data, onSort`           | Column header sort arrow animation                   | Administrative data grids                   |
| **`StickyHeader`**      | `children, offset`                | Glass transition when page scrolls beyond threshold  | Sticky navigation bars                      |
| **`StreamingText`**     | `text, speed`                     | Typewriter word-by-word streaming effect             | AI chatbot responses, terminal greetings    |
| **`SwipeDeck`**         | `cards, onSwipe`                  | Tinder-style swipe cards with fling velocity         | Match cards, card sorting workflows         |
| **`Tabs`**              | `tabs, activeTab, onChange`       | Floating sliding underline indicator                 | Tabbed interfaces                           |
| **`TagInput`**          | `tags, onAdd, onRemove`           | Pill tag insertion with spring entrance              | Blog tagging, tech stack selection          |
| **`TaskSteps`**         | `steps, currentStep`              | Stepper bar with connected progress lines            | Multi-step setup wizards                    |
| **`TextReveal`**        | `text, delay`                     | Word-by-word opacity mask rise                       | Hero titles, landing page headlines         |
| **`TooltipGroup`**      | `tooltips, activeIndex`           | Shared tooltip bubble that glides between items      | App toolbars, icon ribbons                  |
| **`TreeView`**          | `nodes, onSelect`                 | Nested folder disclosure with connecting lines       | File explorers, hierarchical category trees |
| **`TypingIndicator`**   | `size, color`                     | Three oscillating dots in speech bubble              | Live chat waiting status                    |
| **`ValueFlash`**        | `value`                           | Green/Red pulse whenever numeric value updates       | Live crypto prices, analytics counters      |
| **`WizardSteps`**       | `steps, activeIndex`              | Step-by-step progress cards with validation          | Multi-step checkout, user onboarding        |

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

| Component           | Description                                               | Best Used For                                 |
| :------------------ | :-------------------------------------------------------- | :-------------------------------------------- |
| **`BellToggle`**    | Harmonic ringing bell toggle with badge counter           | Notification preferences, alert subscriptions |
| **`BranchedMenu`**  | Radial tree branching menu opening from central hub       | Quick radial toolbars, floating speed dials   |
| **`CallChip`**      | Expandable status capsule with pulsing live waves         | Active call status, podcast player indicator  |
| **`CodeSlots`**     | Mechanical slot-machine digit counter                     | Live user counts, star counters               |
| **`CometDial`**     | Circular dial slider with glowing comet tail              | Volume controllers, circular timers           |
| **`DodgeField`**    | Text input with playful dodging character eye             | Login passwords, whimsical form fields        |
| **`FlipCard`**      | 3D perspective flip card with realistic shadow            | Developer business cards, portfolio showcases |
| **`FolderFloat`**   | Origami floating folder opening with paper preview        | File attachments, folder organizers           |
| **`FuseButton`**    | Action button with burning fuse trail before commit       | Final irreversible action trigger             |
| **`GlideSelect`**   | Magnetic glide selector with smooth cursor suction        | Compact dropdown alternatives                 |
| **`HoldButton`**    | Charge-up hold button with electric particle aura         | Game actions, authorization confirmations     |
| **`JellyRadio`**    | Gelatinous radio button that jiggles upon selection       | Form surveys, rating choices                  |
| **`LatticeLoader`** | Interlocking geometric matrix loading spinner             | Fullscreen page transition loaders            |
| **`PaperCrumple`**  | Physical 2D matter.js paper crumple into ball             | Discarding drafts, throwing away notes        |
| **`PeekRating`**    | Five-star rating where stars smile/frown based on score   | Customer feedback, project review ratings     |
| **`PromptBar`**     | Sleek AI prompt bar with rainbow micro aura               | AI query inputs, command search bars          |
| **`PulseHeart`**    | Anatomical pulsating heart button for favorites           | Favoriting articles, sponsoring projects      |
| **`RefineFrame`**   | Crop and adjust bounding box with magnetic handles        | Avatar crop studio, image adjustments         |
| **`RubberSegment`** | Elastic rubber band segment selector                      | Range switches, view filters                  |
| **`ScrubField`**    | Number input draggable horizontally like After Effects    | Numeric adjustments, CSS dimensions           |
| **`Shredder`**      | Matter.js physics shredder turning documents into ribbons | Permanent account wipes, security cleanups    |
| **`SlideCommit`**   | Slide-to-unlock style commit bar                          | Slide to pay, slide to publish                |
| **`SlingButton`**   | Slingshot pull-and-release button                         | Sending messages, launching actions           |
| **`SloshGauge`**    | Liquid sloshing gauge with water physics                  | Storage usage, battery meter                  |
| **`SpringCheck`**   | High-energy bouncing checkmark                            | To-do lists, task completion confirmation     |
| **`SquishSwitch`**  | Elastic silicone switch with stretch and squish           | Setting toggles, mode switches                |
| **`StatusMark`**    | Tactile status badge with pinging pulse ring              | Server status, online indicator               |
| **`SwipeRow`**      | iOS-style swipe action row revealing actions              | Mobile list items, mail inbox items           |
| **`SwipeToast`**    | Dismissible toast notification flickable off-screen       | High-priority mobile notifications            |
| **`TearTicket`**    | Perforated discount ticket that tears in half             | Event tickets, voucher redemption             |
| **`ThoughtLine`**   | Animated thinking line pulse for AI reasoning             | AI stream reasoning indicator                 |
| **`VoicePill`**     | Audio wave pill reacting to voice microphone input        | Voice search, audio notes                     |
| **`WakeSlider`**    | Sleeping slider that opens eyes when touched              | Brightness controls, sensory sliders          |
| **`WarmTooltip`**   | Floating tooltip with organic jelly squash effect         | Rich interactive element explanations         |

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
