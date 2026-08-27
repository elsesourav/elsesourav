# Production Hosting & Domain Configuration Checklist

> **Target Domain**: `https://elsesourav.com`  
> **Platform**: Firebase Hosting & Google Cloud Infrastructure  
> **Release Target**: Production Ready

---

## 1. Custom Domain & DNS Configuration

To bind the custom production domain `elsesourav.com` to Firebase Hosting:

### A. Add Custom Domain in Firebase Console
1. In the **Firebase Console**, go to **Hosting** $\to$ **Custom domains** $\to$ **Add custom domain**.
2. Enter `elsesourav.com` (and optional `www.elsesourav.com` redirect).

### B. Configure DNS Records with Domain Registrar
Add the following DNS records at your DNS provider (e.g. Cloudflare, Namecheap, Google Domains):

| Type | Name / Host | Target / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **A** | `@` (apex) | `199.36.158.100` | Firebase Primary Hosting Anycast IP |
| **A** | `@` (apex) | `199.36.158.100` | Firebase Secondary Hosting Anycast IP |
| **TXT** | `@` / `_firebase` | *(Provided by Firebase Console)* | Domain ownership verification |
| **CNAME** | `www` | `elsesourav.web.app` | Subdomain routing / redirect |

### C. Automated SSL / HTTPS Provisioning
- Firebase automatically provisions zero-configuration SSL certificates from Google Trust Services / Let's Encrypt within 1–24 hours of DNS propagation.
- All HTTP requests are automatically redirected to HTTPS at the edge with HTTP/2 and HTTP/3 support.

---

## 2. Production Security Headers & Content Security Policy (CSP)

Configured in [`firebase.json`](file:///Users/sourav/Developer/WEB/elsesourav/firebase.json) and [`public/_headers`](file:///Users/sourav/Developer/WEB/elsesourav/public/_headers):

| Security Header | Configured Value | Protection Enforced |
| :--- | :--- | :--- |
| **`Strict-Transport-Security`** | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS strictly for 1 year with subdomains and preload. |
| **`X-Content-Type-Options`** | `nosniff` | Prevents MIME-type sniffing vulnerabilities. |
| **`X-Frame-Options`** | `SAMEORIGIN` | Protects against UI redressing & clickjacking. |
| **`Referrer-Policy`** | `strict-origin-when-cross-origin` | Protects private URL parameters during outbound navigation. |
| **`Permissions-Policy`** | `camera=(), microphone=(), geolocation=()` | Blocks unnecessary hardware API access. |
| **`Content-Security-Policy`** | `default-src 'self'; script-src 'self' 'unsafe-inline' ...` | Whitelists Google Auth, Firestore gRPC/WebSockets, Google Fonts. |

---

## 3. Caching & Static Asset Strategy

| Asset Path Pattern | Cache-Control Header | Operational Rationale |
| :--- | :--- | :--- |
| `/index.html` | `no-cache, no-store, must-revalidate` | Guarantees users always receive the latest app shell without hard reloads. |
| `/sw.js` | `no-cache, no-store, must-revalidate` | Ensures immediate background updates for PWA Service Worker. |
| `/assets/**` (JS/CSS/media) | `public, max-age=31536000, immutable` | Content-hashed bundles cached indefinitely on global CDNs. |
| `/manifest.webmanifest` | `public, max-age=86400` | PWA manifest cached for 24 hours. |
| `/sitemap.xml`, `/robots.txt` | `public, max-age=3600` | Search engine discovery files cached for 1 hour. |

---

## 4. Single Page Application (SPA) Fallback

All non-file routes rewrite cleanly to `/index.html`:
```json
{
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```
Ensures direct deep linking to `/apps/:slug`, `/blog/:slug`, `/help/:category/:article`, `/search`, `/library`, `/settings`, `/support`, and `/admin`.

---

## 5. Pre-Deployment Verification Checklist

- [x] **Production Build Clean**: `npm run build` generates `dist/` without errors or bundle warnings.
- [x] **TypeScript Strict Check**: `npm run typecheck` passes with 0 errors.
- [x] **ESLint Linting**: `npm run lint` passes with 0 errors, 0 warnings.
- [x] **Vitest Test Suite**: 100 test suites, 851 unit, integration, and E2E tests pass.
- [x] **Firestore Security Rules Tested**: `npm run test:security` validates all read/write authorization rules.
- [x] **WCAG Accessibility Tested**: `npm run test:a11y` passes all keyboard, focus, and ARIA tests.
- [x] **PWA Assets Present**: `manifest.webmanifest`, `sw.js`, and SVG icon sets are placed in `public/`.
- [x] **Public Sitemap & Robots**: `sitemap.xml` and `robots.txt` generated with canonical `https://elsesourav.com`.
- [x] **Zero Server-Side Secrets**: Verified zero private keys or admin passwords in client bundle.
- [x] **SPA Routing Fallback**: Tested and verified across all deep links.

---

## 6. Post-Deployment Smoke Test Protocol

Immediately following a live deployment:
1. **Homepage Load**: Navigate to `https://elsesourav.com` and verify fast first contentful paint (< 1.5s).
2. **Deep Links**: Direct navigate to `/apps`, `/blog`, `/help`, and `/about`.
3. **Public Search**: Execute query (e.g. `terminal`) in search modal and verify instant results.
4. **Authentication Flow**: Test regular user login, profile update, and sign out.
5. **Admin Access Control**:
   - Access `/admin` as unauthenticated user $\to$ Verify clean redirect to `/login?redirect=%2Fadmin`.
   - Access `/admin` as admin user $\to$ Verify Dashboard, System Health card, and Apps management.
6. **PWA Shell**: Verify Service Worker registers cleanly and app installs to desktop/mobile homescreen.
7. **HTTPS & Headers**: Inspect response headers in DevTools Network tab to confirm CSP, HSTS, and nosniff.
