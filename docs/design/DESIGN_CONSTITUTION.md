# ElseSourav Design Constitution

> **Status**: Official & Permanent Design Constitution  
> **Governance Scope**: 100% of routes, components, tokens, interactions, and content across Public, Authenticated User, and Admin tiers.  
> **Global Mandate**: These principles are rules for decision-making. Do not force all 10 principles equally onto every page. Use the principles that best serve the page's purpose.

---

## 1. Product Identity & Baseline Standards

### 1.1 Product Identity
The product is formally and exclusively:
$$\mathbf{ElseSourav}$$

ElseSourav is a handcrafted personal platform, software lab, developer tool suite, and engineering archive created by Sourav. It rejects formulaic SaaS templates, generic AI portfolios, and unnecessary complexity.

### 1.2 The Global Version Naming Mandate
- **Rule**: Never expose "V1", "V2", "Version 2.0", or generational labels in user-facing surfaces.
- **Affected Surfaces**: Page titles, headings, hero badges, empty states, button labels, navigation links, error messages, metadata, OpenGraph tags, and JSON-LD schemas.
- **Permitted Usage**: Limited strictly to internal developer docs (`docs/*`), Git commits, package versions (`package.json`), and SemVer changelogs.

---

## 2. The 10 Design Principles

---

### Principle 1: Human-Made Design

**Core Concept**  
ElseSourav intentionally avoids generic AI-generated SaaS and portfolio aesthetics. The interface must communicate authentic craft, intentionality, and a distinct human perspective.

**Prioritize**:
- **Authenticity**: Real software, verified facts, authored perspectives, and genuine engineering deep-dives.
- **Personality**: A clear point of view rooted in engineering depth and terminal ergonomics.
- **Intentional Composition**: Layouts designed around actual content shape, not generic rectangular placeholders.
- **Distinctive Visual Decisions**: Deliberate contrasts, refined borders, and tailored palettes over default templates.
- **Strong Typography**: Expressive display type paired with ultra-readable body and precise monospace stacks.
- **Meaningful Content**: Content that provides direct value, utility, and insight.
- **Human Point of View**: Independent craft by a software creator, not a corporate marketing department.

**Negative Constraints**:
- Do **NOT** add visual novelty merely to look "modern" or "trendy".
- Avoid unmotivated 3D blobs, meaningless gradient meshes, and faux-cyberpunk neon decorations.

---

### Principle 2: Strategic Design Thinking

**Core Concept**  
Always understand **WHY** before deciding **WHAT** to build. Design follows purpose. Every significant page and feature must satisfy a defined strategic canvas.

**Mandatory 7-Point Decision Canvas**:
1. **Purpose**: Why does this page or feature exist?
2. **Audience**: Who is using it (first-time visitor, active developer, support seeker, admin)?
3. **User Problem**: What specific friction, inquiry, or task is being resolved?
4. **Primary Action**: What is the single most important action on the screen?
5. **Secondary Actions**: What supporting tasks are permitted without competing for visual dominance?
6. **Information Hierarchy**: How does the visual weight guide the reader from primary context to fine detail?
7. **Success Criteria**: What clear outcome defines a successful visit?

---

### Principle 3: Organic / Anti-Grid

**Core Concept**  
Use asymmetrical and organic composition where it improves storytelling, visual hierarchy, personality, and editorial pacing.

**Selective Application Matrix**:

| Application Scope | Appropriate Routes & Areas | Layout Strategy |
| :--- | :--- | :--- |
| **Apply Organically** | • Homepage Hero & Spotlight<br>• About Page Storytelling<br>• Featured Work Showcase<br>• Devlog Editorial Headers | • Asymmetric column splits (`1.618fr 1fr`, `2fr 1fr`)<br>• Staggered focal points and alternating anchors<br>• Intentional negative space and breathing room |
| **Strict Structure Required** | • Forms & User Settings<br>• Search & Filter Lists<br>• Support Ticket Threads<br>• Help Guides & Documentation<br>• Admin Data Tables & Metrics | • Predictable grid alignments<br>• Strict tab order and uniform spacing<br>• Optimized for rapid ocular scanning |

---

### Principle 4: Motion Narrative

**Core Concept**  
Motion must communicate something meaningful. Every transition must explain spatial relationships, acknowledge state transitions, or orient user attention.

**Functional Use Cases**:
- **Transitions**: Seamless page entries, layout morphs, and modal dialog reveals.
- **Navigation**: Drawer slides and breadcrumb progressions that orient spatial context.
- **Hierarchy**: Staggered content reveals that guide the reader from main headings to action triggers.
- **Feedback**: Instant tactile acknowledgement on clicks, toggles, and form mutations.
- **Storytelling**: Subtle scroll-driven section introductions in editorial narratives.
- **State Changes**: Expanding accordion guides, tab switching, and toast notifications.

**Negative Constraints**:
- Avoid decorative animation with no functional purpose.
- Never animate layout geometry (`width`, `height`, `margin`, `top`). Animate only compositor properties (`transform`, `opacity`).
- Enforce standard timing tokens: `--duration-fast` (`150ms`), `--duration-normal` (`250ms`), `--duration-slow` (`400ms`).
- Strictly respect `@media (prefers-reduced-motion: reduce)` by disabling non-essential transitions.

---

### Principle 5: Glassmorphism 2.0 (Depth & Restraint)

**Core Concept**  
Use translucent and frosted surfaces selectively. Solid surfaces are the standard foundation; glass is exclusively a depth and hierarchy tool.

**Glass Serves Specific Roles**:
- **Depth**: Creates distinct elevation above scrolling canvases.
- **Hierarchy**: Separates persistent controls (sticky headers, floating drawers) from body content.
- **Layering**: Provides unobtrusive context retention behind modal dialogs and toasts.
- **Emphasis**: Highlights floating action pills and active category badges.

**Negative Constraints**:
- Do **NOT** use glass everywhere.
- Readability and accessibility always win: text on glass must maintain $\ge 4.5:1$ contrast across all scroll positions.
- Never place glass surfaces inside dense Admin data grids, long-form reading wells, or nested layers (glass on glass).

---

### Principle 6: Archival Index

**Core Concept**  
Use structured information presentation for tools, articles, documentation, personal collections, and administrative data.

**Application Across Content Domains**:
- **Apps Catalog**: Structured categories, platform badges (Web, CLI, Desktop), and SemVer tags.
- **Blog Archive**: Chronological index with reading time, category taxonomy, and tag wayfinding.
- **Help Center**: Structured hierarchy (Topic $\rightarrow$ Category $\rightarrow$ Article) with cross-linked solutions.
- **User Library**: Fast, bookmarkable personal collection with favorite toggles and launch history.
- **Search & Metadata**: Unified global search, structured JSON-LD schemas, and dynamic sitemaps.
- **Admin Management**: Clean tables, sorting filters, pagination, and status indicators.

**Visual Rule**: Use strong typography, metadata badges, indexing, and structured cards. Do not reduce every catalog view into a sterile spreadsheet table.

---

### Principle 7: Purposeful Micro-Interactions

**Core Concept**  
Every interactive element must communicate its operational state clearly and immediately across the entire interaction lifecycle:

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

**State Matrix Requirements**:
- **Hover**: Subtle lift (`translateY(-1px)`) and border luminance transition.
- **Focus**: High-visibility 2px focus ring (`ring-2 ring-primary ring-offset-2 ring-offset-zinc-950`).
- **Pressed**: Tactile depression (`scale(0.98)`).
- **Loading**: Inline spinner or pulse indicator; element marked `aria-busy="true"`.
- **Success**: Emerald confirmation badge or checkmark with a temporary timeout.
- **Error**: High-contrast error border with accessible error description.
- **Disabled**: Reduced opacity (`opacity-50`), `cursor-not-allowed`, and pointer events disabled.
- **Selection / Favorite**: Instant toggle state reflection with `aria-pressed` or `aria-selected`.
- **Copy**: Tactile icon swap with "Copied" badge and clipboard fallback.
- **Navigation**: Clean active indicator on current route links (`aria-current="page"`).

**Negative Constraint**: Do not animate interactions merely for decoration.

---

### Principle 8: Accessibility-First

**Core Concept**  
Accessibility is non-negotiable infrastructure. The platform must be completely usable by anyone, on any device, utilizing any assistive technology.

**Mandatory Accessibility Checklist**:
- **Semantic HTML**: Proper landmark elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`), valid heading hierarchy (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`), and native button/link elements.
- **Keyboard Navigation**: 100% of interactive controls reachable via `Tab` and actionable via `Enter` or `Space`.
- **Visible Focus**: Unbroken high-contrast focus rings on all interactive elements.
- **Screen Reader Support**: Meaningful `aria-label`, `aria-expanded`, `aria-haspopup`, and `sr-only` text where icons represent actions.
- **Sufficient Contrast**: Body text $\ge 7:1$ (AAA target); UI components, large text, and borders $\ge 4.5:1$ (AA standard).
- **Accessible Forms**: Explicit `<label>` association with `htmlFor`, inline error feedback linked via `aria-describedby` and `aria-invalid`.
- **Reduced Motion**: Complete collapse of non-essential animations under `@media (prefers-reduced-motion: reduce)`.
- **Touch Usability**: Minimum touch target size of $44 \times 44\text{px}$ on mobile viewports.
- **Responsive Layouts**: Flawless reflow from mobile ($320\text{px}$) to ultra-wide displays ($2560\text{px}$) without horizontal viewport blowout.

---

### Principle 9: AI as Creative & Technical Partner

**Core Concept**  
AI is an implementation accelerator, analyzer, and pair programmer. Human and product judgment remains strictly in control.

**Permitted AI Capabilities**:
- Code implementation, scaffolding, and refactoring.
- TypeScript type inference and static verification.
- Unit and integration test authoring.
- Lint resolution and performance optimization.
- Documentation synthesis and brainstorming.

**Strict Prohibitions**:
- AI must **NOT** invent personal identity, biographical details, or professional history.
- AI must **NOT** fabricate achievements, unsupported claims, fake testimonials, or fake metrics.
- AI must **NOT** introduce hallucinated dependencies or mock architecture into production code.

---

### Principle 10: Performance-First Creativity

**Core Concept**  
Performance is part of the product. Visual excellence must never come at the expense of page speed, accessibility, or battery life.

**Performance Budgets & Architecture**:
- **Server Components First**: React Server Components (RSC) deliver static HTML with zero client JavaScript runtime overhead. Client components (`'use client'`) are strictly confined to interactive leaves.
- **Asset Optimization**: Responsive images served via `next/image` with WebP/AVIF compression and CDN caching.
- **Core Web Vitals Gates**:
  - **LCP** (Largest Contentful Paint) $< 1.2\text{s}$
  - **INP** (Interaction to Next Paint) $< 100\text{ms}$
  - **CLS** (Cumulative Layout Shift) $= 0.00$
  - **TTFB** (Time to First Byte) $< 200\text{ms}$
- **Zero Heavy Bundles**: Code-split routes and bounded database queries ensure fast mobile performance on low-bandwidth connections.

---

## 3. Global Rule: Purpose-Driven Decision Making

```
                   ┌─────────────────────────────────────────┐
                   │ What is the primary purpose of the view?│
                   └────────────────────┬────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   PUBLIC DISCOVERY   │     │     AUTHENTICATED    │     │    ADMINISTRATIVE    │
│   & STORYTELLING     │     │      PRODUCTIVITY    │     │      OPERATIONS      │
├──────────────────────┤     ├──────────────────────┤     ├──────────────────────┤
│ • Asymmetric balance │     │ • High contrast      │     │ • High density       │
│ • Rich typography    │     │ • Solid surfaces     │     │ • Solid surfaces     │
│ • Selective glass    │     │ • Tactile feedback   │     │ • Fast sorting/tables│
│ • Entrance pacing    │     │ • Fast state sync    │     │ • Zero extra motion  │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

> **Golden Rule**: These principles are rules for decision-making. Do not force all 10 principles equally onto every page. Use the principles that best serve the page's purpose.

---

## 4. Governance & Verification Checklist

Every pull request and feature implementation must verify against this compliance checklist:

1. [ ] **Principle 1 (Human-Made)**: Authentic point of view; zero generic AI SaaS styling or unmotivated novelty.
2. [ ] **Principle 2 (Strategic)**: 7-point design canvas established before coding.
3. [ ] **Principle 3 (Organic / Anti-Grid)**: Organic pacing applied to storytelling; structured grids applied to forms/data.
4. [ ] **Principle 4 (Motion)**: Purposeful transitions only; GPU-composited and reduced-motion compliant.
5. [ ] **Principle 5 (Glass 2.0)**: Selective frosted overlays; solid surfaces standard; contrast $\ge 4.5:1$.
6. [ ] **Principle 6 (Archival Index)**: Clear typography, metadata badges, structured lists, and cataloging.
7. [ ] **Principle 7 (Micro-Interactions)**: Full state coverage (hover, focus, pressed, loading, error, success, copy).
8. [ ] **Principle 8 (Accessibility)**: Semantic HTML, sequential headings, visible focus, keyboard navigable, screen reader ready.
9. [ ] **Principle 9 (AI as Partner)**: Zero fabricated personal facts or unsupported claims.
10. [ ] **Principle 10 (Performance)**: RSC-first, zero layout shift, optimized images, minimal client JS.
