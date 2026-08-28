# ElseSourav V2 Monorepo

> Next-Generation Developer Software Platform & Engineering Ecosystem.

---

## 🏗️ Monorepo Architecture

This repository is organized as a modular **Turborepo** monorepo:

### Applications (`apps/`)
- **`apps/web`**: Full-stack web application powered by **Next.js 15 App Router**, React 19, Tailwind CSS, and Server Components. Contains Route Groups for `(public)`, `(auth)`, `(user)`, and `(admin)`.
- **`apps/v1-reference`**: Pristine reference implementation of ElseSourav V1 (React 19, Vite, Firebase).

### Shared Packages (`packages/`)
- **`@elsesourav/types`**: Canonical domain TypeScript models, result types, and shared enums (Zero external dependencies).
- **`@elsesourav/validation`**: Zod runtime validation schemas for Server Actions and API payloads.
- **`@elsesourav/utils`**: Pure functional utility algorithms (URL safety, semver comparison, slug generation, search relevance scoring).
- **`@elsesourav/config`**: Typed environment variables schema, site configuration, and route constants.
- **`@elsesourav/ui`**: Design system component library built with Tailwind CSS & shadcn/ui primitives.
- **`@elsesourav/database`**: PostgreSQL relational database schema and Prisma ORM client.
- **`@elsesourav/auth`**: Supabase Auth client, server cookie helpers, and middleware guards.
- **`@elsesourav/media`**: Cloudinary asset transformation and signed upload handlers.
- **`@elsesourav/testing`**: Shared Vitest, Testing Library, and test fixtures.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Workflows & Commands

```bash
pnpm build        # Build all applications and packages via Turborepo
pnpm typecheck    # Run TypeScript strict checks across all packages
pnpm lint         # Run ESLint across all workspaces
pnpm test         # Run test suites across the monorepo
pnpm format       # Format codebase with Prettier
```

---

## 📚 Documentation
- [V2 Architecture Specification](docs/V2_ARCHITECTURE_SPECIFICATION.md)
- [Architecture Decision Records (ADRs)](docs/V2_ARCHITECTURE_DECISION_RECORDS.md)
