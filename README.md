# ElseSourav — Software Distribution & Developer Platform

> **Live Platform**: [https://elsesourav.com](https://elsesourav.com)  
> **Maintainer**: Sourav Mukherjee ([@elsesourav](https://github.com/elsesourav))  
> **License**: MIT

[![CI Pipeline](https://github.com/elsesourav/elsesourav/actions/workflows/ci.yml/badge.svg)](https://github.com/elsesourav/elsesourav/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8_Strict-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v12_SDK-ffca28.svg)](https://firebase.google.com/)
[![Tests](https://img.shields.io/badge/Tests-106_Suites_|_900_Passed-success.svg)](https://vitest.dev/)

---

## 1. Overview

**ElseSourav** is a high-performance, zero-server software distribution and developer platform. It serves as the primary showcase, download center, documentation portal, and release distribution hub for software tools, native desktop apps, terminal utilities, and web extensions created by independent developer Sourav.

The platform is engineered as a static Single Page Application (SPA) powered by **React 19**, **TypeScript 5 (Strict)**, and **Vite 6**, backed directly by **Google Cloud Firestore** and **Firebase Authentication**. It is packaged for web, mobile browsers, and native mobile distribution (Android & iOS) via **Capacitor 8**.

---

## 2. Key Capabilities

- 🚀 **Software Directory & Releases**: Categorized software catalog with multi-platform download binaries, system requirements, changelogs, and release histories.
- 📚 **Personal Software Library**: Authenticated user bookmarking with cloud synchronization and offline cache.
- 📝 **Developer Journal & Devlogs**: Markdown-rendered technical devlogs, architecture articles, and release announcements.
- 💡 **Help Center & Documentation**: Interactive knowledge base with structured article categorization, helpfulness voting, and search.
- 💬 **Direct Customer Support**: Threaded ticketing system with realtime responses, priority triage, and audit logging.
- 🔒 **Role-Based Admin Portal**: Secure `/admin` dashboard for catalog management, markdown editors, taxonomies, analytics, and security audit logs.
- 🔍 **Instant Client-Side Search**: Zero-delay search across applications, blog devlogs, and help articles with multi-token scoring.
- 📱 **Cross-Platform & Mobile Packaging**: Full support for Desktop, Tablet, Mobile Web, Android App Links, and iOS Universal Links.

---

## 3. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | React 19, TypeScript 5.8 (Strict), Vite 6.1 |
| **Styling & Design System** | Vanilla CSS Design Tokens, Glassmorphism, Responsive CSS Variables |
| **Database & Auth** | Google Cloud Firestore (Native Mode), Firebase Authentication v12 |
| **Mobile Packaging** | Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`) |
| **Validation & Data Safety** | Zod 3.24 Runtime Schema Parsing, DOMPurify, URL Scheme Sanitizers |
| **Testing** | Vitest 4, Testing Library, jsdom, `@firebase/rules-unit-testing` |
| **CI / CD & Hosting** | GitHub Actions, Firebase Hosting, Global CDN Edge Caching |

---

## 4. Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js**: `v20.18.0` or later (`node -v`)
- **Package Manager**: `npm` v10+ (`npm -v`)
- **Java Development Kit** *(for Android builds)*: OpenJDK 17 (`java -version`, `javac -version`)
- **Android SDK & Command-Line Tools** *(for Android builds)*: Android API 34+
- **Xcode** *(for iOS builds on macOS)*: Xcode 15+ (`xcodebuild -version`)

---

## 5. Getting Started & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/elsesourav/elsesourav.git
cd elsesourav
```

### 2. Clean Dependency Installation
```bash
npm ci
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```
Configure your Firebase project keys in `.env.local`:
```ini
VITE_APP_ENV=development
VITE_SITE_URL=http://localhost:5173
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Database Operations & Seeding

The platform includes safe, idempotent CLI tools for initializing and verifying Firestore:

```bash
# Seed development database with sample apps, categories, and devlogs
npm run db:seed -- --env=development

# Seed production database (strictly seeds baseline taxonomies, zero dummy content)
npm run db:seed -- --env=production --confirm-production

# Run non-destructive database referential integrity checks
npm run db:validate
```

---

## 7. Testing Suite

The repository maintains **106 test suites** with **900 automated tests**:

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit           # Pure utility, service, and schema tests
npm run test:components     # React component rendering and UI tests
npm run test:integration    # Multi-service integration and workflow tests
npm run test:security       # Security threat scenarios and Firestore rules
npm run test:a11y           # WCAG 2.1 AA accessibility tests
npm run test:rules          # Firestore security rules emulator tests

# Run turnkey validation pipeline (Typecheck + Lint + Test + Build)
npm run validate
```

---

## 8. Mobile Native Packaging (Android & iOS)

ElseSourav uses a single unified web codebase wrapped by Capacitor:

```bash
# Synchronize web assets to native wrapper projects
npm run mobile:sync

# Open native projects in Android Studio / Xcode
npm run mobile:open:android
npm run mobile:open:ios

# Build Android Debug APK locally via Gradle
cd android && ./gradlew assembleDebug
```

---

## 9. Production Build & Deployment

### 1. Execute Turnkey Validation
```bash
npm run validate
```

### 2. Deploy to Firebase Hosting
```bash
npx firebase deploy --only hosting,firestore
```

---

## 10. Comprehensive Documentation Sitemap

| Document | Purpose |
| :--- | :--- |
| [`docs/ARCHITECTURE.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/ARCHITECTURE.md) | Architectural layers, data flow, state management, and service contracts |
| [`docs/DATABASE_OPERATIONS.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/DATABASE_OPERATIONS.md) | Authoritative 14-collection inventory, admin bootstrap, and composite indexes |
| [`docs/SCHEMA_EVOLUTION_GUIDE.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/SCHEMA_EVOLUTION_GUIDE.md) | 5-phase zero-downtime schema evolution, timestamps, and slug stability |
| [`docs/MOBILE_DISTRIBUTION_GUIDE.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/MOBILE_DISTRIBUTION_GUIDE.md) | Capacitor packaging, Android App Links, iOS Universal Links, and native bridge |
| [`docs/APP_STORE_SUBMISSION_CHECKLIST.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/APP_STORE_SUBMISSION_CHECKLIST.md) | Google Play Store & Apple App Store submission metadata and compliance |
| [`docs/DEPLOYMENT_AND_OPERATIONS.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/DEPLOYMENT_AND_OPERATIONS.md) | Hosting headers, security policies, edge CDN rules, and rollbacks |
| [`docs/BACKUP_AND_RECOVERY.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/BACKUP_AND_RECOVERY.md) | Firestore automated export schedules, point-in-time recovery, and disaster runbook |
| [`docs/TROUBLESHOOTING.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/TROUBLESHOOTING.md) | Practical diagnostic runbook for builds, auth, permissions, and native errors |
| [`docs/RELEASE_PROCESS.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/RELEASE_PROCESS.md) | Solo maintainer release workflow, semver bumping, and changelog updates |
