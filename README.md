# ElseSourav — Developer Platform & Software Ecosystem

> **Live Platform**: [https://elsesourav.com](https://elsesourav.com)  
> **Creator & Maintainer**: Sourav Barui ([@elsesourav](https://github.com/elsesourav))  
> **Tagline**: Software, Tools & Ideas  
> **License**: MIT

[![Next.js](https://img.shields.io/badge/Next.js-15.1_App_Router-black.svg?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8_Strict-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444.svg?logo=turborepo)](https://turbo.build/)
[![Prisma](https://img.shields.io/badge/Prisma-7_ORM-2d3748.svg?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)

---

## 1. Overview

**ElseSourav** is a next-generation developer software platform, personal brand, and digital application distribution hub built by independent software creator **Sourav Barui** ([@elsesourav](https://github.com/elsesourav)).

It blends public software discovery, a personalized library for registered users, developer devlogs and updates, an interactive help center, direct ticketing support, and a role-based admin control portal into a single high-performance monorepo powered by **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, and **PostgreSQL**.

### Creator Profile & Connect

- **Creator**: Sourav Barui (Sourav)
- **Role**: Software Engineer & Independent Creator
- **Website**: [elsesourav.com](https://elsesourav.com)
- **GitHub**: [@elsesourav](https://github.com/elsesourav)
- **X / Twitter**: [@elsesourav](https://x.com/elsesourav)
- **LinkedIn**: [linkedin.com/in/elsesourav](https://linkedin.com/in/elsesourav)
- **YouTube**: [@elsesourav](https://www.youtube.com/@elsesourav)
- **Instagram**: [@elsesourav](https://instagram.com/elsesourav)
- **Contact & Support**: [contact@elsesourav.com](mailto:contact@elsesourav.com) · [elsesourav.com/support](https://elsesourav.com/support)

---

## 2. Key Platform Capabilities

- 🚀 **Software Directory & Releases**: Curated application showcase with multi-platform download binaries (macOS, Windows, Linux, Android, iOS), system requirements, version changelogs, and release histories.
- 📚 **Personal Software Library**: Authenticated user bookmarking with cloud synchronization, download tracking, and personal preference persistence.
- 📝 **Developer Updates & Devlogs**: Markdown-rendered technical writings, engineering deep-dives, architecture breakdowns, and product release updates.
- 💡 **Help Center & Knowledge Base**: Interactive documentation portal featuring categorized help guides, helpfulness feedback scoring, and instant search.
- 💬 **Customer Support & Ticketing**: Threaded realtime customer support tickets with priority triage, audit logging, and email notifications.
- 🔒 **Role-Based Admin Portal**: Secure `/admin` command center for catalog management, markdown editors, media uploads, user governance, and security audit logs.
- 🔍 **Instant Search Engine**: Sub-millisecond client and server-side multi-token scoring search across apps, updates, and help documentation.
- 🎨 **Living Design System**: 128+ accessible, high-performance UI components with fluid physics (`@elsesourav/ui/interior`) and playful micro-interactions (`@elsesourav/ui/micro`).

---

## 3. Monorepo Architecture

This repository is managed via **Turborepo** and **pnpm** workspaces:

```
elsesourav/
├── apps/
│   └── web/                         # Full-stack Next.js 15 App Router web application
│       ├── app/
│       │   ├── (public)/            # Apps, Updates, Help, Support, About, Archive, Legal
│       │   ├── (home)/              # Interactive Homepage with 3D Canvas & WebGL shaders
│       │   ├── (auth)/              # Login, Signup, Forgot Password, Reset Password
│       │   ├── (user)/              # User Library, Dashboard, Support Tickets, Settings
│       │   ├── (admin)/             # Admin Dashboard, Catalog Management, CMS, Audit Logs
│       │   └── api/                 # Webhooks, Cloudinary Signatures, Auth & Health Endpoints
│       ├── components/              # View-specific feature components
│       └── features/                # Domain-driven features (apps, blog, admin, support, etc.)
│
├── packages/
│   ├── ui/                          # Official design system & component library (128+ components)
│   │   ├── src/components/          # Core accessible primitives, layouts, forms, surfaces
│   │   ├── src/components/interior/ # 54 Interior.dev fluid physics & tactile components
│   │   └── src/components/micro/    # 34 ReactBits micro-interactions & physics toys
│   ├── database/                    # PostgreSQL Prisma ORM, migrations, seeders, and repositories
│   ├── auth/                        # Supabase Auth client, session cookie handlers, route guards
│   ├── validation/                  # Zod runtime schemas & DTO contracts
│   ├── types/                       # Shared domain TypeScript models, contracts, and Result types
│   ├── config/                      # Typed environment parser, route registry, site & creator metadata
│   ├── media/                       # Cloudinary asset management and upload signature handlers
│   ├── utils/                       # Pure utility algorithms (slugs, semver, search scoring, URL safety)
│   └── testing/                     # Shared Vitest fixtures, test helpers, and integration suites
│
└── docs/                            # Architecture specs, design constitutions, and operational runbooks
```

---

## 4. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19, Server Components |
| **Language** | TypeScript 5.8 (Strict Mode, zero `any`) |
| **Monorepo Engine** | Turborepo, pnpm Workspaces |
| **Styling & Design** | Tailwind CSS 3.4, Vanilla CSS Custom Variables, HSL Design Tokens |
| **Physics & Micro-Interactions** | Motion/React, Matter.js (2D physics), OGL (WebGL shaders), GSAP |
| **Database & ORM** | PostgreSQL, Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| **Authentication** | Supabase Auth with secure SSR session cookies and middleware guards |
| **Validation & Safety** | Zod runtime schema parsing, DOMPurify, URL safety protocols |
| **Media Management** | Cloudinary asset transformation and signed upload picker |
| **Email Delivery** | Resend REST API with automatic Gmail SMTP fallback |
| **Testing** | Vitest, React Testing Library, jsdom |

---

## 5. Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js**: `>= 22.0.0` (`node -v`)
- **Package Manager**: `pnpm >= 9.15.0` (`pnpm -v`)
- **Database**: PostgreSQL 16+ instance (or Docker)

---

## 6. Getting Started & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/elsesourav/elsesourav.git
cd elsesourav
```

### 2. Install Workspace Dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Copy the sample environment configuration:
```bash
cp .env.example .env.local
```
Configure your environment variables:
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/elsesourav"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
RESEND_API_KEY="your-resend-key"
```

### 4. Database Setup & Seeding
```bash
# Push schema or run migrations
pnpm db:push

# Seed development database with baseline taxonomies, apps, and content
pnpm seed
```

### 5. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 7. Workflows & Command Reference

```bash
# Development
pnpm dev              # Start development servers across the workspace with Turborepo
pnpm dev:manual       # Start dev with HMR disabled (for heavy canvas debugging)
pnpm dev:turbo        # Start Next.js with Turbopack

# Quality & Verification
pnpm build            # Build all applications and packages
pnpm typecheck        # Strict TypeScript type check across all workspaces
pnpm lint             # Lint with ESLint 9
pnpm lint:fix         # Fix linting errors automatically
pnpm format           # Format code and markdown via Prettier & ESLint
pnpm format:check     # Check formatting without writing

# Testing
pnpm test             # Run Vitest test suites across the monorepo

# Database
pnpm db:migrate       # Apply pending Prisma migrations
pnpm db:generate      # Regenerate Prisma client from schema.prisma
pnpm db:push          # Push schema directly to database (development)
pnpm seed             # Run database seed scripts
pnpm admin:create     # Bootstrap initial administrator account
```

---

## 8. UI & Design System Guidelines

All user interface development adheres to strict design and maintainability principles:

- **UI Development Workflow**: Consult [`docs/UI_DEVELOPMENT_WORKFLOW.md`](docs/UI_DEVELOPMENT_WORKFLOW.md) and [`packages/ui/README.md`](packages/ui/README.md) before building UI components.
- **500-Line Limit**: Every UI component file is strictly kept under 500 lines of code.
- **Accessibility First**: WCAG 2.1 AA compliant contrast, full keyboard navigation, and reduced-motion overrides.
- **Subpath Cleanliness**:
  - `@elsesourav/ui`: Core accessible primitives and layouts.
  - `@elsesourav/ui/interior`: 54 fluid physics components.
  - `@elsesourav/ui/micro`: 34 micro-interactions.

---

## 9. Comprehensive Documentation Sitemap

| Document | Purpose |
| :--- | :--- |
| [`docs/V2_ARCHITECTURE_SPECIFICATION.md`](docs/V2_ARCHITECTURE_SPECIFICATION.md) | V2 Technical architecture specification, domain boundaries, and workspace contracts |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architectural layers, data flow patterns, and service responsibilities |
| [`docs/UI_DEVELOPMENT_WORKFLOW.md`](docs/UI_DEVELOPMENT_WORKFLOW.md) | Mandatory UI development workflow, workspace guide, and component navigation |
| [`packages/ui/README.md`](packages/ui/README.md) | Comprehensive 128+ component guide, props documentation, and physics catalog |
| [`docs/design/DESIGN_CONSTITUTION.md`](docs/design/DESIGN_CONSTITUTION.md) | Foundational design rules, aesthetic principles, typography, and motion standards |
| [`docs/design/THEME_TOKEN_ARCHITECTURE.md`](docs/design/THEME_TOKEN_ARCHITECTURE.md) | Semantic color token architecture, HSL CSS variables, and surface matrix |
| [`docs/V2_DATABASE_SPECIFICATION.md`](docs/V2_DATABASE_SPECIFICATION.md) | Database schema specification, indexes, and referential constraints |
| [`docs/DEPLOYMENT_AND_OPERATIONS.md`](docs/DEPLOYMENT_AND_OPERATIONS.md) | Production hosting headers, security policies, edge CDN rules, and rollbacks |
| [`docs/DISASTER_RECOVERY_AND_RUNBOOK.md`](docs/DISASTER_RECOVERY_AND_RUNBOOK.md) | Incident response, backup schedules, recovery procedures, and health runbooks |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Diagnostic runbook for local development, auth, databases, and build errors |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Contributor guidelines, code standards, and PR workflows |
| [`docs/RELEASE_PROCESS.md`](docs/RELEASE_PROCESS.md) | Version bumping, semver release pipeline, and changelog updates |
