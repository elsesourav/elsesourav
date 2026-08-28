# ElseSourav V2 — Architecture Decision Records (ADRs)

---

## ADR 001: Next.js App Router Monolith for Web & Admin
- **Status**: Accepted
- **Context**: V1 operated as a client-side Vite SPA with separate route guards for public, user, and admin views. V2 requires superior SEO, instant Server-Side Rendering (SSR), native metadata generation, and unified deployment.
- **Decision**: Adopt Next.js 15 App Router (`apps/web`) with route groups `(public)`, `(auth)`, `(user)`, and `(admin)`.
- **Reason**: Consolidates deployment overhead for a solo maintainer while keeping administrative and public concerns cleanly segregated via route group layouts and middleware.
- **Alternatives Considered**:
  - *Separate `apps/web` and `apps/admin` apps*: Adds duplicate deployment pipelines, custom domain routing complexity, and shared cookie synchronization challenges.
  - *Vite SPA + SSR plugin*: Lacks the mature streaming, Server Actions, and ecosystem support of Next.js.
- **Trade-offs**: Admin logic lives in the same repository codebase, requiring strict Next.js middleware and Server Component authorization checks to prevent bundle leakage.

---

## ADR 002: PostgreSQL with Prisma ORM and Supabase
- **Status**: Accepted
- **Context**: V1 used Cloud Firestore NoSQL collections with client-side joins and manual soft-deletion references. Complex queries, composite indexes, and relational integrity required significant boilerplate.
- **Decision**: Adopt PostgreSQL hosted on Supabase, managed through Prisma ORM (`packages/database`).
- **Reason**: Provides rock-solid ACID relational integrity (cascades, foreign keys, unique constraints, compound indexes), type-safe schema migrations, and native SQL performance.
- **Alternatives Considered**:
  - *Drizzle ORM*: Highly performant SQL-like builder, but Prisma provides automatic declarative migrations, rich tooling, and complete TypeScript type generation that aligns perfectly with solo maintainability.
  - *Raw Supabase Client (PostgREST)*: Couples data access to Supabase client API rather than a portable ORM.
- **Trade-offs**: Requires running migration steps (`prisma migrate deploy`) during deployment pipelines.

---

## ADR 003: Supabase Auth for Centralized "One ElseSourav Account"
- **Status**: Accepted
- **Context**: V1 relied on Firebase Authentication client SDK. V2 requires a central identity provider that will power the main web platform, administrative portal, and future ecosystem applications/services under `*.elsesourav.com`.
- **Decision**: Adopt Supabase Auth with `@supabase/ssr` for secure cookie-based session management across Server Components, Server Actions, and Route Handlers.
- **Reason**: Standardizes on OpenID/OAuth2 compliant JWT tokens with native PostgreSQL Row-Level Security (RLS) interoperability.
- **Alternatives Considered**:
  - *NextAuth / Auth.js*: Requires self-managing user tables, session stores, and custom OAuth adapters.
  - *Clerk*: Excellent DX but proprietary, costly at scale, and harder to deeply integrate with custom PostgreSQL schemas.
- **Trade-offs**: Authentication state transitions from client-only listener (`onAuthStateChanged`) to server cookie verification in middleware.

---

## ADR 004: Cloudinary for Managed Media Delivery
- **Status**: Accepted
- **Context**: V1 stored raw external asset URLs. V2 requires automated WebP/AVIF transformations, thumbnail generation, blur placeholder previews, and authenticated asset upload pipelines.
- **Decision**: Adopt Cloudinary with a dedicated server-side signing wrapper in `packages/media`.
- **Reason**: Best-in-class CDN optimization, automatic format delivery (`f_auto,q_auto`), responsive breakpoint sizing, and zero server bandwidth overhead.
- **Alternatives Considered**:
  - *AWS S3 + CloudFront*: Requires custom Lambda@Edge functions for image resizing and thumbnail creation.
  - *Supabase Storage*: Functional, but lacks Cloudinary's advanced dynamic transformation URL parameters and auto-compression algorithms.
- **Trade-offs**: Third-party SaaS dependency; private API keys must be strictly quarantined to server-side code.

---

## ADR 005: Turborepo Monorepo Architecture
- **Status**: Accepted
- **Context**: V2 requires clean architectural boundaries, modular domain logic, and the ability to spin up standalone companion tools or services in the future without duplicating code.
- **Decision**: Structure the repository as a Turborepo monorepo with `apps/` and single-responsibility `packages/`.
- **Reason**: Fast pipeline caching, isolated dependency trees, and enforced architectural dependency rules (e.g., UI cannot import Database directly).
- **Alternatives Considered**:
  - *Polyrepo*: High maintenance overhead, difficult atomic commits, and tedious shared code publishing.
  - *Single monolithic Next.js root*: Fast to start, but easily degrades into tangled folder structures and circular dependencies.
- **Trade-offs**: Requires pnpm workspaces configuration and monorepo build scripting.

---

## ADR 006: Server Components as Default with Pragmatic TanStack Query
- **Status**: Accepted
- **Context**: Overusing client-side data fetching creates bloated JavaScript bundles, layout shifts, and complex loading states. However, certain interactive widgets (e.g., live support chat, instant search suggestions) benefit from client-side caching and background polling.
- **Decision**: Use React Server Components (RSC) and Server Actions by default. Restrict TanStack Query exclusively to client-side optimistic mutations, real-time polling, and interactive stateful widgets.
- **Reason**: Maximizes SEO, minimizes client bundle size, and simplifies data flow while retaining rich client interactivity where genuinely needed.
- **Alternatives Considered**:
  - *TanStack Query everywhere*: Reintroduces client-side waterfall fetching and increases JS bundle payload.
  - *Zero client-state libraries*: Makes optimistic UI updates and live message polling clunky to orchestrate.
- **Trade-offs**: Requires clear mental discipline on when to use Server Components vs. Client Components.
