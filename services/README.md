# Services Workspace

This folder contains the backend microservices used by the web application.
Each service is an Express app, uses the shared packages in `packages/*`, and
follows a request-id based response pattern.

## Architecture Overview

Services in this workspace:

- `auth-service` (default `:4001`)
  - Authentication, JWT issue/verify, user lookup, admin user stats/list.
  - Mounted base path: `/v1/auth`.
- `catalog-service` (default `:4002`)
  - App catalog data, categories, tags, store sections/banners, sliders.
  - Mounted base paths: `/v1/catalog` (public), `/v1/admin/catalog` (admin).
- `user-service` (default `:4003`)
  - Library, history, feedback, views/download tracking, moderation/stats.
  - Mounted base paths: `/v1/user` (user), `/v1/admin/user` (admin).
- `content-service` (default `:4004`)
  - CMS-like content: profile, blog, help center, testimonials, content pages.
  - Mounted base paths: `/v1/content` (public), `/v1/admin/content` (admin).
- `theme-service` (default `:4005`)
  - Theme configuration (active/public theme + admin theme management).
  - Mounted base paths: `/v1/theme` (public), `/v1/admin/theme` (admin).

Health route available on all services:

- `GET /health`

## Repository Prerequisites

- Node.js and npm compatible with workspace dependencies.
- Docker (for local Postgres + Redis).
- `.env` in repo root with required variables (at minimum DB + internal token).

The workspace scripts source `.env` automatically for DB commands and web dev.

## Local Infrastructure

Start backing services from repo root:

```bash
docker compose up -d
```

Current `docker-compose.yml` starts:

- PostgreSQL 16 on `localhost:5432`
- Redis 7 on `localhost:6379`

Stop and clean up:

```bash
docker compose down
```

## Install And Prepare Database

From repo root:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Useful extras:

```bash
npm run db:studio
```

## Run Services

From repo root, run everything in one terminal:

```bash
npm run dev:services
```

Or run each service manually in separate terminals:

```bash
npm run dev:auth
npm run dev:catalog
npm run dev:user
npm run dev:content
npm run dev:theme
```

Run web app separately:

```bash
npm run dev:web
```

## Scripts Per Service

Each service workspace supports:

- `npm run dev` (watch mode via `tsx watch src/index.ts`)
- `npm run start` (single run)
- `npm run typecheck` (`tsc --noEmit`)

## Environment Variables

Commonly used service-related variables (from `packages/config/src/env.ts`):

- `INTERNAL_SERVICE_TOKEN` (shared service-to-service secret)
- `AUTH_JWT_SECRET`
- `AUTH_SERVICE_URL`, `CATALOG_SERVICE_URL`, `USER_SERVICE_URL`, `CONTENT_SERVICE_URL`, `THEME_SERVICE_URL`
- `AUTH_SERVICE_PORT`, `CATALOG_SERVICE_PORT`, `USER_SERVICE_PORT`, `CONTENT_SERVICE_PORT`, `THEME_SERVICE_PORT`
- `DATABASE_URL`

If service URLs/ports are not set, defaults are used:

- auth: `http://localhost:4001`
- catalog: `http://localhost:4002`
- user: `http://localhost:4003`
- content: `http://localhost:4004`
- theme: `http://localhost:4005`

## Security Model

### Internal token

- `catalog-service`, `user-service`, `content-service`, and `theme-service`
  apply `requireInternalToken` on `/v1/*`.
- Requests must include:
  - `x-internal-token: <INTERNAL_SERVICE_TOKEN>`

### Admin authorization

Admin namespaces require role header:

- `x-user-role: ADMIN`

Some admin/user actions also rely on:

- `x-user-id: <cuid>`

### Auth service note

`auth-service` does not apply a global `/v1/*` middleware. It enforces internal
token/admin checks at route level for protected endpoints (for example,
admin/user internal operations) while login/register/session routes are handled
according to their endpoint logic.

## Request Headers Used Across Services

In addition to auth headers, services commonly consume:

- `x-request-id` for trace correlation
- `x-forwarded-for`, `x-real-ip`, `user-agent` for tracking/audit contexts

## API Route Namespaces

High-level route groups:

- `auth-service`: `/v1/auth/*`
  - register/login/session verify/oauth sync/admin users+stats
- `catalog-service`: `/v1/catalog/*`, `/v1/admin/catalog/*`
  - public listing/details + admin CRUD/stats/tags/sliders/sections/banners
- `user-service`: `/v1/user/*`, `/v1/admin/user/*`
  - library/history/recent views/feedback + admin moderation and stats
- `content-service`: `/v1/content/*`, `/v1/admin/content/*`
  - public profile/blog/help/testimonials/pages + full admin content management
- `theme-service`: `/v1/theme/*`, `/v1/admin/theme/*`
  - active theme + admin config management and activation

## Testing And Verification

From repo root:

```bash
npm run typecheck
npm run test
npm run lint
```

Service-only typecheck examples:

```bash
npm run typecheck --workspace @elsesourav/auth-service
npm run typecheck --workspace @elsesourav/catalog-service
npm run typecheck --workspace @elsesourav/user-service
npm run typecheck --workspace @elsesourav/content-service
npm run typecheck --workspace @elsesourav/theme-service
```

## Quick Health Checks

```bash
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:4004/health
curl http://localhost:4005/health
```

## Troubleshooting

- `SERVER_MISCONFIGURED` about internal token:
  - Ensure `INTERNAL_SERVICE_TOKEN` exists in `.env` and is loaded.
- DB errors on service startup:
  - Check Postgres container is running and `DATABASE_URL` is valid.
- 403 on admin endpoints:
  - Confirm both `x-internal-token` and `x-user-role: ADMIN` are sent.
- Type errors after schema updates:
  - Run `npm run db:generate` then `npm run typecheck`.
