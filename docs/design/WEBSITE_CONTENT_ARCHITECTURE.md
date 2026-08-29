# ElseSourav Website Content Architecture

> **Authoritative Specification**: Foundation Phase (Prompt 05 of 10)  
> **Primary Rule**: Every meaningful user-facing content item that may reasonably need editing after deployment should be manageable without requiring code redeployments. Technical constants remain in code/configuration.

---

## 1. Content Ownership & Surface Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                     SURFACE CONTENT OWNERSHIP MAP                      │
├───────────────────┬────────────────────────────┬───────────────────────┤
│ SURFACE TIER      │ CONTENT REALM              │ MANAGEMENT MECHANISM  │
├───────────────────┼────────────────────────────┼───────────────────────┤
│ **Public**        │ • Homepage Hero & Value    │ Config / Admin DB     │
│                   │ • Featured Applications    │ Admin App CMS         │
│                   │ • Engineering Articles     │ Admin Blog CMS        │
│                   │ • Documentation & Guides   │ Admin Help CMS        │
│                   │ • Creator Story & Bio      │ Creator Config        │
│                   │ • Legal Terms & Privacy    │ Markdown / Config     │
│                   │ • SEO & OpenGraph Meta     │ Dynamic DB / Config   │
├───────────────────┼────────────────────────────┼───────────────────────┤
│ **User Portal**   │ • Personal Library Items   │ User Self-Service     │
│                   │ • Support Ticket Threads   │ User / Admin Messages │
│                   │ • Account Profile & Prefs  │ User Settings         │
│                   │ • System Notifications     │ Admin Event Triggers  │
├───────────────────┼────────────────────────────┼───────────────────────┤
│ **Admin Portal**  │ • Content Lifecycle Forms  │ Admin Interface       │
│                   │ • Audit Trail & Logs       │ Automated DB Stream   │
│                   │ • Media Library & Uploads  │ Cloudinary Pipeline   │
│                   │ • User Role Management     │ RBAC Server Actions   │
└───────────────────┴────────────────────────────┴───────────────────────┘
```

---

## 2. Content Type Classification

Every piece of content across the platform is classified into a strict semantic type:

| Type | Definition | Storage & Validation | Examples |
| :--- | :--- | :--- | :--- |
| **`STRUCTURED`** | Relational objects with nested keys | Relational DB tables / JSON | App versions, category hierarchies |
| **`SHORT TEXT`** | Single-line strings ($\le 255\text{ char}$) | VarChar / String column | Titles, slugs, badges, CTA labels |
| **`LONG TEXT`** | Multi-line plain text summary | Text column (no HTML) | Excerpts, short bios, descriptions |
| **`MARKDOWN`** | Rich formatted body copy | Raw plain Markdown in DB | Article body, help guide, app docs |
| **`MEDIA`** | Optimized asset references | Cloudinary URL + Secure Public ID | Screenshots, cover banners, avatars |
| **`URL`** | Validated external or internal links| HTTPS URL with scheme validation | GitHub repo, download links |
| **`BOOLEAN`** | Binary flags | Boolean column | `isFeatured`, `isArchived`, `isRead` |
| **`NUMBER`** | Integers / Floats | Integer / Decimal | Reading time, order index, file size |
| **`ENUM`** | Fixed domain choices | Prisma enum | `TicketStatus`, `PublishStatus`, `Role` |
| **`RELATION`** | Foreign-key constraints | Relational foreign keys | `categoryId`, `authorId`, `appId` |

---

## 3. Admin-Managed Content Specification

The following content is dynamically editable via the administrative portal without requiring code redeployments:

### 3.1 Software Applications (`App`, `AppLink`, `AppVersion`)
- **Identity**: `name`, `slug`, `tagline`, `category` (`RELATION`), `tags` (`RELATION[]`).
- **Media**: `iconUrl` (`MEDIA`), `featuredImageUrl` (`MEDIA`), gallery screenshots (`MEDIA[]`).
- **Documentation**: `description` (`MARKDOWN`) rendered via `MarkdownRenderer`.
- **Distribution & SemVer**: `version` (`SHORT TEXT`), `changelog` (`MARKDOWN`), `downloadUrl` (`URL`), `webUrl` (`URL`), `githubUrl` (`URL`), `isFeatured` (`BOOLEAN`), `status` (`ENUM`).

### 3.2 Engineering Devlogs (`BlogPost`, `BlogCategory`, `BlogTag`)
- **Editorial**: `title`, `slug`, `excerpt` (`LONG TEXT`), `coverImageUrl` (`MEDIA`), `category` (`RELATION`), `tags` (`RELATION[]`).
- **Body Content**: `content` (`MARKDOWN`) with syntax highlighting, copy blocks, GFM tables, and math equations.
- **Publishing Lifecycle**: `status` (`ENUM`: `draft`, `published`, `archived`), `publishedAt` (Timestamp), `readingTime` (`NUMBER`).
- **SEO Override**: `seoTitle`, `seoDescription`.

### 3.3 Knowledge Base & Documentation (`HelpArticle`, `HelpCategory`)
- **Structure**: `title`, `slug`, `category` (`RELATION`), `orderIndex` (`NUMBER`).
- **Documentation Body**: `content` (`MARKDOWN`) with code examples, task checklists, terminal commands.
- **SEO & Status**: `status` (`ENUM`), `seoTitle`, `seoDescription`.

### 3.4 Support & Customer Communication (`SupportTicket`, `TicketMessage`)
- **Inquiries**: `ticketNumber`, `subject`, `priority` (`ENUM`), `status` (`ENUM`).
- **Messages**: `content` (`LONG TEXT`), `isInternal` (`BOOLEAN`), `attachments` (`MEDIA[]`).

---

## 4. What Remains in Code & Configuration (No Over-Databasing)

The following architectural constants **must never** be stored in the database as CMS content:

- ❌ **Internal Route Constants**: `ROUTES.HOME`, `ROUTES.APPS`, `ROUTES.BLOG` (Kept in `@elsesourav/config/routes.ts`).
- ❌ **Security Policies & RBAC Matrix**: Role definitions and layout guards (Kept in `@elsesourav/auth`).
- ❌ **Prisma Schema & Migrations**: Relational definitions (Kept in `packages/database/prisma/schema.prisma`).
- ❌ **Theme & Design Tokens**: HSL variables, duration timings, border radii (Kept in `@elsesourav/ui/src/styles/globals.css`).
- ❌ **Component State Machines & Hooks**: React lifecycle and client logic (Kept in React components).

---

## 5. Page-by-Page Content Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PAGE CONTENT STRATEGY GUIDE                       │
├────────────────────┬───────────────────────────────────────────────────┤
│ PAGE / ROUTE       │ CONTENT FOCUS & INFORMATION HIERARCHY             │
├────────────────────┼───────────────────────────────────────────────────┤
│ **Homepage (/)**   │ • Creator Identity: Software & Tools by Sourav    │
│                    │ • Clear Value: Thoughtful software, practical tools│
│                    │ • Featured Work: Top 3-6 apps with direct actions  │
│                    │ • Engineering Devlogs: Latest 3 technical articles│
│                    │ • Creator Philosophy: 6 authentic principles      │
│                    │ • Non-Technical Rule: Zero generic framework buzz │
├────────────────────┼───────────────────────────────────────────────────┤
│ **About (/about)** │ • Creator positioning & authentic journey         │
│                    │ • 6 Guiding engineering principles                │
│                    │ • Areas of focus & verified social links          │
├────────────────────┼───────────────────────────────────────────────────┤
│ **Apps (/apps)**   │ • Searchable directory with category tabs         │
│                    │ • Platform badges (Web, CLI, Desktop, Extensions) │
│                    │ • SemVer version indicators and direct launch     │
├────────────────────┼───────────────────────────────────────────────────┤
│ **App Detail**     │ • Purpose & problem resolved                      │
│                    │ • Markdown documentation & keyboard shortcuts     │
│                    │ • Direct download links & platform binaries       │
│                    │ • SemVer changelog history                        │
├────────────────────┼───────────────────────────────────────────────────┤
│ **Blog (/blog)**   │ • Chronological archive of devlogs & benchmarks   │
│                    │ • Estimated reading time, topic category, tags    │
│                    │ • Markdown article body with syntax-highlighting  │
├────────────────────┼───────────────────────────────────────────────────┤
│ **Help (/help)**   │ • Task-oriented troubleshooting guides            │
│                    │ • Category navigation & search                    │
│                    │ • Copyable terminal commands & step-by-step flows │
├────────────────────┼───────────────────────────────────────────────────┤
│ **Support Desk**   │ • Ticket submission form & active ticket status   │
│                    │ • Threaded conversation history                   │
├────────────────────┼───────────────────────────────────────────────────┤
│ **User Library**   │ • Personal saved apps and launch history          │
│                    │ • Custom personal notes per app                   │
├────────────────────┼───────────────────────────────────────────────────┤
│ **Admin Portal**   │ • Live Markdown Editor with Write / Preview tabs  │
│                    │ • Content creation, publishing, and archiving     │
│                    │ • Media upload & Cloudinary asset management      │
└────────────────────┴───────────────────────────────────────────────────┘
```

---

## 6. Homepage Non-Technical Showcase Rule

> **Strict Mandate**: The homepage is an entry point for real users seeking useful software and insights. It is not an infrastructure resume.

- **Prohibited Marketing Sections**:
  - ❌ Next.js 15 Server-First
  - ❌ PostgreSQL / Supabase
  - ❌ Prisma ORM
  - ❌ Zero-Trust Security / RBAC
  - ❌ Server Actions / React Server Components
  - ❌ Zero client bundle claims
- **Appropriate Homepage Value**:
  - ✅ "Thoughtful software, practical tools, & engineering ideas."
  - ✅ "High-performance developer tools, terminal environments, & web software."
  - ✅ "Crafted for real workflows, low-latency architecture, and sleek aesthetics."
