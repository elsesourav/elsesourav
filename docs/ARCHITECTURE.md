# ElseSourav Platform System Architecture & Design

> **Platform**: ElseSourav  
> **Maintainer**: Sourav Mukherjee  
> **Core Stack**: React 19, TypeScript 5.8 (Strict), Vite 6, Firebase v12 (Auth & Firestore), Capacitor 8

---

## 1. System Overview & Layer Responsibilities

ElseSourav is designed as a secure, high-performance static Single Page Application (SPA) with zero custom backend infrastructure, leveraging **Cloud Firestore** and **Firebase Authentication** as its managed serverless backend.

```
┌───────────────────────────────────────────────────────────┐
│                      UI Presentation Layer                │
│   Pages (src/pages/) & Atomic Components (src/components/) │
└─────────────────────────────┬─────────────────────────────┘
                              │ Custom Hooks & Action Handlers
                              ▼
┌───────────────────────────────────────────────────────────┐
│                     Domain Service Layer                  │
│  Business logic, caching, sanitization (src/services/)    │
└─────────────────────────────┬─────────────────────────────┘
                              │ Result<T, E> & Zod Schemas
                              ▼
┌───────────────────────────────────────────────────────────┐
│                   Data Repository Layer                   │
│   Firestore query builders & deserializers (src/repositories)│
└─────────────────────────────┬─────────────────────────────┘
                              │ Strongly-typed Firestore Queries
                              ▼
┌───────────────────────────────────────────────────────────┐
│             Google Firebase Managed Cloud Services        │
│   Cloud Firestore (NoSQL Database) & Firebase Authentication│
└───────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Modular Structure

```
src/
├── app/            # Application entrypoint, React router, context providers hierarchy
├── assets/         # Optimized vector assets and brand illustrations
├── components/     # Reusable UI component library (Button, Modal, Toast, Input, GlassCard)
│   ├── admin/      # Specialized admin data tables, editors, and metric cards
│   ├── apps/       # App cards, platform badges, download buttons, screenshot gallery
│   ├── blog/       # Blog post cards, reading progress, markdown renderers
│   ├── help/       # Knowledge base categories, helpfulness voting widgets
│   ├── layout/     # App shell, responsive header, mobile navigation drawer, footer
│   └── support/    # Threaded ticket conversation, message composer
├── config/         # Strongly-typed environment variables, app constants, releases, seed data
├── context/        # React context providers (AuthContext, ThemeContext, ToastContext)
├── hooks/          # Domain-agnostic custom React hooks (useSearch, useDebounce, useMediaQuery)
├── pages/          # Route-level page components (Lazy-loaded for code splitting)
│   ├── admin/      # Admin dashboard, app editor, blog editor, support triage, audit logs
│   └── public/     # Showcase, App details, Blog, Help center, Settings, Auth pages
├── repositories/   # Abstract repository contracts and Firestore data access layer
├── routes/         # Central route manifest and authentication route guards
├── schemas/        # Zod validation schemas for all domain entities, forms, and DTOs
├── services/       # Domain business logic services (AppService, AuthService, SearchService)
├── styles/         # Global design tokens (colors, typography, glassmorphism, safe areas)
├── tests/          # Vitest test suites, component tests, security scenarios, mocks
├── types/          # Authoritative TypeScript domain models and readonly interfaces
└── utils/          # Pure utility helpers (timestamp normalization, URL safety, SEO)
```

---

## 3. State Management & Authentication Flow

### A. State Architecture

- **Global Contexts**: Lightweight React Contexts manage global, long-lived UI state:
  - `AuthContext`: Tracks current Firebase Auth state, profile claims, and admin role status.
  - `ThemeContext`: Controls light/dark/system theme tokens.
  - `ToastContext`: Dispatches non-blocking notifications.
- **Local State**: Page-level data fetching uses standard React hooks (`useState`, `useEffect`) with graceful loading skeletons and error boundaries.

### B. Authentication & Session Continuity

- Firebase Web SDK manages token refreshes and persists user sessions in the browser's **IndexedDB**.
- Client credentials and passwords never touch application code.
- Protected routes evaluate authorization state through route guards:
  - `<UserRouteGuard />`: Redirects unauthenticated users to `/login` with redirect retention.
  - `<AdminRouteGuard />`: Restricts `/admin/*` routes to verified accounts with `"role": "admin"`.

---

## 4. Public Content vs. Private User Data Isolation

The platform enforces clear physical and logical boundaries:

- **Public Catalog Data**: Applications, release metadata, blog devlogs, and knowledge base articles are world-readable when `status == "published"`.
- **Private User Data**: User profiles (`/users/{uid}`), software library bookmarks (`/libraries`), notifications, and support tickets are isolated so that users can only read and write their own data (`request.auth.uid == resource.data.userId`).
- **Security Audit Logs**: Administrative audit logs and analytics events are strictly unreadable by regular users and publicly restricted by Firestore rules.

---

## 5. Instant Client-Side Search Engine Architecture

Search across applications, blog articles, and help guides is powered by a high-efficiency client-side search engine ([`src/services/app-search.service.ts`](file:///Users/sourav/Developer/WEB/elsesourav/src/services/app-search.service.ts), [`src/services/global-search.service.ts`](file:///Users/sourav/Developer/WEB/elsesourav/src/services/global-search.service.ts)):

- **Multi-Field Tokenization**: Tokenizes search terms against name, description, tags, and category.
- **Weighted Relevance Scoring**:
  - Exact Title match: $+100$ points
  - Title prefix match: $+50$ points
  - Primary category match: $+30$ points
  - Tag match: $+25$ points
  - Description substring: $+10$ points
- **Performance**: Instant ($<2\text{ms}$) in-memory scoring without costly backend network roundtrips.

---

## 6. Code Splitting & Performance Optimizations

1. **Route-Based Lazy Loading**: All route views (especially the large `/admin` management suite and markdown editors) are dynamically imported via `React.lazy()`.
2. **Immutable Asset Caching**: Static assets in `dist/assets/` carry unique content hashes and are served with `Cache-Control: max-age=31536000, immutable`.
3. **Core Bundle Size**: Initial public app shell bundle is lightweight (~136 kB gzipped).
