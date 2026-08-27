# Production Cloud Firestore Database Operations & Architecture

> **Platform**: ElseSourav  
> **Database Engine**: Google Cloud Firestore (Native Mode)  
> **Index Definition**: [`firestore.indexes.json`](file:///Users/sourav/Developer/WEB/elsesourav/firestore.indexes.json)  
> **Security Rules**: [`firestore.rules`](file:///Users/sourav/Developer/WEB/elsesourav/firestore.rules)

---

## 1. Authoritative 14-Collection Inventory

| Collection Path | Purpose | Read Policy | Write Policy |
| :--- | :--- | :--- | :--- |
| `/users/{uid}` | User profiles, preferences, role | Owner + Admin | Owner (excluding `role`) + Admin |
| `/apps/{appId}` | Software directory listings | Public (`status == "published"`) | Admin Only |
| `/app_versions/{versionId}` | Application release history | Public (if parent app published) | Admin Only |
| `/categories/{categoryId}` | Software & blog taxonomy | Public | Admin Only |
| `/tags/{tagId}` | Multi-dimensional tags | Public | Admin Only |
| `/blog_posts/{postId}` | Editorial devlogs & articles | Public (`status == "published"`) | Admin Only |
| `/help_categories/{categoryId}` | Knowledge base taxonomy | Public | Admin Only |
| `/help_articles/{articleId}` | Help & troubleshooting docs | Public (`status == "published"`) | Admin Only |
| `/libraries/{libraryId}` | User saved software bookmarks | Owner (`userId == request.auth.uid`) | Owner Only |
| `/notifications/{notificationId}` | User in-app notifications | Recipient (`userId == request.auth.uid`)| System / Admin |
| `/support_tickets/{ticketId}` | Customer support tickets | Ticket Creator + Admin | Ticket Creator + Admin |
| `/support_messages/{messageId}` | Threaded support replies | Ticket Participants + Admin | Authenticated Participant |
| `/audit_logs/{logId}` | Security & admin audit trail | Admin Only | Append-Only (Admin / System) |
| `/analytics_events/{eventId}` | Platform usage telemetry | Admin Only | Client Write / Admin Read |

---

## 2. Baseline System Data

The platform requires these baseline definitions prior to public traffic:

1. **System Categories (`/categories`)**:
   - `Developer Tools`, `Utilities`, `Productivity`, `Desktop Apps`, `Web Extensions`, `Open Source`
2. **System Tags (`/tags`)**:
   - `React`, `TypeScript`, `CLI`, `Open Source`, `Cross-Platform`, `Automation`, `Productivity`
3. **Help Categories (`/help_categories`)**:
   - `Getting Started`, `Account & Security`, `Software Downloads & Installation`, `Troubleshooting & Support`
4. **Initial Help Articles (`/help_articles`)**:
   - Platform Overview, Profile & Security Settings, Issue Reporting Guide.

---

## 3. Safe Database Seeding & Environment Controls

Defined in [`src/config/database-seed.data.ts`](file:///Users/sourav/Developer/WEB/elsesourav/src/config/database-seed.data.ts) and executed via [`scripts/seed-firestore.ts`](file:///Users/sourav/Developer/WEB/elsesourav/scripts/seed-firestore.ts):

```bash
# Development Seeding (Includes sample demo apps and devlogs)
npm run db:seed -- --env=development

# Production Initialization (Strictly seeds baseline system data; excludes sample apps)
npm run db:seed -- --env=production --confirm-production
```

### Production Safety Invariants:
- **Zero Silent Overwrite**: Document IDs are deterministic (e.g. `cat-developer-tools`). Existing live documents are never overwritten or deleted.
- **Explicit Confirmation Guard**: Seeding against production without `--confirm-production` throws a hard safety error.
- **Sample Data Isolation**: Demo mock applications, fake reviews, and test devlogs are strictly omitted during production initialization.

---

## 4. Secure Initial Admin Account Setup

> [!IMPORTANT]
> **Zero Hardcoded Admin Passwords.** ElseSourav does not use default administrative passwords or automated root creation.

### Step-by-Step Initial Admin Bootstrap:
1. **Create Account via Firebase Authentication**:
   - Register a secure personal admin email via the normal web UI at `https://elsesourav.com/signup` or via Firebase Console $\to$ Authentication.
2. **Assign Admin Role in Firestore**:
   - Open Firebase Console $\to$ **Firestore Database** $\to$ `/users/{YOUR_AUTH_UID}`.
   - Set field: `"role": "admin"`.
3. **Verify Security Rule Enforcement**:
   - Client-side self-promotion is blocked by `firestore.rules`.
   - Logging in with the newly promoted account grants instant access to `/admin`.

---

## 5. Required Composite Indexes

Defined in [`firestore.indexes.json`](file:///Users/sourav/Developer/WEB/elsesourav/firestore.indexes.json):

1. **`apps`**:
   - `status ASC, isFeatured DESC, publishedAt DESC` (Featured showcase queries)
   - `status ASC, categoryId ASC, publishedAt DESC` (Category filtered catalogs)
   - `status ASC, downloadCount DESC` (Popular downloads sorting)
   - `status ASC, rating DESC` (Top rated sorting)
2. **`blog_posts`**:
   - `status ASC, publishedAt DESC` (Chronological blog feed)
   - `status ASC, categoryId ASC, publishedAt DESC` (Category filtered blog)
   - `status ASC, isFeatured DESC, publishedAt DESC` (Featured devlogs)
3. **`help_articles`**:
   - `status ASC, categoryId ASC, order ASC` (Sequential article ordering)
4. **`support_tickets`**:
   - `userId ASC, updatedAt DESC` (User ticket dashboard)
   - `status ASC, updatedAt DESC` (Admin ticket queue triage)
5. **`audit_logs`**:
   - `action ASC, timestamp DESC` (Filtered security audit queries)

---

## 6. Referential Integrity & Validation

Run database validation at any time:

```bash
npm run db:validate
```

Validates:
- Unique slug enforcement across all entities.
- Referential integrity (App $\to$ Category/Tag, Version $\to$ App, Article $\to$ Category).
- URL security validation (Rejects `javascript:`, `data:`, `vbscript:` schemes).
- Required field completeness.
