# ElseSourav Content Architecture & Markdown Specification

> **Authoritative Specification**: `schema.prisma`, `@elsesourav/types`, and `BlogContentRenderer.tsx`  
> **Standard**: Canonical Markdown Storage & Safe Client Rendering

---

## 1. Content Field Classification Audit

Every field across the PostgreSQL / Prisma database models is categorized into an explicit content type:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CONTENT TYPE TAXONOMY                             │
├──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│  SHORT_TEXT  │  LONG_TEXT   │   MARKDOWN   │ STRUCTURED  │    ENUM     │
├──────────────┼──────────────┼──────────────┼─────────────┼─────────────┤
│ • Name/Title │ • Excerpt    │ • Blog Post  │ • JSON Prefs│ • Statuses  │
│ • DisplayName│ • Short Desc │ • Help Guide │ • App Links │ • Roles     │
│ • Slugs      │ • Notes      │ • App Docs   │ • Tags list │ • Priorities│
│ • SEO titles │ • Messages   │ • Changelogs │ • Meta array│             │
└──────────────┴──────────────┴──────────────┴─────────────┴─────────────┘
```

### Complete Model Classification Matrix

| Model               | Field Name         | Content Classification | Storage Type      | Rendering Strategy                 |
| :------------------ | :----------------- | :--------------------- | :---------------- | :--------------------------------- |
| **`BlogPost`**      | `title`            | `SHORT_TEXT`           | `String`          | Plain text / Heading               |
|                     | `slug`             | `SHORT_TEXT`           | `String` (Unique) | URL parameter                      |
|                     | `excerpt`          | `LONG_TEXT`            | `String`          | Plain text (card summary)          |
|                     | `content`          | `MARKDOWN`             | `String` (Text)   | `BlogContentRenderer`              |
|                     | `status`           | `ENUM`                 | `PublishStatus`   | Badge pill                         |
|                     | `readingTime`      | `METADATA`             | `Int`             | Integer minutes                    |
|                     | `viewsCount`       | `METADATA`             | `Int`             | Integer count                      |
|                     | `coverImageUrl`    | `URL`                  | `String?`         | `next/image` with CDN transform    |
|                     | `seoTitle`         | `SHORT_TEXT`           | `String?`         | HTML `<title>` tag                 |
|                     | `seoDescription`   | `LONG_TEXT`            | `String?`         | HTML `<meta name="description">`   |
| **`HelpArticle`**   | `title`            | `SHORT_TEXT`           | `String`          | Plain text / Heading               |
|                     | `slug`             | `SHORT_TEXT`           | `String` (Unique) | URL parameter                      |
|                     | `excerpt`          | `LONG_TEXT`            | `String?`         | Plain text summary                 |
|                     | `content`          | `MARKDOWN`             | `String` (Text)   | `BlogContentRenderer`              |
|                     | `status`           | `ENUM`                 | `PublishStatus`   | Badge pill                         |
|                     | `orderIndex`       | `METADATA`             | `Int`             | Integer sequence order             |
| **`App`**           | `name`             | `SHORT_TEXT`           | `String`          | Heading                            |
|                     | `slug`             | `SHORT_TEXT`           | `String` (Unique) | URL parameter                      |
|                     | `shortDescription` | `SHORT_TEXT`           | `String`          | Plain text card summary            |
|                     | `description`      | `MARKDOWN`             | `String` (Text)   | `BlogContentRenderer`              |
|                     | `iconUrl`          | `URL`                  | `String`          | `next/image` avatar                |
|                     | `status`           | `ENUM`                 | `PublishStatus`   | Badge pill                         |
|                     | `currentVersion`   | `SHORT_TEXT`           | `String?`         | SemVer badge                       |
| **`AppVersion`**    | `version`          | `SHORT_TEXT`           | `String`          | SemVer string (`v1.2.0`)           |
|                     | `changelog`        | `MARKDOWN`             | `String` (Text)   | Markdown release notes             |
|                     | `downloadUrl`      | `URL`                  | `String?`         | Direct binary/installer link       |
| **`SupportTicket`** | `subject`          | `SHORT_TEXT`           | `String`          | Heading                            |
|                     | `description`      | `LONG_TEXT`            | `String`          | Initial customer inquiry text      |
|                     | `status`           | `ENUM`                 | `TicketStatus`    | Badge status indicator             |
|                     | `priority`         | `ENUM`                 | `TicketPriority`  | Priority badge indicator           |
| **`TicketMessage`** | `message`          | `LONG_TEXT`            | `String`          | Conversation message body          |
|                     | `attachments`      | `STRUCTURED_DATA`      | `String[]`        | Array of secure URLs               |
| **`User`**          | `displayName`      | `SHORT_TEXT`           | `String`          | Profile name                       |
|                     | `bio`              | `LONG_TEXT`            | `String?`         | User profile overview              |
|                     | `preferences`      | `STRUCTURED_DATA`      | `Json`            | JSON schema (theme, notifications) |

---

## 2. Canonical Markdown Storage Principles

1. **Raw Markdown is the Source of Truth**: Content in `BlogPost.content`, `HelpArticle.content`, and `App.description` is stored in canonical plain Markdown format.
2. **Never Store Rendered HTML**: Storing HTML in database columns creates security vulnerabilities (XSS), prevents re-styling, and prevents portable data export.
3. **Safe Parsing & Rendering**: Client rendering parses Markdown safely, sanitizes URLs via `isSafeUrl()`, prevents JavaScript execution, and styles elements using semantic Tailwind classes.

---

## 3. Supported Markdown Syntax Elements

| Markdown Feature | Syntax Example                                 | Rendered Element                                                     |
| :--------------- | :--------------------------------------------- | :------------------------------------------------------------------- |
| **Headings**     | `# Heading 1`, `## Heading 2`, `### Heading 3` | `<h1 class="text-3xl font-extrabold text-white">`, `<h2>`, `<h3>`    |
| **Code Blocks**  | ` ```typescript \n const x = 1; \n ``` `       | Fenced card with syntax header and Copy-to-Clipboard button          |
| **Inline Code**  | `` `const token = "..."` ``                    | `<code class="px-1.5 py-0.5 rounded-md bg-zinc-800 font-mono">`      |
| **Lists**        | `- Item 1 \n - Item 2`                         | `<ul class="list-disc list-inside space-y-2">`                       |
| **Blockquotes**  | `> Note: Important constraint`                 | `<blockquote class="border-l-4 border-indigo-500 bg-indigo-950/20">` |
| **Safe Links**   | `[Documentation](/help)`                       | `<a class="text-indigo-400 hover:underline">` (XSS-sanitized)        |
| **Images**       | `![Architecture Preview](https://...)`         | `<Image fill className="object-cover rounded-2xl">`                  |
| **Emphasis**     | `**Bold text**`, `*Italic text*`               | `<strong>`, `<em>`                                                   |

---

## 4. Schema Safety & Migration Guarantees

- **Additive Changes Only**: All new content fields are declared either with safe defaults (`@default("")`, `@default(0)`) or as nullable (`String?`).
- **Zero Destructive Drops**: No tables or columns are removed without a multi-phase deprecation window.
- **Relational Integrity**: Foreign keys (`User`, `Category`, `Tag`, `AppVersion`) use PostgreSQL relational constraints and indexed lookups for fast retrieval.
