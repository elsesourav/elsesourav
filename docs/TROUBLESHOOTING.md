# Practical Troubleshooting & Diagnostic Runbook

> **Platform**: ElseSourav  
> **Target Audience**: Maintainer & Developers

---

## 1. Firebase Configuration & Initialization Issues

### Issue: `[ElseSourav Environment Error] Missing or invalid client configuration`

- **Cause**: Required Vite environment variables are missing from `.env.local` or process environment.
- **Solution**:
  1. Verify `.env.local` exists in the repository root.
  2. Ensure all required keys from `.env.example` are present:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_APP_ID`
  3. Restart the Vite dev server (`npm run dev`).

---

## 2. Authentication & Admin Authorization Issues

### Issue: "Admin Access Required" (403 Forbidden) on `/admin`

- **Cause**: The authenticated user document in Firestore does not have `"role": "admin"`.
- **Solution**:
  1. Open Firebase Console $\to$ **Firestore Database** $\to$ `users` collection.
  2. Locate the document matching your Auth UID (`/users/{uid}`).
  3. Set or update field: `"role": "admin"`.
  4. Sign out and sign back in on the web app to refresh the local auth context.

### Issue: Email verification resend is disabled or shows "Please wait"

- **Cause**: Built-in 60-second rate-limiting cooldown protects against spam and email quota exhaustion.
- **Solution**: Wait until the 60-second cooldown timer reaches 0 before triggering another verification email.

---

## 3. Firestore Permission Denied (`PERMISSION_DENIED`)

### Issue: Client gets `FirebaseError: Missing or insufficient permissions`

- **Cause**: Action violates `firestore.rules`.
- **Checklist**:
  1. Are you trying to update an app or blog post as an unauthenticated or non-admin user?
  2. Are you reading private support tickets belonging to another user ID?
  3. Run local security rules test suite to pinpoint the exact rule violation:
     ```bash
     npm run test:rules
     ```

---

## 4. Local Build & Test Failures

### Issue: `error TS2339 / TS2322` during `npm run typecheck` or `npm run build`

- **Cause**: TypeScript strict check failure.
- **Solution**:
  1. Run `npx tsc --noEmit` to get the line number and exact diagnostic.
  2. Check for missing optional properties or union types.
  3. Ensure no `any` was introduced (enforced by ESLint rule `@typescript-eslint/no-explicit-any`).

---

## 5. Android Gradle Build Issues

### Issue: `error: invalid source release: 21` during `./gradlew assembleDebug`

- **Cause**: Gradle subprojects attempting to compile against Java 21 when the system has Java 17 installed.
- **Solution**:
  - Verify `android/build.gradle` and `android/app/build.gradle` enforce `sourceCompatibility JavaVersion.VERSION_17` and `targetCompatibility JavaVersion.VERSION_17`.

---

## 6. iOS Xcode Project Issues

### Issue: `xcode-select: error: tool 'xcodebuild' requires Xcode...`

- **Cause**: The active developer directory is set to Command Line Tools rather than Xcode.app.
- **Solution**:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

---

## 7. Service Worker & PWA Caching Issues

### Issue: Web browser shows stale version of application after deploying updates

- **Cause**: Service worker cache holding previous index.html shell.
- **Solution**:
  1. Hard refresh browser: `Cmd + Shift + R` (macOS) or `Ctrl + F5` (Windows).
  2. In Chrome DevTools $\to$ **Application** $\to$ **Service Workers** $\to$ Click **Unregister** and **Clear storage data**.

---

## 8. Database Referential Integrity Validation

To detect duplicate slugs, broken category/tag links, or invalid URLs in your database:

```bash
npm run db:validate
```
