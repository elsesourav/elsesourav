# Changelog

All notable changes to the **ElseSourav** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-28

### Added

- **Single-Publisher Architecture**: Production-ready software showcase, editorial journal, and user account system.
- **Application Catalogue**: Software showcase with categorization, tag filtering, media galleries, platform download links, and release versioning.
- **Personal User Library**: Authenticated user bookmarking and saved application collection.
- **Support & Ticketing Engine**: In-app customer support request creation, threaded messaging, and status tracking.
- **Centralized Error Logging & Diagnostics**: Telemetry pipeline routing through `ErrorLoggerService` with 10 typed error categories.
- **Admin Control Center**: Single-publisher administrative dashboard with live system health diagnostics, application lifecycle management, and audit logs.
- **Continuous Integration (CI/CD)**: GitHub Actions workflows for automated typechecking, linting, Vitest regression tests, Firestore Security Rules validation, and ephemeral PR preview channels.
- **Progressive Web App (PWA)**: Web App Manifest, Service Worker offline caching, and responsive cross-device layout.
- **SEO & Social Graph**: Dynamic meta tags, JSON-LD structured data, XML sitemap generation, and `robots.txt` discovery.

### Changed

- **Styling Architecture**: Premium dark glassmorphic design system using pure CSS custom properties with fluid typography and WCAG AA contrast tokens.
- **Firebase Web SDK 12 Integration**: Modular client initialization with deterministic test mocking and local emulator support.
- **Security Headers**: Deployed Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), nosniff, and frame protection in `firebase.json` and `_headers`.

### Fixed

- **Mobile Viewport Zooming**: Resolved iOS auto-zoom on input focus by standardizing mobile form font size to 16px.
- **Safe Area Insets**: Implemented `env(safe-area-inset-*)` tokens for notched mobile displays.
- **Search Relevancy**: Enhanced fuzzy and exact title scoring in global search query engine.

### Security

- **Strict Firestore Security Rules**: Granular role-based access control protecting administrative mutations, audit logs, and private user support tickets.
- **Deep Privacy Redaction**: Automatic stripping of passwords, tokens, API keys, credentials, and confidential messages from all error logs and telemetry.
- **HTML Sanitization**: Strict input escaping and sanitization across all rich text and markdown renderers.

### Performance

- **Deterministic Code Splitting**: Vite manual chunking separating React runtime, Firebase Auth, Firebase Firestore, and utility libraries.
- **Sub-Second Static Loading**: Fast edge delivery via global CDN hosting with immutable asset caching.
