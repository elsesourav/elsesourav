# ElseSourav V2 — Technical Architecture Specification

---

## 1. Monorepo Structure & Workspace Boundaries

```
elsesourav/
├── apps/
│   └── web/                         # Unified Next.js 15 App Router Application
│       ├── app/
│       │   ├── (public)/            # Homepage, Apps, Blog, Help, Support, About, Legal
│       │   ├── (auth)/              # Login, Signup, Forgot Password, Reset
│       │   ├── (user)/              # Personal Library, Settings, Tickets
│       │   ├── (admin)/             # Admin Dashboard, CMS, Analytics, Audit Trail
│       │   └── api/                 # Webhooks, Cloudinary Signatures, Health Endpoints
│       ├── components/              # View-specific feature components
│       ├── hooks/                   # React hooks
│       ├── public/                  # Static assets, favicon, manifest.json
│       ├── next.config.ts           # Next.js configuration
│       └── package.json
│
├── packages/
│   ├── ui/                          # Shared Design System (Tailwind CSS + shadcn/ui primitives)
│   │   ├── components/              # Buttons, Cards, Dialogs, Tables, Dropdowns, Inputs
│   │   ├── styles/                  # Tailwind presets, glassmorphism tokens, CSS variables
│   │   └── package.json
│   │
│   ├── database/                    # Database ORM, Prisma Client, Migrations, Repositories
│   │   ├── prisma/                  # schema.prisma, migrations, seeds
│   │   ├── src/                     # Repositories (AppRepo, UserRepo, BlogRepo, etc.)
│   │   └── package.json
│   │
│   ├── auth/                        # Supabase Auth Client, Server Session Helpers, Middleware
│   │   ├── src/                     # auth-client.ts, auth-server.ts, middleware-guard.ts
│   │   └── package.json
│   │
│   ├── validation/                  # Zod runtime schemas & DTO contracts
│   │   ├── src/                     # app.schema.ts, user.schema.ts, blog.schema.ts, etc.
│   │   └── package.json
│   │
│   ├── types/                       # Shared domain TypeScript definitions
│   │   ├── src/                     # app.types.ts, user.types.ts, result.types.ts, etc.
│   │   └── package.json
│   │
│   ├── media/                       # Cloudinary upload signatures & transformation helpers
│   │   ├── src/                     # cloudinary-client.ts, image-url.ts, upload-sign.ts
│   │   └── package.json
│   │
│   ├── utils/                       # Pure utility functions (zero external dependencies)
│   │   ├── src/                     # url-safety.ts, semver.ts, slug.ts, search-score.ts
│   │   └── package.json
│   │
│   ├── config/                      # Typed environment parser & constant defaults
│   │   ├── src/                     # env.ts, site.ts, routes.ts
│   │   └── package.json
│   │
│   └── testing/                     # Shared Vitest & Playwright fixtures and test utilities
│       ├── src/                     # test-helpers.tsx, mocks, fixtures
│       └── package.json
│
├── turbo.json                       # Turborepo task pipeline configuration
├── pnpm-workspace.yaml              # Workspace package definitions
└── package.json                     # Monorepo root scripts & devDependencies
```

---

## 2. Layered Data-Flow Rules & Boundaries

```
[ Browser / Client Component ]
            │ (User Action / Form Submission)
            ▼
[ Next.js Server Boundary (Server Action / Route Handler) ]
            │ (Zod Validation with @elsesourav/validation)
            ▼
[ Domain Service Layer (@elsesourav/database or apps/web/services) ]
            │ (Business Invariants & Security Logic)
            ▼
[ Repository Layer (@elsesourav/database/repositories) ]
            │ (Prisma Query Builder)
            ▼
[ Prisma Client ORM ]
            │ (Parameterized SQL)
            ▼
[ PostgreSQL Database (Supabase) ]
```

### Strict Architectural Invariants:

1. **No Direct Database Access in UI**: UI components (`apps/web/app/**`) MUST NOT import `@prisma/client` or initialize database connections.
2. **Server-Only Secrets**: Cloudinary API Secret, Supabase Service Role Key, and PostgreSQL `DATABASE_URL` are strictly forbidden from having `NEXT_PUBLIC_` prefixes.
3. **Zero `any`**: TypeScript strict compilation enforced across all packages (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`).

---

## 3. Server vs. Client Component Rules

| Category                    | Default Paradigm      | Examples                                            | When to Use Client (`'use client'`)                             |
| :-------------------------- | :-------------------- | :-------------------------------------------------- | :-------------------------------------------------------------- |
| **Catalog & Showcase**      | Server Component      | `HomePage`, `AppsPage`, `AppDetailPage`, `BlogPage` | Instant filter dropdowns, search inputs, modal triggers         |
| **Markdown Content**        | Server Component      | `BlogPostPage`, `HelpArticlePage`                   | Interactive syntax copying, helpfulness rating button           |
| **Authentication Forms**    | Client Component      | `LoginForm`, `SignUpForm`, `ForgotPasswordForm`     | Form state, client-side validation errors, OAuth redirects      |
| **Interactive Modals**      | Client Component      | `GlobalSearchModal`, `LivePreviewModal`             | Keyboard shortcuts (`Cmd+K`), focus trapping                    |
| **Admin Management Tables** | Server / Client Split | Server loads data; Client manages sort/pagination   | Batch action selectors, inline status toggles, deletion dialogs |
| **Live Support Chat**       | Client Component      | `SupportThreadLive`                                 | Real-time websocket subscriptions / polling updates             |

---

## 4. TanStack Query Usage Policy

- **DO NOT USE TanStack Query for**:
  - Initial page loads (Home, Apps catalog, Devlog articles, Help Center).
  - Standard CRUD form submissions (handled directly via Server Actions + `revalidatePath`).
  - Read-heavy administrative views that can be server-rendered.
- **DO USE TanStack Query for**:
  - Live interactive widgets with rapid client-side mutations (e.g., Live Support ticket message threads).
  - Background polling where real-time socket connections are unavailable.
  - Multi-step interactive client workflows requiring optimistic cache rollback.

---

## 5. Naming Standards & File Conventions

| Entity               | Convention                      | Example                                            |
| :------------------- | :------------------------------ | :------------------------------------------------- |
| **Folder Names**     | kebab-case                      | `app-details/`, `support-tickets/`                 |
| **Component Files**  | PascalCase                      | `AppCard.tsx`, `HeroShowcase.tsx`                  |
| **Hook Files**       | camelCase with `use` prefix     | `useDebounce.ts`, `useTheme.ts`                    |
| **Service Files**    | camelCase with `.service.ts`    | `app.service.ts`, `support.service.ts`             |
| **Repository Files** | camelCase with `.repository.ts` | `app.repository.ts`, `user.repository.ts`          |
| **Schema Files**     | camelCase with `.schema.ts`     | `app.schema.ts`, `auth.schema.ts`                  |
| **Type Files**       | camelCase with `.types.ts`      | `app.types.ts`, `user.types.ts`                    |
| **Server Actions**   | camelCase with `.action.ts`     | `publish-app.action.ts`, `create-ticket.action.ts` |
| **Unit Test Files**  | camelCase with `.test.ts(x)`    | `search-score.test.ts`, `AppCard.test.tsx`         |
| **E2E Test Files**   | kebab-case with `.spec.ts`      | `public-discovery.spec.ts`, `auth-flow.spec.ts`    |

---

## 6. Dependency & Import Rules Matrix

```
┌────────────────────────────────────────────────────────┐
│                   Import Allowed Matrix                │
├───────────────────┬────────────────────────────────────┤
│ Package / Layer   │ May Import From                    │
├───────────────────┼────────────────────────────────────┤
│ apps/web (UI)     │ @elsesourav/{ui, types, validation,│
│                   │              utils, config, auth}  │
├───────────────────┼────────────────────────────────────┤
│ packages/ui       │ @elsesourav/{types, utils}         │
├───────────────────┼────────────────────────────────────┤
│ packages/database │ @elsesourav/{types, validation,    │
│                   │              utils, config}        │
├───────────────────┼────────────────────────────────────┤
│ packages/auth     │ @elsesourav/{types, config}        │
├───────────────────┼────────────────────────────────────┤
│ packages/media    │ @elsesourav/{types, config, utils} │
├───────────────────┼────────────────────────────────────┤
│ packages/validation│ @elsesourav/{types}               │
├───────────────────┼────────────────────────────────────┤
│ packages/types    │ (Zero internal dependencies)       │
└───────────────────┴────────────────────────────────────┘
```

_Violations of this dependency matrix will be blocked via ESLint `no-restricted-imports` rules._
