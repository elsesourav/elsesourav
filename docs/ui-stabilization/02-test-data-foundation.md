# UI Stabilization Phase — 02: Test-Data Foundation & Scenarios

**Project**: ElseSourav Monorepo V2  
**Package**: `@elsesourav/testing`  
**Date**: August 29, 2026  
**Status**: COMPLETE — READY FOR UI DATA-BINDING VALIDATION

---

## 1. Test-Data Architecture Overview

The test-data foundation is organized into four modular layers in [`packages/testing/src/`](file:///Users/sourav/Developer/WEB/elsesourav/packages/testing/src/):

```text
packages/testing/src/
├── factories/              # Factory functions with customizable overrides
│   ├── user.factory.ts     # User, Profile, AdminListItem generators
│   ├── app.factory.ts      # App, AppListItem, PublicApp, AppLink, AppVersion
│   ├── blog.factory.ts     # BlogPost, BlogPostListItem, Category, Tag
│   ├── help.factory.ts     # HelpArticle, HelpCategory generators
│   ├── support.factory.ts  # SupportTicket, SupportTicketMessage, ListItem
│   ├── library.factory.ts  # UserLibraryItem generator
│   ├── notification.factory.ts # NotificationItem generator
│   ├── media.factory.ts    # MediaAsset mock generator
│   ├── audit.factory.ts    # AuditLog entry generator
│   └── index.ts            # Centralized export & resetAllFactoryCounters()
├── fixtures/               # Stable, predefined, deterministic fixtures
│   ├── users.fixtures.ts   # Standard, Admin, Staff, Suspended, Minimal users
│   ├── apps.fixtures.ts    # 5 Live dev tools, Draft app, Archived app
│   ├── blog.fixtures.ts    # 3 Technical devlogs, Draft post
│   ├── help.fixtures.ts    # 3 Documentation guides across 3 categories
│   ├── support.fixtures.ts # Open, High Priority w/ attachment, Resolved tickets
│   ├── library.fixtures.ts # Pinned, Favorite, Standard bookmark items
│   ├── notifications.fixtures.ts # App update, Ticket reply, Read system alerts
│   ├── media.fixtures.ts   # Mock Cloudinary image assets
│   ├── audit.fixtures.ts   # Security & mutation audit logs
│   ├── edge-cases.fixtures.ts # 255+ char strings, Unicode, zero stats, 12-turn chats
│   └── index.ts
├── scenarios/              # Page-level datasets for testing components in context
│   ├── public-home.scenario.ts     # Homepage data (apps + blog posts)
│   ├── apps-catalog.scenario.ts    # Empty, populated (5), paginated (30 items)
│   ├── blog-catalog.scenario.ts    # Empty and populated blog listings
│   ├── help-center.scenario.ts     # Help categories and nested guide links
│   ├── user-dashboard.scenario.ts  # Empty and populated user hub
│   ├── support-desk.scenario.ts    # Empty, single open, and multi-ticket desk
│   ├── admin-control.scenario.ts   # Full administrative telemetry & queues
│   └── index.ts
└── utils/                  # Deterministic PRNG & Mock Query Layer
    ├── deterministic-seed.ts # Mulberry32 PRNG with reproducible sequence
    ├── mock-query-service.ts # Client/Server component query simulation
    └── index.ts
```

---

## 2. Factory Usage & Custom Overrides

Factories provide full TypeScript type safety matching `@elsesourav/types` and allow targeted field overrides:

```typescript
import {
  createApp,
  createUser,
  createSupportTicket,
  createTicketMessage,
} from '@elsesourav/testing';

// Create a custom app with specific tags
const customApp = createApp({
  name: 'Custom Profiler',
  primaryCategory: 'Performance',
  tags: ['cpu', 'profiling'],
});

// Create a user with specific preferences
const customUser = createUser({
  displayName: 'Jordan Miller',
  role: 'STAFF',
  preferences: { theme: 'light', reduceMotion: true, emailNotifications: false, compactView: true },
});

// Create a ticket with multi-turn message history
const customTicket = createSupportTicket({
  subject: 'Custom Diagnostics',
  priority: 'high',
  messages: [
    createTicketMessage({ senderRole: 'USER', message: 'First question' }),
    createTicketMessage({ senderRole: 'STAFF', message: 'Staff solution' }),
  ],
});
```

---

## 3. UI Scenarios Mapped to Prompt 01 Problem Inventory

| Prompt 01 Audit Area        | Test Scenario / Fixture                              | Verification Objective                                                           |
| :-------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Catalog Empty States**    | `createEmptyAppsCatalogScenario()`                   | Verifies `AppsEmptyState` renders with filter reset action                       |
| **Catalog Pagination**      | `createLargePaginatedAppsCatalogScenario(30, 2, 12)` | Verifies `AppPagination` displays correct pages (3 pages) & next/prev navigation |
| **Long Text & Truncation**  | `fixtureLongTextApp`                                 | Validates `line-clamp-2` and card boundary wrapping on 320px/375px screens       |
| **Zero-State Metrics**      | `fixtureZeroStatsApp`                                | Validates default badge rendering when views/ratings are 0                       |
| **Unicode & Special Chars** | `fixtureUnicodeUser`, `fixtureLongTextApp`           | Tests UTF-8, umlauts, emojis, and international script rendering                 |
| **Multi-Turn Chat History** | `fixtureMultiTurnTicket`                             | Verifies timeline scroll container with 12 messages and internal staff notes     |
| **Library Management**      | `createActiveUserDashboardScenario()`                | Tests pinned bookmark badges and favorite action toggles                         |
| **Notification Center**     | `fixtureNotificationsList`                           | Verifies unread counter (2 unread) and mark-as-read optimistic UI                |

---

## 4. Reset & Isolation Strategy

Every test suite can independently reset factory counters to ensure order-independent execution:

```typescript
import { resetAllFactoryCounters } from '@elsesourav/testing';

beforeEach(() => {
  resetAllFactoryCounters();
});
```

---

## 5. Privacy & Security Invariants

- **No real email addresses or names** — all entities use `@example.test` and simulated identities.
- **No real passwords or OAuth credentials** are ever stored in test code.
- **No live Cloudinary uploads** — mock assets point to deterministic fixture paths.
- **Zero `any` types** — 100% strict TypeScript schema adherence.
