# Services Workspace

This folder contains the first implementation of the microservices rewrite.

## Services

- `auth-service` - credentials auth, JWT issue/verify, user profile lookup.
- `catalog-service` - app listing, section ordering, banners, latest/upcoming behavior.
- `user-service` - bookmarks, history, feedback and moderation APIs.
- `content-service` - dynamic content pages for About and other sections.
- `theme-service` - global color + typography theme configuration.

## Local Run

1. Start infrastructure:

```bash
docker compose up -d
```

2. Install workspace dependencies:

```bash
npm install
```

3. Generate Prisma client and migrate:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Start web and services in separate terminals:

```bash
npm run dev:web
npm run dev:auth
npm run dev:catalog
npm run dev:user
npm run dev:content
npm run dev:theme
```

## Service Security

All service routes under `/v1/*` require `x-internal-token`.
Admin routes also require `x-user-role: ADMIN` and optionally `x-user-id`.
