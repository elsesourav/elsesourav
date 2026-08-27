# Developer Workflow & Contribution Guidelines

> **Platform**: ElseSourav  
> **Maintainer**: Sourav Mukherjee  
> **Philosophy**: Lightweight, disciplined, solo-maintainer workflow with zero enterprise bureaucracy.

---

## 1. Branch & Commit Standards

- **Primary Branch**: `main` (represents deployable production code).
- **Commit Formatting**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add screenshot lightbox to mobile app details`
  - `fix: resolve email verification cooldown timer leak`
  - `docs: update deployment and backup runbook`
  - `refactor: standardize timestamp normalization utility`
  - `test: add composite index structure tests`

---

## 2. Pre-Release Quality Gate (Mandatory)

Before pushing any commit to `main` or initiating a production deployment, run the turnkey validation pipeline:

```bash
npm run validate
```

This single command executes:
1. `npm run typecheck`: TypeScript strict typecheck (0 errors allowed).
2. `npm run lint`: ESLint check with zero-`any` policy.
3. `npm run test`: Vitest full test matrix (106 suites, 900+ tests).
4. `npm run build`: Production static bundle compilation + dynamic sitemap generation.

---

## 3. Core Architectural Rules

1. **Zero `any` Policy**:
   - Never use TypeScript `any`.
   - Use strict Zod runtime schemas or explicit union types.
2. **Layered Separation**:
   - UI components never make direct Firestore queries.
   - All database reads/writes flow through `src/services/` and `src/repositories/`.
3. **Safe Area & Responsive Discipline**:
   - All mobile layouts must respect `env(safe-area-inset-*)`.
   - Touch targets must satisfy minimum 44px $\times$ 44px hit bounds.
   - Input font sizes on mobile screens must be $\ge 16\text{px}$ to prevent iOS auto-zoom.
4. **Security Invariants**:
   - Never commit private service accounts, API secrets, or `.env.local` files.
   - All Vite `VITE_*` environment variables are compiled into the client bundle and are considered public.
   - Cloud Firestore security rules (`firestore.rules`) are the authoritative security boundary.
