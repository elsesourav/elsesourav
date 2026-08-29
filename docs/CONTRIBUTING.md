# Developer Workflow & Contribution Guidelines

> **Platform**: ElseSourav  
> **Maintainer**: Sourav  
> **Philosophy**: Lightweight, disciplined, high-craft developer platform with zero enterprise bureaucracy.

---

## 1. Branch & Commit Standards

- **Primary Branch**: `main` (represents deployable production code).
- **Commit Formatting**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(apps): add screenshot lightbox to mobile app details`
  - `fix(auth): resolve session refresh cookie sync in middleware`
  - `docs(design): update design constitution and token guides`
  - `refactor(database): standardize repository query methods`
  - `test(ui): add component state matrix tests`

---

## 2. Pre-Release Quality Gate (Mandatory)

Before pushing any commit to `main` or initiating a production deployment, run the validation pipeline:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

This ensures:

1. `pnpm typecheck`: TypeScript strict typecheck (0 errors allowed).
2. `pnpm lint`: ESLint check with zero warnings.
3. `pnpm test`: Vitest full test matrix across all 9 packages.
4. `pnpm build`: Next.js 15 production build compilation.

---

## 3. Core Architectural Rules

1. **Zero `any` Policy**:
   - Never use TypeScript `any`.
   - Use strict Zod runtime schemas in `@elsesourav/validation` or explicit types in `@elsesourav/types`.
2. **Layered Separation**:
   - UI components never make direct database queries.
   - All server mutations flow through Server Actions and Domain Services (`@elsesourav/database`).
3. **Responsive Discipline**:
   - Touch targets must satisfy minimum 44px $\times$ 44px hit bounds.
   - All public pages must be responsive across mobile, tablet, and desktop viewports.
4. **Security Invariants**:
   - Never commit private service accounts, API secrets, or `.env.local` files.
   - Database operations are strictly secured by server-side guards (`requireAdmin`, `requireAuth`).
   - Direct database access is restricted to server-side code using Prisma ORM.
