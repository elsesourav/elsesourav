# ElseSourav Production Operational Incident Runbook

> **Platform**: ElseSourav  
> **Maintainer**: Sourav Mukherjee  
> **Target Audience**: Production Operator & Solo Maintainer  
> **Scope**: Incidents, Deployments, Rollbacks, Security Emergencies, and Disaster Recovery

---

## 1. Production Deployment Runbook

Follow this strict step-by-step checklist for every production deployment:

### Step 1: Environment & Secret Check
- Ensure local `.env.local` or CI environment secrets match the current production project (`elsesourav`).
- Verify Firebase CLI is authenticated:
  ```bash
  npx firebase projects:list
  ```

### Step 2: Turnkey Quality Gate (Mandatory)
Run the turnkey verification pipeline locally before deploying:
```bash
npm run validate
```
*Validation must exit with 0 errors across Typecheck, Lint, all 107 test suites, and production build.*

### Step 3: Preview Channel Smoke Test (Optional but Recommended)
Deploy to a temporary preview channel to verify live rendering:
```bash
npx firebase hosting:channel:deploy prelaunch-preview
```
Test the following critical paths on the preview URL:
- Home Hero & App Showcase.
- App Details & Download links.
- Sign in & Personal Library.
- Help Center article rendering & helpfulness vote.
- Support ticket creation.

### Step 4: Production Release Deployment
Deploy hosting assets, Firestore security rules, and composite indexes:
```bash
npx firebase deploy --only hosting,firestore
```

### Step 5: Live Smoke Test & Health Verification
1. Visit `https://elsesourav.com`.
2. Perform hard refresh (`Cmd + Shift + R`).
3. Verify public sitemap at `https://elsesourav.com/sitemap.xml`.
4. Log into `/admin` and review `/admin/diagnostics` for system health.

---

## 2. Failed Deployment & Immediate Rollback Runbook

If a new production release breaks critical functionality, execute an instant zero-downtime rollback:

```
[Incident Detected] ──► [Instant Hosting Rollback] ──► [Live Verification] ──► [Offline Root-Cause Investigation]
```

### 1. Instant Hosting Rollback
Firebase Hosting maintains immutable release versions. Roll back instantly:
1. Open **Firebase Console $\to$ Hosting $\to$ Release History**.
2. Locate the previous known-healthy release.
3. Click the three dots menu $\to$ **Rollback to this version**.
4. Or via CLI:
   ```bash
   npx firebase hosting:clone elsesourav:PREVIOUS_VERSION_ID elsesourav:live
   ```

### 2. Isolate Database vs. Frontend
- **CRITICAL INVARIANT**: Never delete or roll back production Firestore data due to a client-side bundle defect.
- Roll back the frontend static files first, then debug the application bundle offline.

---

## 3. Firestore Security Rules Incident Runbook

### Incident Signs:
- Public catalog queries failing with `FirebaseError: Missing or insufficient permissions`.
- Admin portal showing 403 errors across all tabs.

### Resolution Protocol:
1. **Never Blindly Open Rules**: Do NOT deploy open `allow read, write: if true;` rules under any circumstances.
2. **Revert to Stable Rules**: Re-deploy the checked-in, verified `firestore.rules` from `origin/main`:
   ```bash
   npm run test:rules
   npx firebase deploy --only firestore:rules
   ```
3. **Verify Access Matrix**:
   - Public can read published apps: `GET /apps/{appId}`.
   - Regular users cannot read other users' libraries: `GET /libraries/{otherUid}` (Denied).
   - Non-admins cannot edit apps: `PUT /apps/{appId}` (Denied).

---

## 4. Data Loss / Corruption Emergency Recovery

### Resolution Protocol:
1. **Halt Mutating Operations**: If a corrupted script is running, immediately terminate its execution.
2. **Run Non-Destructive Integrity Validator**:
   ```bash
   npm run db:validate
   ```
3. **Locate Latest Cloud Storage Export**:
   Check Google Cloud Storage bucket `gs://elsesourav-firestore-backups/` for the latest hourly/daily export.
4. **Restore Specific Collections**:
   Restore only the affected collection via Google Cloud SDK:
   ```bash
   gcloud firestore import gs://elsesourav-firestore-backups/YYYY-MM-DD-HH/ --collection-ids=apps,app_versions
   ```
5. **Re-Validate**:
   Re-run `npm run db:validate` to ensure all foreign keys and slugs are restored cleanly.

---

## 5. Authentication & Session Incident Runbook

| Symptom | Probable Cause | Action |
| :--- | :--- | :--- |
| **Login Fails: `auth/network-request-failed`** | Firebase Auth domain blocked by client CSP or network | Verify `connect-src` in `firebase.json` headers includes `https://identitytoolkit.googleapis.com`. |
| **Admin Login Fails: `403 Forbidden`** | User doc missing `"role": "admin"` | Set `"role": "admin"` on `/users/{uid}` in Firestore Console. |
| **Verification Email Not Arriving** | Cooldown active or Spam folder | Wait for 60s cooldown; check spam filter; inspect Firebase Auth quota. |
| **Session Drops on Refresh** | Browser third-party cookies or IndexedDB blocked | Ensure browser allows storage for `elsesourav.com`. |

---

## 6. PWA & Service Worker Cache Emergency

### Incident Signs:
- Users reporting seeing older version of the website after a deployment.

### Resolution Protocol:
1. **Increment Service Worker Cache Key**:
   Update the cache version string in `public/sw.js` (e.g., `CACHE_VERSION = 'v2'`).
2. **Deploy Service Worker Immediately**:
   ```bash
   npx firebase deploy --only hosting
   ```
3. **Client Hard Refresh**:
   Advise affected users to hard reload (`Cmd + Shift + R` on Mac, `Ctrl + F5` on Windows).

---

## 7. Mobile Release Emergency Runbook (Android & iOS)

### Bad Android Release (Google Play):
1. Open **Google Play Console $\to$ Release $\to$ Production**.
2. Click **Halt Rollout** if staged rollout was in progress.
3. If 100% rolled out: create a hotfix build with incremented `versionCode` in `android/app/build.gradle` and deploy an expedited release.
4. Deep links fallback automatically to the live website (`https://elsesourav.com`).

### Bad iOS Release (Apple App Store):
1. Open **App Store Connect $\to$ Apps $\to$ ElseSourav**.
2. Click **Remove from Sale** or reject pending release if not yet distributed.
3. Submit hotfix build with incremented `CURRENT_PROJECT_VERSION` in `ios/App/App/Info.plist`.

---

## 8. Security Incident Response Protocol

```
1. Detect Anomalous Traffic / Log Activity
2. Preserve Audit Logs & Telemetry
3. Rotate Firebase API Key HTTP Referrer Restrictions
4. Re-Verify Firestore Security Rules
5. Re-Deploy Known-Clean Build
```

### Steps:
1. **Preserve Evidence**: Export `/audit_logs` and Google Cloud Logging data.
2. **Rotate Credentials**: In Google Cloud Console $\to$ **APIs & Services $\to$ Credentials**:
   - Restrict Firebase API key to `https://elsesourav.com/*`.
3. **Verify Admin Accounts**: Ensure no unauthorized accounts possess `"role": "admin"` in `/users`.
4. **Deploy Clean Artifacts**: Build from a clean git commit on `origin/main` (`npm run validate`).

---

## 9. System Monitoring & Observability

Monitor these metrics continuously during operations:

- **Firebase Hosting Traffic**: Firebase Console $\to$ Hosting $\to$ Usage.
- **Firestore Operations & Quotas**: Firebase Console $\to$ Firestore $\to$ Usage (Reads/Writes/Deletes).
- **Admin Audit Trail**: In-app audit log at `/admin/audit-logs`.
- **System Diagnostics**: Built-in health diagnostic at `/admin/diagnostics`.

---

## 10. Emergency Support & Vendor Escalation

- **Google Cloud / Firebase Status**: [https://status.firebase.google.com](https://status.firebase.google.com)
- **Google Play Developer Console**: [https://play.google.com/console](https://play.google.com/console)
- **Apple App Store Connect**: [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- **Domain Registrar Portal**: Manage DNS, nameservers, and SSL records.

---

## 11. Post-Incident Review Template (Blameless Post-Mortem)

For any high-severity operational incident, document:

```markdown
# Incident Post-Mortem: [INCIDENT_TITLE]
- **Date**: YYYY-MM-DD
- **Severity**: HIGH / MEDIUM / LOW
- **Duration**: [e.g. 15 minutes]

### 1. Summary & Impact
What happened and how many users were impacted?

### 2. Root Cause
Why did the defect or failure occur?

### 3. Resolution & Timeline
- HH:MM — Incident detected via [Alert / User Report]
- HH:MM — Rollback initiated
- HH:MM — Normal service restored

### 4. Corrective Action & Prevention
- Added automated regression test in `src/tests/[test-name].test.ts`.
- Updated deployment checklist.
```
