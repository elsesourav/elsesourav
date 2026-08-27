# Long-Term Firestore Schema Evolution & Database Integrity Guide

> **Platform**: ElseSourav  
> **Maintainer Model**: Single Solo Architect  
> **Design Goal**: Safe, predictable, zero-downtime schema evolution without complex migration frameworks.

---

## 1. Schema Versioning & Model Invariants

To future-proof evolving Firestore documents without bloating lightweight collections, core aggregate roots declare an explicit `schemaVersion?: number` (default: `1`):

- **`App`**: `/apps/{appId}` $\to$ `schemaVersion: 1`
- **`BlogPost`**: `/blog_posts/{postId}` $\to$ `schemaVersion: 1`
- **`HelpArticle`**: `/help_articles/{articleId}` $\to$ `schemaVersion: 1`
- **`SupportTicket`**: `/support_tickets/{ticketId}` $\to$ `schemaVersion: 1`

Lightweight taxonomy documents (`/categories`, `/tags`) remain minimal key-value records.

---

## 2. The 5-Phase Zero-Downtime Schema Evolution Pattern

When evolving a Firestore document schema (e.g., splitting a field, renaming a property, or adding structured metadata), follow this predictable 5-phase lifecycle:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Phase 1:        │     │ Phase 2:        │     │ Phase 3:        │     │ Phase 4:        │     │ Phase 5:        │
│ Dual-Read Code  │ ──► │ New-Write Code  │ ──► │ Data Backfill   │ ──► │ Strict Read     │ ──► │ Legacy Cleanup  │
│ Support Legacy  │     │ Write Schema V2 │     │ Batch Script    │     │ Remove Dual-Read│     │ Deprecate Field │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Phase 1: Deploy Dual-Read Application Code
Update the Zod schema and repository parser to accept both old and new formats using `.transform()` or `.optional()` fallbacks:
```ts
// Example: Moving from string 'author' to object 'author: { id, name }'
export const authorFieldSchema = z.union([
  z.string().transform((name) => ({ id: 'legacy-author', name })),
  z.object({ id: z.string(), name: z.string() })
]);
```

### Phase 2: Deploy New Schema Writes
Update the admin creation and editing flows to persist documents according to `schemaVersion: 2`. All new and updated documents will immediately write the latest format.

### Phase 3: Run Deterministic Background Backfill (Optional)
For historical documents, write an idempotent batch script using `db:validate` and Firestore Batched Writes (500 docs/batch) to backfill legacy documents.

### Phase 4: Switch to Strict Schema Reads
Increment `schemaVersion` requirement and verify via `npm run db:validate` that 0 documents remain on legacy schemas.

### Phase 5: Remove Legacy Fallbacks
Clean up deprecated schema unions and fallback transformers in the next platform release.

---

## 3. Timestamp Normalization Strategy

To eliminate bugs caused by mixing JS `Date`, Firestore `Timestamp`, ISO 8601 strings, and numeric epoch milliseconds:

1. **Domain Representation**: Strictly `Timestamp = number` (Unix epoch milliseconds).
2. **Ingress Boundary**: All raw document ingress passes through `normalizeTimestamp(value)` in [`src/utils/timestamp.utils.ts`](file:///Users/sourav/Developer/WEB/elsesourav/src/utils/timestamp.utils.ts).
3. **Egress Boundary**: Render dates to users using `formatDate(timestamp)` or ISO strings.

---

## 4. Public Slug Integrity & URL Stability

Public resource identifiers (`/apps/:slug`, `/blog/:slug`, `/help/:category/:slug`) represent permanent URLs indexed by search engines and shared by users.

### Invariants:
- **Format**: Lowercase kebab-case matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`.
- **Immutability**: Slugs must NOT automatically regenerate when an admin edits the title of an existing published application or article.
- **Uniqueness**: Enforced across collections before creation via `validateDatabaseIntegrity()`.

---

## 5. Soft-Delete & Archive Safety Invariants

To avoid breaking external links, bookmark libraries, and support threads, destructive operations adhere to soft-deletion:

- **Soft Delete**: Mark document with `status = "archived"`, `isActive = false`, and `deletedAt = normalizeTimestamp(Date.now())`.
- **Referential Integrity**: Child documents (such as `app_versions`) remain linked to the soft-deleted parent rather than becoming dangling orphan records.
- **Hard Deletion**: Restricted exclusively to GDPR/CCPA user account wipes under `/settings` Danger Zone.

---

## 6. Architectural Boundary Enforcement

Strict unidirectional data flow is maintained across the codebase:

```
[UI Layer (Pages / Components)]
         │
         ▼
[Service Layer (Domain Logic & Business Invariants)]
         │
         ▼
[Repository Layer (Zod Validation & Firestore Ingress/Egress)]
         │
         ▼
[Google Cloud Firestore Database]
```

- **Rule**: UI components NEVER call `doc()`, `getDoc()`, `setDoc()`, or raw Firestore SDK APIs directly.
- **Rule**: All database interactions flow through typed repositories and validated schemas.
