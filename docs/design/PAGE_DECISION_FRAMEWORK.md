# ElseSourav Page Decision Framework & Canvas Matrix

> **Companion Document to**: `docs/design/DESIGN_CONSTITUTION.md`  
> **Purpose**: Provides the definitive strategic canvas (Purpose, Audience, User Problem, Primary Action, Secondary Actions, Hierarchy, Success Criteria) for every key route in ElseSourav.

---

## 1. The 7-Point Canvas Standard

Every view in ElseSourav is governed by this standard formulation:

```
1. Purpose:              The fundamental reason this page exists.
2. Audience:             Who is arriving (visitor, registered dev, admin, seeker).
3. User Problem:         What blocker, inquiry, or task is being resolved.
4. Primary Action:       The singular dominant action the interface drives.
5. Secondary Actions:    Supporting tasks permitted without visual conflict.
6. Information Hierarchy: Order of ocular importance and layout structure.
7. Success Criteria:     Measurable outcome validating page effectiveness.
```

---

## 2. Route-by-Route Strategic Canvas Matrix

### 2.1 Public Tier

#### `GET /` — Ecosystem Landing & Showcase
- **Purpose**: Showcase the breadth and craftsmanship of ElseSourav's developer platform and latest engineering insights.
- **Audience**: Engineers, technical recruiters, developers, and open-source contributors.
- **User Problem**: "Who is Sourav, what software does he build, and why should I care?"
- **Primary Action**: "Explore All Apps" (`/apps`).
- **Secondary Actions**: "Read Engineering Notes" (`/blog`), "Sign In / Sign Up" (`/login`).
- **Information Hierarchy**:
  1. Hero statement & developer badge
  2. Primary action buttons
  3. Featured application cards (with platform icons & active stats)
  4. Latest technical devlogs (with reading time & publish date)
  5. Global navigation & footer links
- **Success Criteria**: Visitor clicks into an application detail page or begins reading an engineering article ($> 45\%$ CTR).
- **Design Tier**: **Public (High Craft)** — Subtle glass navbar, radial gradient backdrop, asymmetric featured layout, animated card lift.

---

#### `GET /apps` — Applications & Utilities Discovery
- **Purpose**: Provide a fast, searchable, and filtered index of all published developer utilities, terminals, and software tools.
- **Audience**: Developers looking for high-performance productivity tools.
- **User Problem**: "What tools are available, what platforms do they support, and how can I try them?"
- **Primary Action**: Click on an app card to view detail or launch demo.
- **Secondary Actions**: Filter by category (DevTools, Design, Productivity), search by keyword, sort by popularity/release date.
- **Information Hierarchy**:
  1. Search and category filter bar (sticky or top well)
  2. Software card grid with verified platform badges (Web, CLI, macOS, etc.)
  3. Launch count and user rating telemetry
  4. Server pagination controls
- **Success Criteria**: User finds and opens a relevant software tool in $< 10$ seconds.
- **Design Tier**: **Public (Archival Index)** — Solid card surfaces with high contrast, crisp icons, instant filter micro-interactions.

---

#### `GET /apps/[slug]` — Software Detail & Manifest
- **Purpose**: Present comprehensive documentation, live demo links, version history changelogs, and architecture notes for a specific tool.
- **Audience**: Developers evaluating, downloading, or launching a specific software tool.
- **User Problem**: "How does this tool work, where is the source, and is it actively maintained?"
- **Primary Action**: "Launch App" / "Visit Live Demo" (Primary button).
- **Secondary Actions**: "Add to Personal Library", "View Source on GitHub", "Browse Version Changelog".
- **Information Hierarchy**:
  1. Header with icon, version badge, platforms, and primary launch CTA
  2. Full markdown feature description & interactive screenshots
  3. Release history and version timeline
  4. Community rating & feedback module
- **Success Criteria**: User launches the tool or bookmarks it to their personal library.
- **Design Tier**: **Public (Crafted Showcase)** — Large preview hero, interactive screenshot modal, solid content wells.

---

#### `GET /blog` — Engineering Devlog Archive
- **Purpose**: Curate technical articles, system architecture breakdowns, benchmark studies, and security write-ups.
- **Audience**: Software engineers seeking in-depth technical reading.
- **User Problem**: "What technical decisions, challenges, and insights have been explored in this ecosystem?"
- **Primary Action**: Click to read an engineering article.
- **Secondary Actions**: Filter by category/tag, view estimated reading times.
- **Information Hierarchy**:
  1. Editorial lead article banner
  2. Categorized article stream with publish dates and excerpt summaries
  3. Author attribution and reading time pills
  4. Server pagination
- **Success Criteria**: Visitor reads $\ge 1$ full technical article ($> 2$ min dwell time).
- **Design Tier**: **Public (Archival Editorial)** — Clean typography hierarchy, subtle border cards, zero distracting animations.

---

#### `GET /help` — Technical Knowledge Base & Guides
- **Purpose**: Resolve user onboarding, platform configuration, and troubleshooting questions quickly.
- **Audience**: Users experiencing technical issues or seeking API documentation.
- **User Problem**: "How do I configure, troubleshoot, or integrate this platform?"
- **Primary Action**: Search documentation or select a topic card.
- **Secondary Actions**: "Submit Support Ticket" if the answer is not found.
- **Information Hierarchy**:
  1. Prominent documentation search well
  2. Categorized topic cards (Getting Started, Security, API, Account)
  3. Popular frequently answered guides
  4. Direct link to customer support
- **Success Criteria**: User resolves their inquiry self-service without opening a ticket ($> 75\%$ self-service rate).
- **Design Tier**: **Public / User (Structured Guidance)** — High readability, clear breadcrumbs, instant search feedback.

---

### 2.2 Authenticated User Tier

#### `GET /library` — Personal Tool Launchpad
- **Purpose**: Provide a fast, personalized dashboard of the user's bookmarked applications, customized notes, and quick launch triggers.
- **Audience**: Logged-in active developers.
- **User Problem**: "Where are my frequently used tools and personal launch shortcuts?"
- **Primary Action**: Single-click launch of a bookmarked application.
- **Secondary Actions**: Reorder favorites, remove bookmark, view application updates.
- **Information Hierarchy**:
  1. Pinned favorites row
  2. Complete saved library grid
  3. Last opened telemetry
  4. Empty state with "Discover Apps" guidance if library is empty
- **Success Criteria**: User launches their desired tool in $< 2$ clicks from page load.
- **Design Tier**: **User (Focused Productivity)** — High contrast, solid cards, instant tactile hover feedback, zero decorative noise.

---

#### `GET /settings` — Account & Security Preferences
- **Purpose**: Manage profile details, authentication credentials, theme preference, and notification channels.
- **Audience**: Authenticated users updating account configuration.
- **User Problem**: "How do I change my password, update my email notifications, or edit my developer profile?"
- **Primary Action**: "Save Changes" on the active configuration section.
- **Secondary Actions**: Disconnect sessions, change password, manage email preferences.
- **Information Hierarchy**:
  1. Tabbed navigation (Profile, Security, Preferences, Notifications)
  2. Semantic form inputs with explicit labels and helper descriptions
  3. High-visibility destructive action zone (Delete Account) with confirmation dialog
- **Success Criteria**: User completes settings updates with clear, immediate inline success confirmation.
- **Design Tier**: **User (Accessible Forms)** — Strict vertical grid, high contrast, explicit focus rings, inline error validation.

---

### 2.3 Administrative Tier

#### `GET /admin` — Central Command & Operational Telemetry
- **Purpose**: Provide administrative oversight over application health, content publishing, support ticket queues, and user activity.
- **Audience**: Platform administrators and staff moderators.
- **User Problem**: "What requires my immediate attention today (tickets, drafts, security alerts)?"
- **Primary Action**: Click through to an urgent ticket or pending content draft.
- **Secondary Actions**: Review recent activity audit log, inspect high-level metric counts.
- **Information Hierarchy**:
  1. Key telemetry stat cards (Published Apps, Articles, Open Tickets, Total Users)
  2. Urgent ticket triage queue (Sorted by priority: URGENT $\rightarrow$ HIGH)
  3. Recent software and article updates
  4. System audit log trail
- **Success Criteria**: Administrator triages high-priority items in $< 60$ seconds.
- **Design Tier**: **Admin (Information Dense)** — Zero glassmorphism, zero decorative motion, compact high-contrast cards, tabular data.

---

#### `GET /admin/apps` & `/admin/blog` — Content Management Workflows
- **Purpose**: Author, edit, schedule, publish, and delete software catalog items and engineering devlogs.
- **Audience**: Administrative content editors.
- **User Problem**: "How do I create or update an app/article with full SEO and media metadata?"
- **Primary Action**: "Create New Item" or "Publish Changes".
- **Secondary Actions**: Filter by status (Draft vs Published), search by title/slug, preview markdown content.
- **Information Hierarchy**:
  1. Status filter tabs and Search bar
  2. Data table with title, status pill, category, and update timestamp
  3. Row actions (Edit, View Live, Delete with confirmation)
  4. Paginated table footer
- **Success Criteria**: Fast, error-free editing and publishing with transactional database persistence.
- **Design Tier**: **Admin (Data Tables & Clean Forms)** — Sortable table columns, inline badges, responsive modal drawers for quick edits.

---

## 3. Decision Matrix Summary

```
Route Group   │ Surface Tone   │ Composition │ Glass Depth │ Motion Intensity │ Contrast Target
──────────────┼────────────────┼─────────────┼─────────────┼──────────────────┼────────────────
Public Hero   │ Expressive     │ Asymmetric  │ Accents     │ Choreographed    │ 7:1 AAA
Apps Catalog  │ Archival Index │ Structured  │ Navbar only │ Card Lift (Hover)│ 7:1 AAA
App Detail    │ Crafted Story  │ Editorial   │ Modal Only  │ State feedback   │ 7:1 AAA
Blog Post     │ High Readability│ Single Col  │ None        │ None             │ 7:1 AAA
User Library  │ Productivity   │ Grid Cards  │ None        │ Micro-press      │ 7:1 AAA
User Settings │ Form Hierarchy │ Vertical    │ None        │ Focus rings only │ 7:1 AAA
Admin Portal  │ High Density   │ Data Tables │ Forbidden   │ Instant (0ms)    │ 7:1 AAA
```

*This framework governs all visual and functional decisions. When implementing new features, reference the specific canvas above.*
