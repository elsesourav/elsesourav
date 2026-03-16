# ElseSourav Platform

## Product Documentation

ElseSourav is a portfolio-driven developer platform and app marketplace.
It blends public app discovery, personalized user features, and a full admin
control center powered by a microservice architecture.

This document explains what the platform does, how it is structured, what
technologies it uses, and how the major domains work together.

## 1. Product Purpose

ElseSourav is designed to solve three connected problems in one system:

1. Present developer products in a polished, searchable catalog.
2. Provide a user account layer for engagement (library, history, feedback).
3. Give admins full control over catalog merchandising, content, and theme.

Instead of a static portfolio site, the platform behaves as a living product:

- dynamic catalog and merchandising,
- content publishing surfaces,
- analytics-oriented user interactions,
- centralized administrative operations.

## 2. Primary Audience

### Visitors

- Browse apps and categories.
- View app detail pages and platform content.
- Explore blog/help/testimonial/profile content.

### Registered users

- Create account and sign in.
- Save apps to personal library.
- Track usage history and recently viewed records.
- Submit feedback and ratings.

### Admins

- Manage apps, categories, tags, sections, banners, and sliders.
- Moderate feedback and monitor platform-level stats.
- Manage profile, blog, help center, testimonials, and content pages.
- Manage and activate visual themes.

## 3. Core Platform Capabilities

### 3.1 Catalog and Discovery

- Public app listing and app detail pages.
- Category-based organization and tag-based classification.
- Home/store merchandising with:
  - latest/upcoming/featured section items,
  - banner placements,
  - home sliders.

### 3.2 Identity and Access

- Credentials login/register flow.
- Optional GitHub OAuth integration.
- Session-aware role model (`USER`, `ADMIN`).
- Internal service authorization boundary via trusted headers.

### 3.3 User Engagement Domain

- Library (saved apps).
- Download/view tracking and recent history.
- Feedback creation and moderation lifecycle.
- Aggregate + daily stats recalculation support.

### 3.4 Content Domain

- Structured content pages with status/versioning.
- Profile content management.
- Blog domain (tags, posts, comments moderation).
- Help center domain (categories and articles).
- Testimonial management.

### 3.5 Theme and Brand Layer

- Theme config CRUD and activation.
- Centralized visual tokens served to web layout.
- Runtime theme application to the frontend shell.

## 4. System Architecture

The platform is a monorepo with one web app and five backend services.

### 4.1 Top-level structure

- `apps/web`:
  - Next.js web frontend and BFF API layer.
- `services/auth-service`:
  - authentication, account lookup, admin auth stats/users.
- `services/catalog-service`:
  - apps, categories, tags, banners, sections, sliders.
- `services/user-service`:
  - library/history/feedback/tracking/moderation/stats.
- `services/content-service`:
  - profile/blog/help/pages/testimonials.
- `services/theme-service`:
  - theme configs and active theme retrieval.
- `packages/db`, `packages/types`, `packages/validation`, `packages/config`, `packages/cache`:
  - shared contracts and runtime foundations.

### 4.2 Request flow model

1. Browser requests page or calls a web API route.
2. Next.js BFF route validates user/admin session context.
3. BFF proxies request to a target microservice.
4. Service processes domain logic and DB access via Prisma.
5. Response returns in a unified API response shape.

This keeps browser clients isolated from internal service trust headers.

## 5. Technology Stack

### 5.1 Frontend and BFF

- Next.js 16 (App Router)
- React 19
- NextAuth (JWT session strategy)
- TypeScript

### 5.2 Backend Services

- Express 4
- TypeScript
- Shared Zod validation package

### 5.3 Data and Persistence

- PostgreSQL (primary relational store)
- Prisma 7 (schema, migration, client)
- Redis (infrastructure layer; optional by feature path)

### 5.4 Security and Auth

- NextAuth sessions in web layer
- Service-to-service header trust with internal token
- Role-based admin checks (`x-user-role: ADMIN`)
- JWT support in auth service

### 5.5 Tooling and Quality

- npm workspaces monorepo
- Vitest (web tests)
- TypeScript typecheck across workspaces
- Prisma generated-client drift verification script

## 6. Data Domain Overview

High-level domain entities include:

- Identity: users, sessions, accounts, roles, user settings.
- Catalog: apps, categories, app tags, media, links, sliders, store sections,
  banners, aggregate stats, daily stats.
- User interactions: library, download events, view events, feedback,
  moderation metadata, activity logs.
- Content: profile pages, content pages + versions, blog tags/posts/comments,
  help categories/articles + versions, testimonials.
- Theme: theme configs and active theme state.

Prisma schema is the canonical source of truth for relationships and constraints.

## 7. API Domain Map

Service namespaces:

- Auth service: `/v1/auth/*`
- Catalog service: `/v1/catalog/*`, `/v1/admin/catalog/*`
- User service: `/v1/user/*`, `/v1/admin/user/*`
- Content service: `/v1/content/*`, `/v1/admin/content/*`
- Theme service: `/v1/theme/*`, `/v1/admin/theme/*`

Common behavior:

- Service health endpoint: `GET /health`
- Admin namespaces enforce admin-role checks.
- Shared response envelope type in `@elsesourav/types`.

## 8. Security and Trust Boundaries

### Internal trust headers

- `x-internal-token`
- `x-user-role`
- `x-user-id` (when user context is needed)

### Enforcement model

- Catalog/user/content/theme services enforce internal token on `/v1/*`.
- Admin routes additionally require admin role.
- Auth service uses route-level protection for sensitive internal/admin paths.

### Practical boundary

Public clients should call web routes (BFF), not service ports directly.

## 9. User and Admin Experience Map

### User journey

1. Discover apps from home/catalog pages.
2. Open app details and related content.
3. Sign in/register.
4. Save items to library and leave feedback.
5. Review history/recently viewed data.

### Admin journey

1. Sign in with admin role.
2. Use admin dashboard for platform metrics.
3. Manage catalog entities and merchandising surfaces.
4. Moderate feedback and monitor user activity indicators.
5. Publish/manage content and theme states.

## 10. Reliability and Quality Controls

The platform relies on multiple quality layers:

- static typing across apps, packages, and services,
- generated client consistency checks for Prisma,
- test coverage in web utility and BFF proxy contracts,
- health endpoints for runtime service diagnostics.

## 11. Documentation Map

- Root product/system overview: this file.
- Service-level runbook and service details: `services/README.md`.
- Web app-specific notes: `apps/web/README.md`.

## 12. Quick Reference (Minimal)

For development and operational commands, see:

- `services/README.md` for service run and security behavior.
- root `package.json` scripts for workspace-level commands.

This root document intentionally focuses on product and architecture,
not step-by-step local setup runbooks.
