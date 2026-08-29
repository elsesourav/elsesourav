# ElseSourav Design Constitution

> **Status**: Authoritative Baseline  
> **Phase**: Foundation Phase  
> **Governance Scope**: 100% of routes, components, tokens, interactions, and content across Public, Authenticated User, and Admin tiers.

---

## 1. Product Identity & Baseline

### 1.1 Product Identity

The public product identity is formally and exclusively:
$$\mathbf{ElseSourav}$$

ElseSourav is a handcrafted personal platform, software ecosystem, and engineering notebook created by Sourav. It is not an enterprise template, not an AI-generated clone, and not a generic SaaS aggregator.

### 1.2 The Global Version Naming Mandate

- **Rule**: Never present the product as "ElseSourav V1", "ElseSourav V2", "Version 1", "Version 2", "V2 platform", "V2 UI", or "New V2".
- **Scope**: Public pages, User portal, and Admin portal.
- **Permitted Technical Usages**: Limited strictly to internal developer docs (`docs/*`), Git commits, package versions (`package.json`), and SemVer application release tags (`v1.4.0`).

---

## 2. The 10 Design Principles

---

### Principle 1: Human-Made Design

**Core Philosophy**  
ElseSourav intentionally rejects the homogenized, generic aesthetic of AI-generated SaaS templates, cookie-cutter component libraries, and formulaic portfolio themes. The interface must communicate craft, intentionality, and a distinct human perspective.

**Priorities**:

- **Authenticity & Personality**: A clear point of view rooted in engineering craft, developer ergonomics, and modern web standards.
- **Intentional Composition**: Layouts designed around actual content shape, not generic rectangular placeholders.
- **Meaningful Content**: Real devlogs, genuine benchmark telemetry, verifiable software releases, and authored perspectives.
- **Distinctive Typography**: Deliberate interplay between expressive display type (`Space Grotesk`), ultra-readable body (`Geist Sans`), and precise monospace (`JetBrains Mono`).
- **Thoughtful Details**: Tactile borders, subtle radial glows, custom-crafted micro-interactions, and informative empty states.

**Negative Constraints**:

- Do **NOT** add visual novelty merely to appear modern or trendy.
- Do **NOT** use unmotivated floating 3D shapes, meaningless gradient mesh blobs, or faux-cyberpunk neon outlines.

---

### Principle 2: Strategic Design Thinking

**Core Philosophy**  
Design follows purpose. No screen, component, or interaction is designed in isolation. Always understand **WHY** before deciding **WHAT** to build.

**Mandatory 7-Point Canvas for Every Significant Page & Feature**:

1. **Purpose**: Why does this page or feature exist?
2. **Audience**: Who is using it (first-time visitor, logged-in developer, support seeker, admin)?
3. **User Problem**: What specific friction or question is being resolved?
4. **Primary Action**: What is the single most important action on the screen?
5. **Secondary Actions**: What supporting tasks are permitted without competing for visual dominance?
6. **Information Hierarchy**: How does the visual weight guide the reader from primary context to fine detail?
7. **Success Criteria**: What measurable outcome defines a successful visit?

---

### Principle 3: Organic / Anti-Grid

**Core Philosophy**  
Use asymmetrical and organic composition where it improves storytelling, visual hierarchy, personality, and editorial quality.

**Selective Application Matrix**:

| Category                               | Appropriate Routes / Sections                                                                                                                          | Composition Strategy                                                                                                                                 |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apply Organically**                  | • Homepage Hero & Spotlight<br>• About Page Storytelling<br>• Featured Work Showcase<br>• Devlog Editorial Headers                                     | • Asymmetric column splits (`1.618fr 1fr`, `2fr 1fr`)<br>• Staggered focal points and alternating anchors<br>• Deliberate whitespace breathing rooms |
| **Strict Layouts (No Forced Organic)** | • Search Results & Filters<br>• User Settings & Forms<br>• Support Ticket Threads<br>• Help Workflows & Documentation<br>• Admin Data Tables & Metrics | • Predictable column alignments<br>• Strict tab order and uniform spacing<br>• Optimized for rapid ocular scanning                                   |

---

### Principle 4: Motion Narrative

**Core Philosophy**  
Motion must communicate something meaningful. Avoid decorative animation with no functional purpose.

**Functional Motion Triggers**:

- **Transitions & Navigation**: Communicating where the user arrived from and spatial continuity.
- **Hierarchy & Orientation**: Guiding attention from primary headlines to interactive calls to action.
- **Feedback & State Changes**: Tactile acknowledgement upon button clicks, switch flips, accordions, and form submissions.
- **Storytelling**: Controlled scroll-driven reveals on narrative editorial sections.

**Strict Motion Constraints**:

- Transform **only** compositor properties (`transform`, `opacity`). Never animate layout dimensions (`width`, `height`, `top`, `margin`).
- Enforce standard timing tokens: `--duration-fast` (`150ms`), `--duration-normal` (`250ms`), `--duration-slow` (`400ms`).
- Strictly respect `@media (prefers-reduced-motion: reduce)` by disabling non-essential motion.

---

### Principle 5: Glassmorphism 2.0 (Depth & Restraint)

**Core Philosophy**  
Use translucent and frosted surfaces selectively. Glass should provide depth, hierarchy, layering, and emphasis.

**Rules of Restraint**:

- **Solid Surfaces First**: The vast majority of containers, cards, and body wells use solid, high-contrast tokens (`--surface`, `--surface-elevated`).
- **Where Glass is Permitted**:
  1. Sticky top navigation bar (frosted backdrop blur over scrolling content).
  2. Floating modal dialogs and slide-out drawers.
  3. Floating action bars and toast notifications.
  4. Subtle accent badge pills over hero visualizers.
- **Where Glass is Forbidden**:
  - Never in dense Admin data grids or CMS forms.
  - Never behind long-form article body copy or documentation guides.
  - Never stacked/nested (glass on top of glass).
- **Readability & Accessibility Guard**: Readability and accessibility always win. Contrast ratio of text on glass must remain $\ge 4.5:1$ across all scroll positions.

---

### Principle 6: Archival Index System

**Core Philosophy**  
ElseSourav is a structured archive of engineering artifacts, software tools, devlogs, and documentation. Use structured information presentation with strong typography, metadata, indexing, and appropriate grids/tables.

**Application Across Domains**:

- **Apps Catalog**: Categorized by platform (Web, CLI, Desktop, Extensions), version status, and domain tags.
- **Blog Archive**: Chronological index with estimated reading times, category taxonomy, and tag wayfinding.
- **Help Center**: Structured hierarchy (Category $\rightarrow$ Article) with cross-linked solutions.
- **User Library**: Fast, bookmarkable personal collection with favorite toggles and launch history.
- **Admin Directory**: Comprehensive, searchable data listings with explicit column sorting, pagination, and filter queries.

_Rule: Do not turn every interface into a table. Use structured cards, metadata badges, and clean list items where appropriate._

---

### Principle 7: Purposeful Micro-Interactions

**Core Philosophy**  
Interactive elements must communicate state clearly and immediately. Do not animate interactions merely for decoration.

**Supported Interaction States**:

- **Hover**: Subtle elevation and border brightness lift.
- **Focus**: High-visibility contrast focus ring (`focus-visible:ring-2 focus-visible:ring-primary`).
- **Pressed**: Tactile depression (`scale(0.98)`).
- **Loading**: SVG spinner or pulse skeleton with `aria-busy="true"`.
- **Success**: Checkmark state with tactile color feedback.
- **Error**: High-contrast error border and message.
- **Disabled**: Reduced opacity (`opacity-50`) and `cursor-not-allowed`.
- **Selection / Save / Favorite**: Immediate toggle state reflection with optimistic UI updates.
- **Copy**: Instant clipboard confirmation feedback.
- **Navigation**: Clean active link indicator.

---

### Principle 8: Accessibility-First (Universal Usability)

**Core Philosophy**  
Accessibility is mandatory infrastructure, not an afterthought.

**Non-Negotiable Standards**:

- **Semantic HTML**: Strictly sequential headings (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`). Exactly one `<h1>` per view.
- **Keyboard Navigation**: 100% of interactive elements reachable via `Tab` and executable via `Enter` or `Space`.
- **Visible Focus**: Clear focus indicators on all interactive targets.
- **Screen Readers**: Meaningful ARIA landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`), descriptive image `alt` attributes, and `sr-only` utility text where icons represent actions.
- **Sufficient Contrast**: Body copy $\ge 7:1$ against backgrounds (WCAG AAA target). Large text & UI borders $\ge 4.5:1$ (WCAG AA).
- **Accessible Forms**: Explicit `<label>` elements linked by `htmlFor`, inline error validation with `aria-describedby` and `aria-invalid`.
- **Reduced Motion & Touch Usability**: Full support for `prefers-reduced-motion` and minimum $44\times 44\text{px}$ touch targets.

---

### Principle 9: AI as Creative Partner

**Core Philosophy**  
AI assists with implementation, analysis, refactoring, testing, brainstorming, and optimization. Human and product judgment remains strictly in control.

**Strict Boundaries**:

- AI must **NOT** invent:
  - personal identity
  - professional history
  - achievements
  - unsupported claims
  - fake testimonials
  - fake metrics
- Authentic creator information (Sourav) and verified software features only.

---

### Principle 10: Performance-First Creativity

**Core Philosophy**  
Every visual decision must consider loading performance, client JavaScript bundle size, image size, animation cost, dependency cost, Server Components, data fetching, and mobile performance. Beauty must not come at the cost of unnecessary performance problems.

**Performance Budgets**:

- **Core Web Vitals Thresholds**:
  - **LCP** (Largest Contentful Paint) $< 1.2\text{s}$
  - **INP** (Interaction to Next Paint) $< 100\text{ms}$
  - **CLS** (Cumulative Layout Shift) $= 0.00$
  - **TTFB** (Time to First Byte) $< 200\text{ms}$
- **Server-First Architecture**: Default to React Server Components (RSC); client JavaScript is restricted to interactive leaves.
- **Asset Optimization**: Responsive WebP/AVIF images with CDN caching and preloaded Google font subsets.

---

## 3. Global Decision Rule

> **These principles are rules for decision-making.**  
> **Do not force all 10 principles equally onto every page.**  
> **Use the principles that best serve the page's strategic purpose.**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PAGE TIER STRATEGY MAP                          │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ PUBLIC DISCOVERY   │ USER PRODUCTIVITY  │ ADMINISTRATIVE OPERATIONS    │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ • Human-made craft │ • Fast state       │ • High data density          │
│ • Rich typography  │ • High contrast    │ • Solid surface containers   │
│ • Selective glass  │ • Solid surfaces   │ • Strict predictable layout  │
│ • Asymmetric hero  │ • Tactile feedback │ • Zero distracting animation  │
│ • Narrative motion │ • Keyboard flow    │ • Fast tabular sorting       │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 4. Governance & Verification Checklist

Every pull request or view implementation must verify compliance against:

1. [ ] **Product Identity**: Zero mentions of "V1" or "V2" in public/user/admin UI.
2. [ ] **Purpose Defined**: 7-point design canvas established.
3. [ ] **Surface Restraint**: Solid surfaces default; glass restricted to overlays/nav.
4. [ ] **Accessibility Audited**: Contrast $\ge 4.5:1$, sequential headings, keyboard tab path verified.
5. [ ] **Motion Scoped**: Purposeful transitions only; reduced-motion compliant.
6. [ ] **Performance Checked**: RSC streaming leveraged, zero layout shift, minimal client JS.
7. [ ] **Build Health Verified**: `turbo typecheck`, `turbo test`, and `turbo build` pass with 100% success.
