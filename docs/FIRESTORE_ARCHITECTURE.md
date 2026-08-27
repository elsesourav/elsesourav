# Firestore Database Architecture Specification

This document defines the complete NoSQL document and collection architecture for **ElseSourav**. The database is designed specifically for Firestore's performance characteristics, avoiding relational SQL/Prisma anti-patterns.

---

## 1. Core Architectural Principles

1. **Optimize for Read Heavy Workloads**: The platform has a ~95% read to 5% write ratio (users browsing apps, reading blogs, viewing guides vs. single-publisher content publishing).
2. **Denormalization over Multi-Queries**: Fast single-document reads embed frequently co-accessed metadata (e.g. app category name, primary launch link, preview thumbnail) directly in the parent document.
3. **Subcollections for Unbounded Growth**: Entities that grow indefinitely (ticket messages, app release notes, user library items) use subcollections to protect root document sizes (< 1MB document limit).
4. **Single-Publisher Isolation**: Sourav is the sole publisher; apps and articles belong to the platform rather than multi-tenant vendor accounts.
5. **No `JSON.parse(JSON.stringify(...))` Hacks**: All serialization is governed by typed `FirestoreDataConverter<T>` instances with explicit timestamp conversion.

---

## 2. Collection Layout & Schema Blueprint

### 2.1. `users` (Root Collection)

- **Path**: `/users/{userId}`
- **Purpose**: Stores core user profile, status, and preferences.
- **Fields**:
  - `id`: string (matches Firebase Auth UID)
  - `email`: string
  - `displayName`: string
  - `photoUrl`?: string
  - `role`: `'user' | 'admin'`
  - `status`: `'active' | 'suspended' | 'pending'`
  - `preferences`: `{ theme: 'system' | 'dark' | 'light', emailNotifications: boolean, reduceMotion: boolean, compactView: boolean }`
  - `lastLoginAt`?: number (timestamp)
  - `createdAt`: number (timestamp)
  - `updatedAt`: number (timestamp)

#### Subcollection: `users/{userId}/library/{appId}`

- **Purpose**: Tracks apps pinned, favorited, or bookmarked in a user's private library.
- **Fields**: `id`, `userId`, `appId`, `isFavorite`: boolean, `isPinned`: boolean, `customNotes`?: string, `addedAt`: number, `lastOpenedAt`?: number.

---

### 2.2. `apps` (Root Collection)

- **Path**: `/apps/{appId}`
- **Purpose**: Primary catalog of applications, Chrome extensions, tools, web apps, and games.
- **Fields**:
  - `id`: string
  - `slug`: string (unique index for SEO URLs)
  - `name`: string
  - `tagline`: string
  - `description`: string
  - `category`: `AppCategory` (embedded: `id`, `name`, `slug`, `icon`)
  - `status`: `'draft' | 'published' | 'beta' | 'archived'`
  - `primaryPlatform`: `'web' | 'chrome' | 'android' | 'desktop' | 'cli' | 'cross-platform'`
  - `supportedPlatforms`: `readonly AppPlatform[]`
  - `links`: `readonly AppLink[]` (e.g. Chrome Web Store, Web App, Play Store, GitHub)
  - `media`: `readonly AppMedia[]` (thumbnails, banners, screenshots)
  - `tags`: `readonly string[]` (tag slugs for filtering)
  - `version`: string (e.g. `'1.2.0'`)
  - `isFeatured`: boolean
  - `isHighlighted`: boolean
  - `downloadCount`: number
  - `rating`: `{ average: number, count: number }`
  - `publishedAt`?: number
  - `createdAt`: number
  - `updatedAt`: number

#### Subcollection: `apps/{appId}/versions/{versionId}`

- **Purpose**: Detailed semantic version history.
- **Fields**: `id`, `appId`, `version`: string, `releaseDate`: number, `downloadUrl`?: string, `minOsVersion`?: string.

#### Subcollection: `apps/{appId}/changelogs/{changelogId}`

- **Purpose**: Markdown-formatted release notes and bug fix logs.
- **Fields**: `id`, `appId`, `version`: string, `title`: string, `content`: string, `publishedAt`: number.

---

### 2.3. `categories` (Root Collection)

- **Path**: `/categories/{categoryId}`
- **Purpose**: Software categories (e.g. Web Apps, Browser Extensions, Developer Tools, Games).
- **Fields**: `id`, `slug`, `name`, `description`?, `icon`?, `displayOrder`: number, `isActive`: boolean.

---

### 2.4. `tags` (Root Collection)

- **Path**: `/tags/{tagId}`
- **Purpose**: Shared taxonomy tags across apps and blog articles.
- **Fields**: `id`, `slug`, `name`, `color`?, `usageCount`: number.

---

### 2.5. `blogPosts` (Root Collection)

- **Path**: `/blogPosts/{postId}`
- **Purpose**: Technical articles, devlogs, project deep-dives, and platform announcements.
- **Fields**: `id`, `slug`, `title`, `excerpt`, `content`, `coverImageUrl`?, `author`: `{ id, name, photoUrl }`, `tags`: `readonly string[]`, `isPublished`: boolean, `publishedAt`?, `readingTimeMinutes`: number, `createdAt`, `updatedAt`.

---

### 2.6. `feedback` (Root Collection)

- **Path**: `/feedback/{feedbackId}`
- **Purpose**: User reviews, ratings, and feature requests.
- **Fields**: `id`, `userId`?, `userEmail`?, `targetType`: `'app' | 'platform'`, `targetId`?, `rating`: number, `comment`: string, `isPublic`: boolean, `status`: `'pending' | 'approved' | 'hidden'`, `createdAt`.

---

### 2.7. `helpArticles` & `helpCategories` (Root Collections)

- **Path**: `/helpCategories/{categoryId}` & `/helpArticles/{articleId}`
- **Purpose**: FAQ and knowledge base documentation.
- **Fields (Article)**: `id`, `categoryId`, `title`, `slug`, `content`, `order`: number, `isPublished`: boolean, `createdAt`, `updatedAt`.

---

### 2.8. `supportTickets` (Root Collection)

- **Path**: `/supportTickets/{ticketId}`
- **Purpose**: Inquiries and bug reports submitted to Sourav.
- **Fields**: `id`, `userId`?, `email`: string, `name`: string, `subject`: string, `category`: string, `priority`: `'low' | 'medium' | 'high'`, `status`: `'open' | 'in_progress' | 'resolved' | 'closed'`, `createdAt`, `updatedAt`.

#### Subcollection: `supportTickets/{ticketId}/messages/{messageId}`

- **Purpose**: Conversation replies between user and admin.
- **Fields**: `id`, `ticketId`, `senderId`: string, `senderRole`: `'user' | 'admin'`, `message`: string, `sentAt`: number.

---

### 2.9. `auditLogs` (Root Collection)

- **Path**: `/auditLogs/{logId}`
- **Purpose**: Immutable security audit trail of admin publishing, deletes, and configuration updates.
- **Fields**: `id`, `actorId`: string, `actorEmail`: string, `action`: string, `entityType`: string, `entityId`: string, `metadata`: Record<string, unknown>, `timestamp`: number.

---

## 3. Querying & Indexing Strategy

1. **Composite Indexes**:
   - `apps`: `status ASC, isFeatured DESC, publishedAt DESC` (for homepage hero feed)
   - `apps`: `status ASC, category.slug ASC, publishedAt DESC` (for category browsing)
   - `apps`: `status ASC, tags ARRAY_CONTAINS, publishedAt DESC` (for tag search)
   - `blogPosts`: `isPublished ASC, publishedAt DESC` (for blog listings)
2. **Cursor Pagination**:
   - All list queries use `orderBy` on deterministic fields (`publishedAt` or `createdAt` + `__name__`), leveraging `startAfter` cursors rather than offsets.
3. **Firestore Limits Respected**:
   - Single inequality rule per query honored.
   - Array limits constrained (< 20 items per embedded array).
