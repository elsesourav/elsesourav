# ElseSourav Repository Baseline & Architectural Audit

> **Document Type**: Foundation Phase Baseline Audit (Prompt 01 of 10)  
> **Status**: Verified Active Baseline  
> **Target Product Identity**: **ElseSourav** (No V1/V2 marketing branding)

---

## 1. Monorepo Architecture Overview

The repository is structured as a modern **Turborepo + pnpm** monorepo with 1 web application and 9 single-responsibility workspace packages:

```
elsesourav/
├── apps/
│   └── web/                   # Next.js 15.1 (App Router, Server Components, Server Actions)
├── packages/
│   ├── auth/                  # Supabase SSR Auth, Session Utilities, Role-Based Guards
│   ├── config/                # SITE_CONFIG, CREATOR_CONFIG, Route Registry, Env Validation
│   ├── database/              # PostgreSQL Client, Prisma 7 ORM, Repositories, Domain Mappers
│   ├── media/                 # Cloudinary Pipeline & CDN URL Transformation Helpers
│   ├── testing/               # Vitest Scenarios, Mock Query Services, Data Factories
│   ├── types/                 # Pure TypeScript Domain Interfaces & Enums
│   ├── ui/                    # 27 Tailwind CSS UI Primitives + MarkdownRenderer + Theme Tokens
│   ├── utils/                 # Sanitization, URL Safety, SemVer, Logging, Rate Limiting
│   └── validation/            # Zod Validation Schemas for Mutations & Input Forms
└── docs/                      # Authoritative Specifications & Decision Records
```

---

## 2. Real Current State Audit

### A. Working Architecture

- **Full-Stack Next.js 15 App Router**: Server-first rendering with React Server Components for public listings and client components for interactive filters and forms.
- **Data Access Layer**: Clean repository pattern in `@elsesourav/database` (`AppRepository`, `BlogRepository`, `HelpRepository`, `SupportRepository`, `UserRepository`, `AuditRepository`, `MediaRepository`, `LibraryRepository`).
- **Security & RBAC**: Zero-trust server-side layout guards (`requireAdmin`, `requireAuth`) protecting `(admin)` and `(user)` routes.
- **Markdown Pipeline**: Universal `MarkdownRenderer` in `@elsesourav/ui` with GFM table support, syntax-highlighted code blocks, copy-to-clipboard, task checklists, and XSS URL sanitization (`isSafeUrl`).

### B. UI Components & Design System (`@elsesourav/ui`)

- **27 Verified Primitives**:
  - _Foundation_: `Button`, `Badge`, `Avatar`, `Separator`
  - _Forms_: `Label`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `FormField`
  - _Surfaces_: `Card`, `GlassSurface`
  - _Feedback_: `Skeleton`, `Spinner`, `Alert`, `EmptyState`, `ErrorState`
  - _Overlays_: `Dialog`, `Drawer`
  - _Navigation_: `Tabs`, `Breadcrumb`, `Pagination`
  - _Data Display & Editing_: `Table`, `StatCard`, `MarkdownRenderer`, `AdminMarkdownEditor`

### C. Theme & Token Architecture

- **Centralized CSS Custom Properties (`globals.css`)**:
  - Semantic Surfaces: `--background`, `--surface`, `--surface-subtle`, `--surface-elevated`, `--surface-overlay`
  - Foreground & Accents: `--foreground`, `--muted-foreground`, `--border`, `--border-subtle`, `--primary`
  - Status Indicators: `--success`, `--warning`, `--error`, `--info`
  - Glass & Motion: `--glass-bg`, `--glass-border`, `--glass-blur`, `--duration-fast`, `--duration-normal`, `--ease-out-smooth`
- **Tailwind Mappings (`tailwind.config.ts`)**: Mapped directly to utility classes with 0 ad-hoc color drift.

---

## 3. Database Baseline Assessment

> **Baseline Directive**: There is no legacy production data that must be preserved. The database serves as a development baseline.

### A. Active Relational Models (16 Models in PostgreSQL)

1. `User` (Authentication, role, preferences, profile)
2. `App` (Catalog software tools, categories, metadata, SemVer versions)
3. `AppLink` (Direct platform download & web links)
4. `AppVersion` (SemVer release history & Markdown changelogs)
5. `Category` (Application taxonomy)
6. `Tag` / `AppTag` (Application search tags)
7. `BlogPost` (Engineering devlogs, Markdown body, metadata)
8. `BlogCategory` (Devlog categories)
9. `BlogTag` / `BlogPostTag` (Devlog tags)
10. `HelpArticle` (Task guides & documentation in Markdown)
11. `HelpCategory` (Documentation categories)
12. `SupportTicket` (Customer inquiry threads)
13. `TicketMessage` (Conversation messages & attachments)
14. `UserLibraryItem` (Personal bookmark launchpad & custom user notes)
15. `AppFeedback` (User reviews & ratings)
16. `Notification` (User notifications)
17. `AuditLog` (Administrative audit trail)
18. `AppStat` (Telemetry views, launches, ratings)

### B. Canonical Storage Rules

- **Canonical Markdown Storage**: `BlogPost.content`, `HelpArticle.content`, `App.description`, and `AppVersion.changelog` store raw plain Markdown.
- **Never Store Rendered HTML**: Storing HTML in database columns is strictly prohibited to guarantee safety and portability.

---

## 4. Product Identity & Version Presentation Rules

- **Universal Public Identity**: **ElseSourav** (Tagline: _Software, Tools & Ideas_).
- **Prohibited Public Branding**: Mentions of "V1", "V2", "Version 1.0", "Version 2.0", "New V2 platform" in public headers, titles, cards, or user onboarding are eliminated.
- **Permitted Technical Usages**: SemVer application release tags (`v1.4.0`) and internal git/turborepo package versions.

---

## 5. Homepage & Professional Content Strategy

- **Value-First Principle**: "Why this exists" comes before "what technology powers it."
- **No Implementation Show-Off**: Framework buzzwords (e.g. Next.js 15, PostgreSQL, Zero-Trust RBAC, client bundle claims) are removed from the public homepage hero.
- **Homepage Structure**:
  1. _Hero_: Identity, positioning, dual calls to action.
  2. _Selected Work_: Featured applications & utilities.
  3. _Writing & Exploration_: Latest engineering articles.
  4. _Creator Context_: Sourav's background and 6 guiding principles.
  5. _Navigation Footer_: Direct links to catalog, blog, docs, about, and support.

---

## 6. Admin Portal Capabilities

- **Admin Markdown Editor**: Live Write/Preview tabs, syntax cheatsheet, and quick snippet toolbar.
- **Lifecycle Actions**: `Save as Draft`, `Publish`, `Archive`, `Delete`.
- **Zero-Trust Security**: Server-side role guards requiring `role === 'ADMIN'` or `role === 'STAFF'`, with crawler indexing disabled (`robots: { index: false, follow: false }`).

---

## 7. Quality & Verification Health

| Quality Gate                 | Status   | Evidence                                 |
| :--------------------------- | :------- | :--------------------------------------- |
| **Prisma Schema**            | **PASS** | Validated via `prisma validate`          |
| **Monorepo Typecheck**       | **PASS** | `0 errors` across all 10 packages        |
| **Unit & Domain Tests**      | **PASS** | `329/329 passing` (41 test suites)       |
| **Next.js Production Build** | **PASS** | `38/38` static & dynamic routes compiled |
