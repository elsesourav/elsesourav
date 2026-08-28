# ElseSourav V2 — Database Architecture Specification

---

## 1. Overview
The ElseSourav V2 database layer is built on **PostgreSQL** provisioned via **Supabase** and accessed through **Prisma ORM** (`@prisma/client`).
- **Primary Data Store**: PostgreSQL for all structured relational data (Users, Apps, Devlogs, Help, Support, Audit Logs, Library Bookmarks).
- **Blob / Media Storage**: Cloudinary for responsive images, avatars, screenshots, and release asset uploads.

---

## 2. Relational Schema & Entity Models

### Core Entities
1. **`User`**: Core user entity linked to Supabase Auth via `supabaseAuthId`. Contains role (`USER`, `STAFF`, `ADMIN`), profile details, and preferences.
2. **`App`**: Software catalog items with slug, description, category, tags, status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and version history.
3. **`AppLink`**: Actionable URLs (web, iOS, Android, macOS, Linux, Windows) with action triggers (`open`, `download`, `install`).
4. **`AppVersion`**: Version releases with semver tags, release notes/changelogs, and optional direct downloads.
5. **`Category` & `Tag`**: Classification hierarchies with many-to-many relationship mapping (`AppTag`).
6. **`BlogPost` & `BlogCategory`**: Engineering devlogs and articles with reading time and view counts.
7. **`HelpArticle` & `HelpCategory`**: Support documentation and FAQ articles with user helpfulness feedback.
8. **`SupportTicket` & `TicketMessage`**: User support triage queue with priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and conversation threads.
9. **`UserLibraryItem`**: User software bookmarks with favorites, pinning, and custom developer notes.
10. **`AuditLog`**: Tamper-evident security and administrative audit logging with IP addresses and user agents.

---

## 3. ID and Timestamp Conventions
- **IDs**: Standard UUID / CUID string identifiers generated via `@default(uuid())`.
- **Timestamps**: PostgreSQL `DateTime` natively mapped with `@default(now())` and `@updatedAt`.

---

## 4. Status Enums
- **`PublishStatus`**: `DRAFT`, `PUBLISHED`, `ARCHIVED` (for Apps, BlogPosts, and HelpArticles).
- **`UserRole`**: `USER`, `STAFF`, `ADMIN`.
- **`TicketStatus`**: `OPEN`, `IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`.
- **`TicketPriority`**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

---

## 5. Indexed Query Optimization
- `App`: Indexes on `[status]`, `[categoryId]`, `[publishedAt]`, `[isFeatured]`.
- `BlogPost`: Indexes on `[status]`, `[publishedAt]`, `[categoryId]`.
- `HelpArticle`: Indexes on `[status]`, `[categoryId]`, `[orderIndex]`.
- `SupportTicket`: Indexes on `[userId]`, `[status]`, `[priority]`, `[lastMessageAt]`.
- `AuditLog`: Indexes on `[userId]`, `[action]`, `[timestamp]`.

---

## 6. Mappers & Repository Boundaries
Prisma-generated models are strictly converted into `@elsesourav/types` domain models via dedicated mappers before leaving repository boundaries:
- `mapPrismaAppToDomain()`
- `mapPrismaUserToDomain()`
- `mapPrismaBlogPostToDomain()`

---

## 7. Migration & Seed Operations
- **Development Migration**: `pnpm --filter @elsesourav/database exec prisma migrate dev`
- **Production Migration**: `pnpm --filter @elsesourav/database exec prisma migrate deploy`
- **Development Seed**: `pnpm --filter @elsesourav/database exec tsx prisma/seed/seed.ts`
