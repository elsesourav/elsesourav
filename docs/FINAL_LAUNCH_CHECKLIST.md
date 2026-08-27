# ElseSourav Final Production Launch Checklist

> **Platform**: ElseSourav  
> **Release Version**: `0.1.0` (Build `1`)  
> **Target Production Domain**: `https://elsesourav.com`  
> **Firebase Project**: `elsesourav`  
> **Android Application ID**: `com.elsesourav.app`  
> **iOS Bundle ID**: `com.elsesourav.app`  
> **Status**: FROZEN & LAUNCH-READY

---

## 1. Pre-Deployment Verification

- [x] **Configuration Freeze**: All environment variables, feature flags, and API endpoints locked to production.
- [x] **Zero Committed Secrets**: Verified `.gitignore` excludes `.env`, `.env.local`, and private service account keys.
- [x] **Turnkey Quality Gate**:
  ```bash
  npm run validate
  ```
  - TypeScript Strict Typecheck: 0 errors
  - ESLint: 0 errors, 0 warnings
  - Vitest Test Suite: 107 files passed (904 tests passed)
  - Production Build: Clean static output in `dist/`
- [x] **Database Integrity**:
  ```bash
  npm run db:validate
  ```
  - All 27 baseline entities and foreign key relations validated.
- [x] **Security Rules Emulator Test**:
  ```bash
  npm run test:rules
  ```
  - 26/26 Firestore security rule assertions passed.
- [x] **Mobile Packaging Sync**:
  ```bash
  npm run mobile:sync
  ```
  - Android and iOS Capacitor wrappers synchronized with production web build.

---

## 2. Production Deployment Execution

- [x] **Step 1: Preview Channel Smoke Test (Optional)**:
  ```bash
  npx firebase hosting:channel:deploy prelaunch-preview
  ```
- [x] **Step 2: Production Deploy**:
  ```bash
  npx firebase deploy --only hosting,firestore
  ```
- [x] **Step 3: Edge CDN Cache & Headers**:
  - Verify CSP, HSTS, X-Content-Type-Options: nosniff, and Referrer-Policy headers.

---

## 3. Post-Deployment Live Verification

### Core Public Paths
- [ ] **Homepage (`/`)**: Hero section, featured apps, category cards, and latest update devlogs render cleanly.
- [ ] **Apps Catalog (`/apps`)**: Category filters, platform tags, and instantaneous search scoring execute with zero lag.
- [ ] **App Details (`/apps/:slug`)**: Verified download mirrors, screenshot galleries, and release notes tabs render without hydration mismatch.
- [ ] **Developer Journal (`/blog`)**: Published articles display author attribution, reading times, and sanitized markdown.
- [ ] **Help Center (`/help`)**: Onboarding guides, search filtering, and helpfulness voting buttons function properly.
- [ ] **About & Legal Pages**: `/about`, `/privacy`, `/terms`, `/cookies`, and `/accessibility` accessible from footer.

### User Account & Support Workflows
- [ ] **Authentication**: Email/password registration, login, and 60-second rate-limited verification dispatch.
- [ ] **Personal Library (`/library`)**: Bookmarks synchronize to Firestore with instant offline caching.
- [ ] **Account Settings (`/settings`)**: Profile updates and Danger Zone account deletion test.
- [ ] **Support Ticketing (`/support`)**: Support ticket creation and live message threading.

### Admin Control Center
- [ ] **Admin Route Guard**: Non-admin visitors blocked with 403 Forbidden.
- [ ] **Admin Dashboard (`/admin`)**: Software catalog management, release version management, devlog markdown editor, and audit logs.
- [ ] **System Diagnostics (`/admin/diagnostics`)**: Latency check and database connection health.

### Public SEO & Metadata Verification
- [ ] **Sitemap**: `https://elsesourav.com/sitemap.xml` returns valid XML with 9 canonical entries.
- [ ] **Robots**: `https://elsesourav.com/robots.txt` disallows `/admin`, `/library`, and private routes.
- [ ] **Deep Linking**: `/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` resolve properly.
