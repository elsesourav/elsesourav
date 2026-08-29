# ElseSourav Design Constitution

> **Status**: Permanent & Authoritative Baseline  
> **Phase**: Foundation Phase  
> **Governance Scope**: 100% of routes, components, tokens, interactions, and content across Public, Authenticated User, and Admin tiers.

---

## 1. Philosophical Baseline & Product Identity

### 1.1 Product Identity
The product is formally and exclusively:
$$\mathbf{ElseSourav}$$

ElseSourav is a handcrafted developer platform, software ecosystem, engineering notebook, and utility suite created by Sourav. It is not an enterprise template, not an AI-generated clone, and not a faceless SaaS aggregator.

### 1.2 The Global Version Naming Mandate
- **Rule**: Never expose "V1", "V2", "Version 2.0", or generational labels in user-facing surfaces.
- **Affected Surfaces**: Titles, headings, hero badges, empty states, button labels, navigation links, error messages, metadata, OpenGraph tags, and JSON-LD schemas.
- **Permitted Usage**: Limited strictly to internal developer docs (`docs/*`), Git commits, package versions (`package.json`), and changelogs (`CHANGELOG.md`).

---

## 2. The 10 Foundational Principles

---

### Principle 1: Human-Made Design

**Core Concept**  
ElseSourav intentionally rejects the homogenized, generic aesthetic of AI-generated SaaS templates, cookie-cutter component libraries, and formulaic portfolio themes. The interface must communicate craft, intentionality, and a distinct human perspective.

**Priorities**:
- **Personality**: A clear point of view rooted in engineering depth, terminal ergonomics, and modern web standards.
- **Intentional Composition**: Layouts designed around actual content shape, not generic rectangular placeholders.
- **Authentic Content**: Real devlogs, genuine benchmark telemetry, verifiable software releases, and authored perspectives.
- **Distinctive Typography**: Deliberate interplay between expressive display type (`Space Grotesk`), ultra-readable body (`Geist Sans`), and precise monospace (`JetBrains Mono`).
- **Thoughtful Details**: Tactile borders, subtle radial glows, custom-crafted micro-interactions, and informative empty states.

**Negative Constraints**:
- Do **NOT** add visual novelty or decorative gimmicks merely to appear "modern" or "trendy".
- Do **NOT** use unmotivated floating 3D shapes, meaningless gradient mesh blobs, or faux-cyberpunk neon outlines.

---

### Principle 2: Strategic Design Thinking

**Core Concept**  
Design follows purpose. No screen, component, or interaction is designed in isolation. Every view must resolve a specific user intent and satisfy strict functional success criteria.

**Mandatory 7-Point Canvas for Every Significant Feature/Page**:
1. **Purpose**: Why does this page or feature exist?
2. **Audience**: Who is using it (first-time visitor, logged-in developer, support seeker, admin)?
3. **User Problem**: What specific friction or question is being resolved?
4. **Primary Action**: What is the single most important action on the screen?
5. **Secondary Actions**: What supporting tasks are permitted without competing for visual dominance?
6. **Information Hierarchy**: How does the visual weight guide the reader from primary context to fine detail?
7. **Success Criteria**: What measurable outcome defines a successful visit?

---

### Principle 3: Organic / Anti-Grid Layouts

**Core Concept**  
Visual rhythm must adapt to storytelling. While standard grids create monotony, asymmetric and organic compositions introduce editorial pacing and focus.

**Selective Application Matrix**:

| Category | Appropriate Routes / Sections | Composition Strategy |
| :--- | :--- | :--- |
| **Apply Organically** | • Homepage Hero & Spotlight<br>• About Page Storytelling<br>• Featured Work Showcase<br>• Devlog Editorial Headers | • Asymmetric column splits (`1.618fr 1fr`, `2fr 1fr`)<br>• Staggered focal points and alternating anchors<br>• Deliberate whitespace breathing rooms |
| **Strict Grid / Layout** | • Search Results & Filters<br>• User Settings & Forms<br>• Support Ticket Threads<br>• Help Workflows & Documentation<br>• Admin Data Tables & Metrics | • Predictable column alignments<br>• Strict tab order and uniform spacing<br>• Optimized for rapid ocular scanning |

---

### Principle 4: Motion Narrative

**Core Concept**  
Animation is a functional communication layer, not decoration. Every transition must explain spatial relationships, acknowledge state transitions, or orient user attention.

**Functional Motion Triggers**:
- **Navigation & Wayfinding**: Page entry transitions and drawer/modal entrances communicate where the user arrived from.
- **State Changes**: Expanding accordion items, tabs switching, or dropdown menus unfolding.
- **Hierarchy & Attention**: Subtle stagger on page load guides the eye from the hero headline to the primary CTA.
- **Feedback**: Instant tactile acknowledgement upon button clicks, switch flips, and form submissions.

**Strict Motion Constraints**:
- Zero continuous decorative spinning or floating animations.
- Transform **only** compositor properties (`transform`, `opacity`). Never animate layout dimensions (`width`, `height`, `top`, `margin`).
- Enforce standard timing tokens: `--transition-fast` (`150ms`), `--transition-smooth` (`250ms`), `--transition-slow` (`400ms`).
- Strictly respect `@media (prefers-reduced-motion: reduce)` by collapsing all durations to `0.01ms`.

---

### Principle 5: Glassmorphism 2.0 (Depth & Restraint)

**Core Concept**  
Solid surfaces are the default foundation. Glass is exclusively a hierarchy and depth tool used for floating overlays, fixed navigation, and elevated dialogs.

**Rules of Restraint**:
- **Solid Surfaces First**: 90% of containers, cards, and body wells use solid, high-contrast tokens (`--color-bg-surface`, `--color-bg-surface-elevated`).
- **Where Glass is Permitted**:
  1. Sticky top navigation bar (frosted backdrop blur over scrolling content).
  2. Floating modal dialogs and slide-out drawers.
  3. Floating action bars and toast notifications.
  4. Subtle accent badge pills over hero visualizers.
- **Where Glass is Forbidden**:
  - Never in dense Admin data grids or CMS forms.
  - Never behind long-form article body copy or documentation guides.
  - Never stacked/nested (glass on top of glass).
- **Legibility Guard**: Contrast ratio of text on glass must remain $\ge 4.5:1$ across all scroll positions.

---

### Principle 6: Archival Index System

**Core Concept**  
ElseSourav is a permanent, evolving library of engineering artifacts, software tools, and devlogs. Content is indexed and discoverable through robust information architecture rather than ephemeral feeds.

**Application Across Domains**:
- **Apps Catalog**: Categorized by platform (Web, CLI, Desktop, Extensions), version status, and domain tags.
- **Devlog Archive**: Chronological index with estimated reading times, category taxonomy, and tag wayfinding.
- **Help Center**: Structured hierarchy (Topic $\rightarrow$ Category $\rightarrow$ Article) with cross-linked solutions.
- **User Library**: Fast, bookmarkable personal collection with favorite toggles and launch history.
- **Admin Directory**: Comprehensive, searchable data listings with explicit column sorting, pagination, and filter queries.

**Visual Rule**: Use structured cards, metadata badges, and clean list items—do not reduce every catalog view into a sterile spreadsheet table.

---

### Principle 7: Purposeful Micro-Interactions

**Core Concept**  
Every interactive element must provide immediate, unmistakable feedback across all seven interaction states:

```
┌───────────┐    Hover    ┌───────────┐    Press    ┌───────────┐
│  DEFAULT  │ ──────────> │   HOVER   │ ──────────> │  PRESSED  │
└───────────┘             └───────────┘             └───────────┘
      │                         │                         │
      ▼                         ▼                         ▼
┌───────────┐             ┌───────────┐             ┌───────────┐
│ DISABLED  │             │  FOCUSED  │             │  LOADING  │
└───────────┘             └───────────┘             └───────────┘
                                                          │
                                     ┌────────────────────┴────────────────────┐
                                     ▼                                         ▼
                               ┌───────────┐                             ┌───────────┐
                               │  SUCCESS  │                             │   ERROR   │
                               └───────────┘                             └───────────┘
```

**Interaction State Matrix**:
1. **Hover**: 1px upward translation (`translateY(-1px)`) and subtle border brightness lift (`border-zinc-700`).
2. **Focus**: High-visibility 2px contrast ring (`ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950`).
3. **Pressed**: Tactile depression (`scale(0.98)` and `translateY(0)`).
4. **Loading**: Replaces text with a smooth SVG spinner or inline pulse skeleton; element is automatically aria-busy.
5. **Success**: Subtle green checkmark animation with a 2-second timeout.
6. **Error**: Shake vibration animation (once, 300ms) with high-contrast red error border (`border-red-500`).
7. **Disabled**: Reduced opacity (`opacity-50`), `cursor-not-allowed`, and pointer-events disabled.

---

### Principle 8: Accessibility-First (Universal Usability)

**Core Concept**  
Accessibility is infrastructure. The platform must be completely usable by anyone, on any device, utilizing any assistive technology.

**Non-Negotiable Standards**:
- **Semantic Structure**: Strictly sequential headings (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`). Exactly one `<h1>` per view.
- **Contrast**: Body copy $\ge 7:1$ against backgrounds (WCAG AAA target). Large text & UI borders $\ge 4.5:1$ (WCAG AA).
- **Keyboard Operability**: 100% of interactive elements reachable by `Tab` and executable via `Enter` or `Space`.
- **Focus Management**: Focus trapped inside open modal dialogs; focus restored to trigger upon modal close.
- **Forms**: Explicit `<label>` elements linked by `htmlFor`, inline error validation with `aria-describedby` and `aria-invalid`.
- **Screen Reader Support**: Meaningful ARIA landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`), descriptive image `alt` attributes, and `sr-only` utility text where icons represent actions.

---

### Principle 9: AI as Creative & Technical Co-Pilot

**Core Concept**  
AI is an implementation accelerator and verification tool. It is not the designer, not the product owner, and not the author.

**Boundary Protocol**:
- **AI Responsibilities**: Rapid component scaffolding, TypeScript type inference, unit test generation, regression testing, lint fixes, and documentation synthesis.
- **Human Authority**: Sourav retains exclusive authority over:
  1. Product identity and branding.
  2. UX philosophy and strategic layout decisions.
  3. Copywriting tone, personal perspectives, and devlog content.
  4. Final architectural reviews and quality sign-offs.

---

### Principle 10: Performance-First Creativity

**Core Concept**  
Performance is an aesthetic virtue. Sluggish transitions, layout shifts, or heavy client bundles ruin beautiful visual design.

**Performance Budget & Architecture**:
- **Core Web Vitals Thresholds**:
  - **LCP** (Largest Contentful Paint) $< 1.2\text{s}$
  - **INP** (Interaction to Next Paint) $< 100\text{ms}$
  - **CLS** (Cumulative Layout Shift) $= 0.00$
  - **TTFB** (Time to First Byte) $< 200\text{ms}$
- **Zero-Hydration Bloat**: Default to React Server Components (RSC). Restrict `'use client'` strictly to interactive leaves.
- **Asset Optimization**: All images delivered via `next/image` with WebP/AVIF formatting, responsive srcset sizes, and CDN caching.
- **Font Strategy**: Preloaded via `next/font/google` with `display: swap` to prevent FOIT (Flash of Invisible Text).

---

## 3. The Universal Page Decision Rule

Before designing or implementing any page, the engineering team must answer:

> **"What is the user trying to accomplish on this exact screen?"**

Then, select the appropriate design language from the tier matrix:

```
                  ┌─────────────────────────────────────┐
                  │ What is the primary user objective? │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  PUBLIC DISCOVERY│       │  AUTHENTICATED   │       │  ADMINISTRATIVE  │
│  & STORYTELLING  │       │  PRODUCTIVITY    │       │  OPERATIONS      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ • Asymmetric     │       │ • High contrast  │       │ • High density   │
│ • Rich type      │       │ • Fast state     │       │ • Solid surfaces │
│ • Glass accents  │       │ • Solid surfaces │       │ • Fast tables    │
│ • Entrance motion│       │ • Tactile feedback│      │ • Zero motion    │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

**Golden Rule**: Do not force every principle equally onto every page. Let the page's strategic purpose determine its aesthetic intensity.

---

## 4. Governance & Verification Gate

Every pull request or feature addition must verify compliance against this checklist:

1. [ ] **Version Rule Checked**: Zero instances of "V1" or "V2" in customer-facing UI/metadata.
2. [ ] **Purpose Defined**: 7-point design canvas established for new views.
3. [ ] **Surface Tier Applied**: Appropriate visual restraint applied (Public vs User vs Admin).
4. [ ] **Accessibility Audited**: Contrast $\ge 4.5:1$, sequential headings, keyboard tab path verified.
5. [ ] **Motion Scoped**: All animations purposeful, GPU-composited, and reduced-motion compliant.
6. [ ] **Performance Checked**: RSC streaming leveraged, zero layout shift, minimal client JS.
7. [ ] **Build Health Verified**: `turbo typecheck`, `turbo lint`, and `turbo test` pass with 100% success.
