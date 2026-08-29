# ElseSourav Homepage & Professional Content Strategy

> **Authoritative Specification**: `apps/web/app/page.tsx`, `apps/web/app/(public)/about/page.tsx`, `packages/config/src/site.ts`  
> **Core Principle**: Communicate value before implementation details. *"Why this exists"* comes before *"what technology powers it."*

---

## 1. Homepage Strategic Purpose

The ElseSourav homepage must immediately answer the five universal visitor questions within 5 seconds of scanning:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     HOMEPAGE 5-QUESTION CANVAS                         │
├──────────────────────┬─────────────────────────────────────────────────┤
│ 1. What is it?       │ The personal software platform & lab of Sourav  │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 2. What does it offer│ Thoughtful web software, practical tools, & ideas│
├──────────────────────┼─────────────────────────────────────────────────┤
│ 3. What can I explore│ Standalone developer utilities & deep devlogs   │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 4. Why care?         │ Built for real workflows, speed, & accessibility │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 5. What next?        │ Explore Catalog (/apps) or Read Notes (/blog)   │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## 2. Homepage Content Hierarchy & Layout Blueprint

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HOMEPAGE COMPOSITION                            │
├────────────────────────────────────────────────────────────────────────┤
│ [1. HERO & POSITIONING]                                                │
│ • Creator badge: "Software & Digital Tools by Sourav"                  │
│ • Clear value headline: "Thoughtful software, practical tools..."      │
│ • Concise positioning summary                                          │
│ • Two high-contrast CTAs: [Explore Applications] & [Read Notes]        │
├────────────────────────────────────────────────────────────────────────┤
│ [2. SELECTED APPLICATIONS (WORK)]                                      │
│ • Top 3-6 featured software tools (Terminal, Formatter, Validator)     │
│ • Category badge, short value description, instant launch/details link  │
│ • Browse full catalog CTA                                              │
├────────────────────────────────────────────────────────────────────────┤
│ [3. TECHNICAL WRITING & EXPLORATION]                                   │
│ • Top 3 recent engineering devlogs & architectural post-mortems        │
│ • Reading time, topic category, publication date                       │
│ • Read all articles CTA                                                │
├────────────────────────────────────────────────────────────────────────┤
│ [4. CREATOR CONTEXT & GUIDING PRINCIPLES]                              │
│ • Sourav's personal background & craft philosophy                     │
│ • 6 Core principles (Build for real users, Design with purpose...)     │
│ • Direct link to full /about biography                                 │
├────────────────────────────────────────────────────────────────────────┤
│ [5. PURPOSEFUL FOOTER]                                                 │
│ • Copyright notice, creator attribution, and direct navigation links   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Placement of Technical Information

Technical architecture should be placed where it provides utility to users, not as generic homepage marketing buzzwords:

| Context | Appropriate Technical Depth | Prohibited Content |
| :--- | :--- | :--- |
| **Homepage (`/`)** | High-level value, usability, performance benefits, and direct navigation. | Generic tech-stack cards ("Built with Next.js 15, PostgreSQL, Supabase, RBAC"). |
| **App Detail (`/apps/[slug]`)** | Supported platforms, system requirements, runtime engine, changelogs, architecture notes for that specific tool. | Irrelevant global monorepo implementation details. |
| **About (`/about`)** | Engineering philosophy, personal principles, focus areas, and authentic background. | Fabricated milestones or framework hype. |
| **Blog (`/blog/[slug]`)** | Deep code examples, benchmarks, distributed systems designs, and post-mortems. | Fluffy marketing copy without technical substance. |
| **Help (`/help/*`)** | Task-oriented terminal commands, troubleshooting steps, and installation scripts. | Abstract theory that doesn't solve user problems. |
| **Design System (`/design-system`)**| Semantic tokens, CSS variables, accessibility contrast ratios, component states. | Unimplemented UI ideas. |

---

## 4. About Page Content Strategy

The About page (`/about`) is designed around verified creator identity:

1. **Creator Title & Role**: Software Engineer & Independent Creator (`CREATOR_CONFIG.identity`).
2. **Authentic Biography**: Sourav's personal journey, passion for ergonomics, and rationale behind building ElseSourav.
3. **Guiding Principles**:
   - *Build for real users*
   - *Design with purpose*
   - *Keep interfaces accessible*
   - *Prefer simplicity over unnecessary complexity*
   - *Treat performance as part of the product*
   - *Use technology as a tool, not the identity*
4. **Direct Inquiries & Socials**: Verified links to GitHub, Twitter/X, and the Support Desk.

---

## 5. Application Detail Page Value-First Strategy

When users land on an application page (`/apps/[slug]`), the information flow prioritizes user needs:

1. **Purpose & Problem**: What problem does this tool solve?
2. **Capabilities & Gallery**: Visual screenshots, interactive demo links, and supported OS platforms.
3. **Detailed Documentation**: Rendered via `MarkdownRenderer` with code examples, usage commands, and shortcuts.
4. **Downloads & Installation**: Direct binary download links and package manager commands.
5. **Version History**: SemVer changelogs with explicit feature notes.
