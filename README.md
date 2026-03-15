# ElseSourav Platform

Microservices-based developer platform and app store with a Next.js BFF web app, service-oriented backend domains, and shared Prisma contracts.

## What This Repo Is

This repository contains a monorepo implementation of:

- A web UI + BFF gateway built with Next.js (App Router)
- Dedicated backend services for auth, catalog, user domain, dynamic content, and theme management
- Shared packages for config, database, validation, types, and caching
- PostgreSQL (primary DB) and Redis (infrastructure)

Current direction is a microservice architecture with centralized service-to-service access control and admin-managed merchandising/content/theme features.

## Architecture Overview

- `apps/web`:
  - Next.js app for public pages and admin UI
  - BFF API routes under `apps/web/src/app/api/*` proxy requests to services
  - NextAuth for user sessions
- `services/auth-service`:
  - credentials login/register
  - JWT/session verification helpers and user admin endpoints
- `services/catalog-service`:
  - app listing/detail
  - admin app/category CRUD
  - sections and banners management
- `services/user-service`:
  - library/bookmarks, download history, feedback
  - admin moderation and user-side tracking endpoints
- `services/content-service`:
  - dynamic pages (About and other CMS-like pages)
- `services/theme-service`:
  - active theme resolution + admin theme config management
- `packages/db`:
  - Prisma schema, Prisma config, seed logic
  - generated Prisma client and db runtime wrapper
- `packages/validation`, `packages/types`, `packages/config`, `packages/cache`:
  - shared contracts and helpers used across apps/services

### Security Model (Internal)

Services mounted under `/v1/*` require internal headers:

- `x-internal-token` for service trust
- `x-user-role: ADMIN` for admin-only endpoints
- optional `x-user-id` for auditing/moderation metadata

The web BFF is responsible for turning user session context into these internal headers.

## Repository Layout

```text
.
├── apps/
│   └── web/
├── services/
│   ├── auth-service/
│   ├── catalog-service/
│   ├── user-service/
│   ├── content-service/
│   └── theme-service/
├── packages/
│   ├── db/
│   ├── validation/
│   ├── types/
│   ├── config/
│   └── cache/
├── scripts/
│   └── verify-prisma-generated.sh
├── .github/workflows/
│   └── prisma-generated-check.yml
├── docker-compose.yml
├── .env.example
└── package.json
```

## Prerequisites

- Node.js `>= 20.19.0` (Prisma 7 requirement)
- npm `>= 10`
- Docker Desktop (for local Postgres + Redis)

## Environment Setup

### 1) Root environment

Copy root env template:

```bash
cp .env.example .env
```

Important values to set:

- `DATABASE_URL`
- `INTERNAL_SERVICE_TOKEN` (minimum 16 chars)
- `AUTH_JWT_SECRET` (minimum 16 chars)
- `NEXTAUTH_SECRET` (minimum 32 chars)
- optional: GitHub OAuth, Cloudinary, Redis, Sentry

### 2) Web app environment

Copy web env template:

```bash
cp apps/web/.env.example apps/web/.env.local
```

If you keep values only in root `.env`, ensure your local tooling loads those when running web.

## Local Development (Full Stack)

### 1) Start infrastructure

```bash
docker compose up -d
```

This starts:

- Postgres on `localhost:5432`
- Redis on `localhost:6379`

### 2) Install dependencies

```bash
npm install
```

### 3) Database initialize

```bash
npm run db:migrate
npm run db:seed
```

Optional:

```bash
npm run db:studio
```

### 4) Start app + services (separate terminals)

```bash
npm run dev:web
npm run dev:auth
npm run dev:catalog
npm run dev:user
npm run dev:content
npm run dev:theme
```

Web app default URL: `http://localhost:3000`

## Service Ports and Base Routes

- Auth service: `http://localhost:4001`
  - health: `/health`
  - API base: `/v1/auth`
- Catalog service: `http://localhost:4002`
  - health: `/health`
  - API bases: `/v1/catalog`, `/v1/admin/catalog`
- User service: `http://localhost:4003`
  - health: `/health`
  - API bases: `/v1/user`, `/v1/admin/user`
- Content service: `http://localhost:4004`
  - health: `/health`
  - API bases: `/v1/content`, `/v1/admin/content`
- Theme service: `http://localhost:4005`
  - health: `/health`
  - API bases: `/v1/theme`, `/v1/admin/theme`

Web/BFF health endpoint:

- `GET /api/health`

## Useful Scripts

### Root scripts

```bash
npm run dev:web
npm run dev:auth
npm run dev:catalog
npm run dev:user
npm run dev:content
npm run dev:theme

npm run lint
npm run typecheck
npm run test
npm run build

npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio

npm run ci:verify-prisma-generated
```

### Web scripts (`apps/web`)

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:watch
npm run build
```

## Testing and Quality

Current baseline checks:

- Type checking across all workspaces
- ESLint on web app
- Vitest smoke tests in web utilities
- Production build verification

Run everything manually:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Prisma and Generated Client Workflow

This repo uses Prisma 7 with:

- schema in `packages/db/prisma/schema.prisma`
- config in `packages/db/prisma.config.ts`
- generated client output in `packages/db/src/generated/prisma`

Generate client manually:

```bash
npm run db:generate
```

A CI workflow verifies generated client drift:

- workflow: `.github/workflows/prisma-generated-check.yml`
- command: `npm run ci:verify-prisma-generated`

## CI Notes

Current CI includes Prisma generated-client verification on:

- pull requests
- pushes to `main`

If you add additional workflows later, keep `npm ci`, `npm run typecheck`, and `npm run build` as standard guards.

## Troubleshooting

### Build fails with NEXTAUTH secret validation

Ensure `NEXTAUTH_SECRET` is set and at least 32 characters.

### Service proxy returns SERVICE_UNAVAILABLE

Likely causes:

- service is not running on expected port
- service URL env vars are wrong
- `INTERNAL_SERVICE_TOKEN` missing/mismatched

### Database connection errors

- verify Docker Postgres is running
- confirm `DATABASE_URL` matches local credentials/db

### Prisma drift check behavior locally

If directory is not a git worktree, `ci:verify-prisma-generated` skips git diff checks by design.

## Production/Deployment Considerations

Before production rollout:

- replace all placeholder secrets
- configure managed Postgres/Redis
- set strict CORS/proxy controls around internal services
- add service-level integration tests and route-level E2E coverage
- add observability (logs/metrics/traces + Sentry DSN)

## Additional Docs

- Service-focused runbook: `services/README.md`
- Web app notes: `apps/web/README.md` (currently generic; can be customized)

---

If you want, I can also rewrite `apps/web/README.md` and `services/README.md` so all docs are consistent with this root README.
